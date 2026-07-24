"""
Tests for auditing module — covers AuditLog model, append-only semantics,
filtering by entity_type/entity_id, and API endpoints.
Authored by: Obsan (primary) | Reviewed by: both
"""
import uuid
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User, Role, UserRole
from apps.auditing.models import AuditLog


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user_with_role(email, role_name='ADMIN'):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Audit', last_name='User'
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_audit_log(user, entity_type='PR', action='CREATED',
                   old_status=None, new_status='DRAFT'):
    entity_id = uuid.uuid4()
    return AuditLog.objects.create(
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_status=old_status,
        new_status=new_status,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class AuditLogModelTest(TestCase):
    def setUp(self):
        self.user = make_user_with_role('audit_model@test.com')

    def test_audit_log_str(self):
        log = make_audit_log(self.user)
        self.assertIn('CREATED', str(log))
        self.assertIn('PR', str(log))

    def test_audit_log_uuid_pk(self):
        log = make_audit_log(self.user)
        self.assertIsInstance(log.pk, uuid.UUID)

    def test_audit_log_entity_id_is_uuid(self):
        log = make_audit_log(self.user)
        self.assertIsInstance(log.entity_id, uuid.UUID)

    def test_audit_log_records_old_and_new_status(self):
        log = AuditLog.objects.create(
            user=self.user, action='STATUS_CHANGED',
            entity_type='PR', entity_id=uuid.uuid4(),
            old_status='DRAFT', new_status='SUBMITTED'
        )
        self.assertEqual(log.old_status, 'DRAFT')
        self.assertEqual(log.new_status, 'SUBMITTED')

    def test_audit_log_can_have_null_user(self):
        """System-generated entries may have no user."""
        log = AuditLog.objects.create(
            user=None, action='SYSTEM_EVENT',
            entity_type='PO', entity_id=uuid.uuid4(),
            new_status='PO_CREATED'
        )
        self.assertIsNone(log.user)

    def test_audit_log_can_store_extra_data(self):
        log = AuditLog.objects.create(
            user=self.user, action='CREATED',
            entity_type='RFQ', entity_id=uuid.uuid4(),
            new_status='DRAFT',
            extra_data={'ip': '127.0.0.1', 'browser': 'Chrome'},
        )
        self.assertEqual(log.extra_data['ip'], '127.0.0.1')

    def test_audit_log_ordering_by_timestamp_desc(self):
        log1 = make_audit_log(self.user, action='FIRST')
        log2 = make_audit_log(self.user, action='SECOND')
        logs = list(AuditLog.objects.all())
        # Most recent should be first (ordering = ['-timestamp'])
        self.assertEqual(logs[0].action, 'SECOND')

    def test_multiple_logs_for_same_entity(self):
        entity_id = uuid.uuid4()
        for action in ['CREATED', 'SUBMITTED', 'APPROVED']:
            AuditLog.objects.create(
                user=self.user, action=action,
                entity_type='PR', entity_id=entity_id,
                new_status=action,
            )
        self.assertEqual(AuditLog.objects.filter(entity_id=entity_id).count(), 3)


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class AuditLogAPITest(APITestCase):
    def setUp(self):
        self.admin = make_user_with_role('audit_api_admin@test.com', 'ADMIN')
        self.requester = make_user_with_role('audit_api_req@test.com', 'REQUESTER')
        self.list_url = '/api/audit-logs/'

    def test_unauthenticated_cannot_access(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_list_audit_logs(self):
        make_audit_log(self.admin)
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_audit_log_is_read_only(self):
        """AuditLog endpoint should not allow POST (ReadOnlyModelViewSet)."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post(self.list_url, {
            'action': 'CREATED', 'entity_type': 'PR',
            'entity_id': str(uuid.uuid4()), 'new_status': 'DRAFT',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_retrieve_single_audit_log(self):
        log = make_audit_log(self.admin)
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get(f'{self.list_url}{log.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['action'], 'CREATED')
        self.assertEqual(resp.data['entity_type'], 'PR')

    def test_filter_by_entity_type(self):
        make_audit_log(self.admin, entity_type='PR')
        make_audit_log(self.admin, entity_type='PO')
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get(f'{self.list_url}?entity_type=PO')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for log in resp.data['results']:
            self.assertEqual(log['entity_type'], 'PO')

    def test_filter_by_action(self):
        make_audit_log(self.admin, action='CREATED')
        make_audit_log(self.admin, action='APPROVED')
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get(f'{self.list_url}?action=CREATED')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for log in resp.data['results']:
            self.assertEqual(log['action'], 'CREATED')
