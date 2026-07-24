"""
Tests for approvals module — covers Approval model, workflow-driven
APPROVE/REJECT/RETURN actions for both PR and PO entities, and API endpoints.
Authored by: Mary (primary) | Reviewed by: both
"""
import datetime
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User, Role, UserRole
from apps.organizations.models import Organization, Department
from apps.procurement.models import PurchaseRequisition
from apps.suppliers.models import Supplier
from apps.rfq.models import RFQ
from apps.bids.models import Bid
from apps.orders.models import PurchaseOrder
from apps.approvals.models import Approval


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org_dept():
    org = Organization.objects.create(name='Approvals Org', code='APPR-ORG')
    dept = Department.objects.create(name='Approvals Dept', code='APPR-DEPT', organization=org)
    return org, dept


def make_user_with_role(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Test', last_name='User', department=dept
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_pr(requester, dept, st='SUBMITTED'):
    return PurchaseRequisition.objects.create(
        requester=requester, department=dept,
        title='Approval PR', description='Test', status=st
    )


def make_supplier():
    return Supplier.objects.create(
        legal_name='Approval Supplier', contact_person='Rep',
        email='apprsup@test.com', phone='+25190000001'
    )


def make_po(pr, supplier, created_by, st='PO_CREATED'):
    rfq = RFQ.objects.create(
        purchase_requisition=pr,
        title='RFQ for Approval',
        submission_deadline=datetime.date.today() + datetime.timedelta(days=7),
        status='CLOSED',
        created_by=created_by,
    )
    bid = Bid.objects.create(
        rfq=rfq, supplier=supplier, bid_date=datetime.date.today(),
        grand_total='5000.00', is_winner=True, submitted_by=created_by
    )
    po = PurchaseOrder.objects.create(
        purchase_requisition=pr, rfq=rfq, winning_bid=bid,
        supplier=supplier, subtotal='4700.00', freight_cost='200.00',
        insurance_cost='100.00', tax_amount='0.00', total_amount='5000.00',
        created_by=created_by, status=st,
    )
    return po


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class ApprovalModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.budget_holder = make_user_with_role('apprmodel_bh@test.com', 'BUDGET_HOLDER', self.dept)
        self.req = make_user_with_role('apprmodel_req@test.com', 'REQUESTER', self.dept)
        self.pr = make_pr(self.req, self.dept)

    def test_approval_str(self):
        approval = Approval.objects.create(
            entity_type='PR',
            entity_id=self.pr.pk,
            approver=self.budget_holder,
            role='BUDGET_HOLDER',
            action='APPROVE',
            previous_status='SUBMITTED',
            new_status='APPROVED',
        )
        self.assertIn('PR', str(approval))
        self.assertIn('APPROVE', str(approval))

    def test_approval_uuid_pk(self):
        approval = Approval.objects.create(
            entity_type='PR', entity_id=self.pr.pk,
            approver=self.budget_holder, role='BUDGET_HOLDER',
            action='REJECT', previous_status='SUBMITTED', new_status='REJECTED',
        )
        import uuid
        self.assertIsInstance(approval.pk, uuid.UUID)

    def test_approval_action_choices(self):
        valid = [c[0] for c in Approval.ACTION_CHOICES]
        self.assertIn('APPROVE', valid)
        self.assertIn('REJECT', valid)
        self.assertIn('RETURN', valid)

    def test_approval_entity_type_choices(self):
        valid = [c[0] for c in Approval.ENTITY_TYPE_CHOICES]
        self.assertIn('PR', valid)
        self.assertIn('PO', valid)

    def test_multiple_approvals_per_entity(self):
        for action in ['RETURN', 'APPROVE']:
            Approval.objects.create(
                entity_type='PR', entity_id=self.pr.pk,
                approver=self.budget_holder, role='BUDGET_HOLDER',
                action=action, previous_status='SUBMITTED', new_status='APPROVED',
            )
        self.assertEqual(Approval.objects.filter(entity_id=self.pr.pk).count(), 2)


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class ApprovalAPITest(APITestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.budget_holder = make_user_with_role('apprapi_bh@test.com', 'BUDGET_HOLDER', self.dept)
        self.proc = make_user_with_role('apprapi_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('apprapi_req@test.com', 'REQUESTER', self.dept)
        self.fin = make_user_with_role('apprapi_fin@test.com', 'FINANCIAL_REVIEWER', self.dept)
        self.supplier = make_supplier()

    def test_approve_pr(self):
        pr = make_pr(self.req, self.dept, 'SUBMITTED')
        self.client.force_authenticate(user=self.budget_holder)
        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'PR',
            'entity_id': str(pr.pk),
            'comment': 'Looks good.',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['new_status'], 'APPROVED')
        self.assertEqual(resp.data['previous_status'], 'SUBMITTED')
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'APPROVED')

    def test_reject_pr(self):
        pr = make_pr(self.req, self.dept, 'SUBMITTED')
        self.client.force_authenticate(user=self.budget_holder)
        resp = self.client.post('/api/approvals/reject/', {
            'entity_type': 'PR',
            'entity_id': str(pr.pk),
            'comment': 'Not approved.',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['new_status'], 'REJECTED')
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'REJECTED')

    def test_return_pr(self):
        pr = make_pr(self.req, self.dept, 'SUBMITTED')
        self.client.force_authenticate(user=self.budget_holder)
        resp = self.client.post('/api/approvals/return-entity/', {
            'entity_type': 'PR',
            'entity_id': str(pr.pk),
            'comment': 'Needs revision.',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['new_status'], 'RETURNED')
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'RETURNED')

    def test_approve_invalid_entity_type_returns_400(self):
        self.client.force_authenticate(user=self.budget_holder)
        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'INVALID',
            'entity_id': '00000000-0000-0000-0000-000000000000',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_missing_entity_id_returns_400(self):
        self.client.force_authenticate(user=self.budget_holder)
        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'PR',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_nonexistent_pr_returns_404(self):
        import uuid
        self.client.force_authenticate(user=self.budget_holder)
        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'PR',
            'entity_id': str(uuid.uuid4()),
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_cannot_approve(self):
        pr = make_pr(self.req, self.dept, 'SUBMITTED')
        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'PR',
            'entity_id': str(pr.pk),
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_wrong_role_cannot_approve_pr(self):
        """REQUESTER cannot approve a PR — wrong role."""
        pr = make_pr(self.req, self.dept, 'SUBMITTED')
        self.client.force_authenticate(user=self.req)
        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'PR',
            'entity_id': str(pr.pk),
        }, format='json')
        # Should fail because WorkflowEngine rejects the role
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_approvals(self):
        pr = make_pr(self.req, self.dept, 'SUBMITTED')
        Approval.objects.create(
            entity_type='PR', entity_id=pr.pk,
            approver=self.budget_holder, role='BUDGET_HOLDER',
            action='APPROVE', previous_status='SUBMITTED', new_status='APPROVED',
        )
        self.client.force_authenticate(user=self.budget_holder)
        resp = self.client.get('/api/approvals/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_approve_po_at_financial_review_stage(self):
        pr = make_pr(self.req, self.dept, 'PROCUREMENT_PROCESSING')
        po = make_po(pr, self.supplier, self.proc, 'FINANCIAL_REVIEW')
        self.client.force_authenticate(user=self.fin)
        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'PO',
            'entity_id': str(po.pk),
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['new_status'], 'FINANCIAL_APPROVED')
