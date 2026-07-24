"""
Tests for notifications module — covers Notification model, per-user filtering,
mark-read / mark-all-read actions, and API endpoints.
Authored by: Mary (primary) | Reviewed by: both
"""
import uuid
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User, Role, UserRole
from apps.notifications.models import Notification


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user_with_role(email, role_name='REQUESTER'):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Notify', last_name='User'
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_notification(recipient, title='Test Notification', is_read=False):
    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message='This is a test notification message.',
        is_read=is_read,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = make_user_with_role('notif_model@test.com')

    def test_notification_str(self):
        n = make_notification(self.user, 'PR Submitted')
        self.assertIn('PR Submitted', str(n))
        self.assertIn('notif_model@test.com', str(n))

    def test_notification_uuid_pk(self):
        n = make_notification(self.user)
        self.assertIsInstance(n.pk, uuid.UUID)

    def test_notification_default_is_unread(self):
        n = make_notification(self.user)
        self.assertFalse(n.is_read)

    def test_notification_can_store_entity_info(self):
        entity_id = uuid.uuid4()
        n = Notification.objects.create(
            recipient=self.user,
            title='PO Approved',
            message='Your purchase order has been approved.',
            entity_type='PO',
            entity_id=entity_id,
        )
        self.assertEqual(n.entity_type, 'PO')
        self.assertEqual(n.entity_id, entity_id)

    def test_notification_can_have_null_entity(self):
        n = Notification.objects.create(
            recipient=self.user,
            title='System Message',
            message='Welcome to PMP.',
        )
        self.assertIsNone(n.entity_type)
        self.assertIsNone(n.entity_id)

    def test_notification_ordering_newest_first(self):
        make_notification(self.user, 'First')
        make_notification(self.user, 'Second')
        notifs = list(Notification.objects.all())
        self.assertEqual(notifs[0].title, 'Second')

    def test_multiple_notifications_per_user(self):
        for i in range(5):
            make_notification(self.user, f'Notification {i}')
        self.assertEqual(Notification.objects.filter(recipient=self.user).count(), 5)

    def test_cascade_delete_with_user(self):
        user2 = make_user_with_role('notif_del@test.com', 'BUDGET_HOLDER')
        user2_id = user2.pk
        make_notification(user2, 'Will be deleted')
        user2.delete()
        self.assertEqual(Notification.objects.filter(recipient_id=user2_id).count(), 0)


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class NotificationAPITest(APITestCase):
    def setUp(self):
        self.user1 = make_user_with_role('notifapi1@test.com', 'REQUESTER')
        self.user2 = make_user_with_role('notifapi2@test.com', 'BUDGET_HOLDER')
        self.list_url = '/api/notifications/'

    def test_unauthenticated_cannot_access(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_sees_only_own_notifications(self):
        make_notification(self.user1, 'User 1 Notif')
        make_notification(self.user2, 'User 2 Notif')
        self.client.force_authenticate(user=self.user1)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 1)
        self.assertEqual(resp.data['results'][0]['title'], 'User 1 Notif')

    def test_mark_single_notification_as_read(self):
        n = make_notification(self.user1, 'Unread Notification')
        self.assertFalse(n.is_read)
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post(f'{self.list_url}{n.pk}/mark-read/', {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'marked as read')
        n.refresh_from_db()
        self.assertTrue(n.is_read)

    def test_mark_all_notifications_as_read(self):
        make_notification(self.user1, 'Notif A')
        make_notification(self.user1, 'Notif B')
        make_notification(self.user1, 'Notif C')
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post(f'{self.list_url}mark-all-read/', {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'all marked as read')
        unread_count = Notification.objects.filter(recipient=self.user1, is_read=False).count()
        self.assertEqual(unread_count, 0)

    def test_mark_all_read_only_affects_own_notifications(self):
        n1 = make_notification(self.user1, 'User1 notif')
        n2 = make_notification(self.user2, 'User2 notif')
        self.client.force_authenticate(user=self.user1)
        self.client.post(f'{self.list_url}mark-all-read/', {}, format='json')
        n1.refresh_from_db()
        n2.refresh_from_db()
        self.assertTrue(n1.is_read)
        self.assertFalse(n2.is_read)

    def test_empty_notification_list(self):
        self.client.force_authenticate(user=self.user1)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 0)

    def test_cannot_mark_other_users_notification_as_read(self):
        n = make_notification(self.user2, 'User2 private notif')
        self.client.force_authenticate(user=self.user1)
        resp = self.client.post(f'{self.list_url}{n.pk}/mark-read/', {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
