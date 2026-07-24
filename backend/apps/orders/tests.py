"""
Tests for orders module — covers PurchaseOrder, PurchaseOrderLine models,
PO generation from winning bid, workflow transitions, and API endpoints.
Authored by: Obsan (primary) | Reviewed by: both
"""
import datetime
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User, Role, UserRole
from apps.organizations.models import Organization, Department
from apps.procurement.models import PurchaseRequisition
from apps.suppliers.models import Supplier
from apps.rfq.models import RFQ, RFQLine
from apps.bids.models import Bid, BidLine
from apps.orders.models import PurchaseOrder, PurchaseOrderLine


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org_dept():
    org = Organization.objects.create(name='Orders Org', code='ORD-ORG')
    dept = Department.objects.create(name='Orders Dept', code='ORD-DEPT', organization=org)
    return org, dept


def make_user_with_role(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Test', last_name='User', department=dept
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_supplier(name='PO Supplier', email='posup@test.com'):
    return Supplier.objects.create(
        legal_name=name, contact_person='Rep',
        email=email, phone='+25190000001', status='ACTIVE'
    )


def make_pr(requester, dept):
    return PurchaseRequisition.objects.create(
        requester=requester, department=dept,
        title='PR for PO Test', description='Test', status='PROCUREMENT_PROCESSING'
    )


def make_rfq(pr, created_by):
    return RFQ.objects.create(
        purchase_requisition=pr,
        title='RFQ for PO',
        submission_deadline=datetime.date.today() + datetime.timedelta(days=7),
        status='CLOSED',
        created_by=created_by,
    )


def make_bid(rfq, supplier, grand_total='10000.00', submitter=None,
             freight='500.00', insurance='200.00', tax='0.00'):
    return Bid.objects.create(
        rfq=rfq, supplier=supplier, bid_date=datetime.date.today(),
        grand_total=grand_total, freight_cost=freight,
        insurance_cost=insurance, tax_amount=tax,
        is_winner=True, submitted_by=submitter,
    )


def make_rfq_line(rfq, item='Server', qty='2.00'):
    return RFQLine.objects.create(rfq=rfq, item_name=item, quantity=qty)


def make_bid_line(bid, rfq_line, qty='2.00', unit='4650.00', total='9300.00'):
    return BidLine.objects.create(
        bid=bid, rfq_line=rfq_line,
        quantity_offered=qty, unit_price=unit, total_price=total
    )


def make_po(pr, rfq, bid, supplier, created_by):
    return PurchaseOrder.objects.create(
        purchase_requisition=pr,
        rfq=rfq,
        winning_bid=bid,
        supplier=supplier,
        subtotal='9300.00',
        freight_cost='500.00',
        insurance_cost='200.00',
        tax_amount='0.00',
        total_amount='10000.00',
        created_by=created_by,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class PurchaseOrderModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('pomodelproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('pomodelreq@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)
        self.bid = make_bid(self.rfq, self.supplier, submitter=self.proc)

    def test_po_auto_generates_number(self):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        self.assertTrue(po.po_number.startswith('PO-'))

    def test_po_default_status_is_po_created(self):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        self.assertEqual(po.status, 'PO_CREATED')

    def test_po_uuid_pk(self):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        import uuid
        self.assertIsInstance(po.pk, uuid.UUID)

    def test_po_str(self):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        self.assertIn(po.po_number, str(po))
        self.assertIn('PO Supplier', str(po))

    def test_po_linked_to_pr(self):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        self.assertEqual(po.purchase_requisition, self.pr)

    def test_po_linked_to_supplier(self):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        self.assertEqual(po.supplier, self.supplier)

    def test_po_status_choices_are_valid(self):
        valid = [c[0] for c in PurchaseOrder.STATUS_CHOICES]
        expected = ['PO_CREATED', 'FINANCIAL_REVIEW', 'FINANCIAL_APPROVED',
                    'FINAL_APPROVAL', 'PO_APPROVED', 'REJECTED', 'GOODS_RECEIVED']
        for s in expected:
            self.assertIn(s, valid)


class PurchaseOrderLineModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('polineproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('polinereq@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier('LineSupplier PO', 'polinesup@test.com')
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)
        self.bid = make_bid(self.rfq, self.supplier, submitter=self.proc)
        self.po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)

    def test_po_line_str(self):
        line = PurchaseOrderLine.objects.create(
            purchase_order=self.po,
            item_name='Server',
            quantity='2.00',
            unit_price='4650.00',
            total_price='9300.00'
        )
        self.assertIn('Server', str(line))

    def test_po_line_cascade_delete_with_po(self):
        PurchaseOrderLine.objects.create(
            purchase_order=self.po, item_name='Server',
            quantity='2.00', unit_price='4650.00', total_price='9300.00'
        )
        po_id = self.po.pk
        self.po.delete()
        self.assertEqual(PurchaseOrderLine.objects.filter(purchase_order_id=po_id).count(), 0)


# ---------------------------------------------------------------------------
# PO Workflow tests
# ---------------------------------------------------------------------------

class POWorkflowTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('powfproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('powfreq@test.com', 'REQUESTER', self.dept)
        self.fin = make_user_with_role('powffin@test.com', 'FINANCIAL_REVIEWER', self.dept)
        self.budget = make_user_with_role('powfbudget@test.com', 'BUDGET_HOLDER', self.dept)
        self.warehouse = make_user_with_role('powfwh@test.com', 'WAREHOUSE_OFFICER', self.dept)
        self.supplier = make_supplier('WF Supplier', 'wfsup@test.com')
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)
        self.bid = make_bid(self.rfq, self.supplier, submitter=self.proc)

    def _make_po(self, status_='PO_CREATED'):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        po.status = status_
        po.save()
        return po

    def test_po_created_to_financial_review(self):
        from apps.core.workflow import WorkflowEngine
        po = self._make_po('PO_CREATED')
        WorkflowEngine.transition('PO', po, 'submit_for_review', 'PROCUREMENT_OFFICER')
        self.assertEqual(po.status, 'FINANCIAL_REVIEW')

    def test_financial_review_approve(self):
        from apps.core.workflow import WorkflowEngine
        po = self._make_po('FINANCIAL_REVIEW')
        WorkflowEngine.transition('PO', po, 'approve_financial', 'FINANCIAL_REVIEWER')
        self.assertEqual(po.status, 'FINANCIAL_APPROVED')

    def test_financial_review_return(self):
        from apps.core.workflow import WorkflowEngine
        po = self._make_po('FINANCIAL_REVIEW')
        WorkflowEngine.transition('PO', po, 'return', 'FINANCIAL_REVIEWER')
        self.assertEqual(po.status, 'PO_CREATED')

    def test_financial_approved_to_final_approval(self):
        from apps.core.workflow import WorkflowEngine
        po = self._make_po('FINANCIAL_APPROVED')
        WorkflowEngine.transition('PO', po, 'submit_final', 'PROCUREMENT_OFFICER')
        self.assertEqual(po.status, 'FINAL_APPROVAL')

    def test_final_approval_approve(self):
        from apps.core.workflow import WorkflowEngine
        po = self._make_po('FINAL_APPROVAL')
        WorkflowEngine.transition('PO', po, 'approve', 'BUDGET_HOLDER')
        self.assertEqual(po.status, 'PO_APPROVED')

    def test_final_approval_reject(self):
        from apps.core.workflow import WorkflowEngine
        po = self._make_po('FINAL_APPROVAL')
        WorkflowEngine.transition('PO', po, 'reject', 'BUDGET_HOLDER')
        self.assertEqual(po.status, 'REJECTED')

    def test_po_approved_to_goods_received(self):
        from apps.core.workflow import WorkflowEngine
        po = self._make_po('PO_APPROVED')
        WorkflowEngine.transition('PO', po, 'receive', 'WAREHOUSE_OFFICER')
        self.assertEqual(po.status, 'GOODS_RECEIVED')

    def test_invalid_transition_raises(self):
        from apps.core.workflow import WorkflowEngine
        from apps.core.exceptions import InvalidTransitionError
        po = self._make_po('PO_CREATED')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('PO', po, 'approve', 'BUDGET_HOLDER')


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class PurchaseOrderAPITest(APITestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('poapiproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('poapireq@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier('API Supplier PO', 'poapisup@test.com')
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)
        self.rfq_line = make_rfq_line(self.rfq)
        self.bid = make_bid(self.rfq, self.supplier, submitter=self.proc)
        self.bid_line = make_bid_line(self.bid, self.rfq_line)
        self.list_url = '/api/purchase-orders/'

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_generate_po_from_winning_bid(self):
        self.client.force_authenticate(user=self.proc)
        url = '/api/purchase-orders/generate-from-bid/'
        resp = self.client.post(url, {'bid_id': str(self.bid.pk)}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.data['po_number'].startswith('PO-'))
        self.assertEqual(resp.data['status'], 'PO_CREATED')

    def test_generate_po_requires_bid_id(self):
        self.client.force_authenticate(user=self.proc)
        url = '/api/purchase-orders/generate-from-bid/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_generate_po_with_nonexistent_bid(self):
        self.client.force_authenticate(user=self.proc)
        url = '/api/purchase-orders/generate-from-bid/'
        import uuid
        resp = self.client.post(url, {'bid_id': str(uuid.uuid4())}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_submit_po_for_review(self):
        po = make_po(self.pr, self.rfq, self.bid, self.supplier, self.proc)
        self.client.force_authenticate(user=self.proc)
        url = f'{self.list_url}{po.pk}/submit-for-review/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'FINANCIAL_REVIEW')
