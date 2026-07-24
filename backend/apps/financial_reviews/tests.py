"""
Tests for financial_reviews module — covers FinancialReview model,
APPROVED/RETURNED decision logic, status transitions on PO, and API endpoints.
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
from apps.financial_reviews.models import FinancialReview


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org_dept():
    org = Organization.objects.create(name='FinRev Org', code='FIN-ORG')
    dept = Department.objects.create(name='FinRev Dept', code='FIN-DEPT', organization=org)
    return org, dept


def make_user_with_role(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Test', last_name='User', department=dept
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_supplier():
    return Supplier.objects.create(
        legal_name='FinRev Supplier', contact_person='Rep',
        email='finrevsup@test.com', phone='+25190000001'
    )


def make_po(requester, dept, proc, supplier, st='FINANCIAL_REVIEW'):
    pr = PurchaseRequisition.objects.create(
        requester=requester, department=dept,
        title='FinRev PR', description='Test', status='PROCUREMENT_PROCESSING'
    )
    rfq = RFQ.objects.create(
        purchase_requisition=pr,
        title='RFQ for FinRev',
        submission_deadline=datetime.date.today() + datetime.timedelta(days=7),
        status='CLOSED',
        created_by=proc,
    )
    bid = Bid.objects.create(
        rfq=rfq, supplier=supplier, bid_date=datetime.date.today(),
        grand_total='15000.00', is_winner=True, submitted_by=proc
    )
    return PurchaseOrder.objects.create(
        purchase_requisition=pr, rfq=rfq, winning_bid=bid,
        supplier=supplier, subtotal='14000.00', freight_cost='600.00',
        insurance_cost='400.00', tax_amount='0.00', total_amount='15000.00',
        created_by=proc, status=st,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class FinancialReviewModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('frmodel_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.fin = make_user_with_role('frmodel_fin@test.com', 'FINANCIAL_REVIEWER', self.dept)
        self.req = make_user_with_role('frmodel_req@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()
        self.po = make_po(self.req, self.dept, self.proc, self.supplier)

    def test_financial_review_str(self):
        review = FinancialReview.objects.create(
            purchase_order=self.po,
            reviewer=self.fin,
            decision='APPROVED',
            previous_status='FINANCIAL_REVIEW',
            new_status='FINANCIAL_APPROVED',
        )
        self.assertIn(self.po.po_number, str(review))
        self.assertIn('APPROVED', str(review))

    def test_financial_review_uuid_pk(self):
        review = FinancialReview.objects.create(
            purchase_order=self.po, reviewer=self.fin,
            decision='APPROVED', previous_status='FINANCIAL_REVIEW',
            new_status='FINANCIAL_APPROVED',
        )
        import uuid
        self.assertIsInstance(review.pk, uuid.UUID)

    def test_decision_choices(self):
        valid = [c[0] for c in FinancialReview.DECISION_CHOICES]
        self.assertIn('APPROVED', valid)
        self.assertIn('RETURNED', valid)

    def test_review_linked_to_po(self):
        review = FinancialReview.objects.create(
            purchase_order=self.po, reviewer=self.fin,
            decision='RETURNED', previous_status='FINANCIAL_REVIEW',
            new_status='PO_CREATED',
        )
        self.assertEqual(review.purchase_order, self.po)


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class FinancialReviewAPITest(APITestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('frapi_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.fin = make_user_with_role('frapi_fin@test.com', 'FINANCIAL_REVIEWER', self.dept)
        self.req = make_user_with_role('frapi_req@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()

    def test_unauthenticated_cannot_access(self):
        resp = self.client.get('/api/financial-reviews/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_financial_reviewer_can_approve_po(self):
        po = make_po(self.req, self.dept, self.proc, self.supplier, 'FINANCIAL_REVIEW')
        self.client.force_authenticate(user=self.fin)
        resp = self.client.post('/api/financial-reviews/review/', {
            'purchase_order': str(po.pk),
            'decision': 'APPROVED',
            'comments': 'Budget available.',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['new_status'], 'FINANCIAL_APPROVED')
        po.refresh_from_db()
        self.assertEqual(po.status, 'FINANCIAL_APPROVED')

    def test_financial_reviewer_can_return_po(self):
        po = make_po(self.req, self.dept, self.proc, self.supplier, 'FINANCIAL_REVIEW')
        self.client.force_authenticate(user=self.fin)
        resp = self.client.post('/api/financial-reviews/review/', {
            'purchase_order': str(po.pk),
            'decision': 'RETURNED',
            'comments': 'Budget insufficient. Revise.',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['new_status'], 'PO_CREATED')
        po.refresh_from_db()
        self.assertEqual(po.status, 'PO_CREATED')

    def test_review_requires_purchase_order_and_decision(self):
        self.client.force_authenticate(user=self.fin)
        resp = self.client.post('/api/financial-reviews/review/', {
            'comments': 'Missing required fields.',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_review_nonexistent_po_returns_404(self):
        import uuid
        self.client.force_authenticate(user=self.fin)
        resp = self.client.post('/api/financial-reviews/review/', {
            'purchase_order': str(uuid.uuid4()),
            'decision': 'APPROVED',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_review_creates_financial_review_record(self):
        po = make_po(self.req, self.dept, self.proc, self.supplier, 'FINANCIAL_REVIEW')
        self.client.force_authenticate(user=self.fin)
        self.client.post('/api/financial-reviews/review/', {
            'purchase_order': str(po.pk),
            'decision': 'APPROVED',
        }, format='json')
        self.assertEqual(FinancialReview.objects.filter(purchase_order=po).count(), 1)
        review = FinancialReview.objects.get(purchase_order=po)
        self.assertEqual(review.decision, 'APPROVED')
        self.assertEqual(review.reviewer, self.fin)

    def test_list_financial_reviews(self):
        po = make_po(self.req, self.dept, self.proc, self.supplier, 'FINANCIAL_REVIEW')
        FinancialReview.objects.create(
            purchase_order=po, reviewer=self.fin,
            decision='APPROVED', previous_status='FINANCIAL_REVIEW',
            new_status='FINANCIAL_APPROVED',
        )
        self.client.force_authenticate(user=self.fin)
        resp = self.client.get('/api/financial-reviews/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)
