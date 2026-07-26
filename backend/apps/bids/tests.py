"""
Tests for bids module — covers Bid, BidLine, BidAttachment models,
bid submission, winner selection logic, and API endpoints.
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
from apps.rfq.models import RFQ, RFQLine
from apps.bids.models import Bid, BidLine


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org_dept():
    org = Organization.objects.create(name='Bids Org', code='BID-ORG')
    dept = Department.objects.create(name='Bids Dept', code='BID-DEPT', organization=org)
    return org, dept


def make_user_with_role(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Test', last_name='User', department=dept
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_supplier(name='Bid Supplier', email='bidsup@test.com'):
    return Supplier.objects.create(
        legal_name=name, contact_person='Rep',
        email=email, phone='+25190000001', status='ACTIVE'
    )


def make_pr(requester, dept):
    return PurchaseRequisition.objects.create(
        requester=requester, department=dept,
        title='PR for Bid', description='Test', status='APPROVED'
    )


def make_rfq(pr, created_by):
    return RFQ.objects.create(
        purchase_requisition=pr,
        title='RFQ for Bid Test',
        submission_deadline=datetime.date.today() + datetime.timedelta(days=7),
        status='SENT',
        created_by=created_by,
    )


def make_rfq_line(rfq, item_name='Laptop', qty='5.00'):
    return RFQLine.objects.create(rfq=rfq, item_name=item_name, quantity=qty)


def make_bid(rfq, supplier, grand_total='5000.00', submitter=None):
    return Bid.objects.create(
        rfq=rfq,
        supplier=supplier,
        bid_date=datetime.date.today(),
        grand_total=grand_total,
        submitted_by=submitter,
    )


def make_bid_line(bid, rfq_line, qty='5.00', unit_price='1000.00', total_price='5000.00'):
    return BidLine.objects.create(
        bid=bid,
        rfq_line=rfq_line,
        quantity_offered=qty,
        unit_price=unit_price,
        total_price=total_price,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class BidModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('bidproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('bidreq@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)

    def test_bid_str(self):
        bid = make_bid(self.rfq, self.supplier, submitter=self.proc)
        self.assertIn('Bid Supplier', str(bid))
        self.assertIn(self.rfq.rfq_number, str(bid))

    def test_bid_default_not_winner(self):
        bid = make_bid(self.rfq, self.supplier, submitter=self.proc)
        self.assertFalse(bid.is_winner)

    def test_bid_uuid_pk(self):
        bid = make_bid(self.rfq, self.supplier, submitter=self.proc)
        import uuid
        self.assertIsInstance(bid.pk, uuid.UUID)

    def test_bid_linked_to_rfq(self):
        bid = make_bid(self.rfq, self.supplier, submitter=self.proc)
        self.assertEqual(bid.rfq, self.rfq)

    def test_multiple_bids_for_same_rfq(self):
        supplier2 = make_supplier('Supplier B', 'supplierb@test.com')
        make_bid(self.rfq, self.supplier, '4000.00', self.proc)
        make_bid(self.rfq, supplier2, '4500.00', self.proc)
        self.assertEqual(self.rfq.bids.count(), 2)


class BidLineModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('bidlineproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('bidlinereq@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier('LineSupplier', 'linesup@test.com')
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)
        self.rfq_line = make_rfq_line(self.rfq)
        self.bid = make_bid(self.rfq, self.supplier, submitter=self.proc)

    def test_bid_line_str(self):
        line = make_bid_line(self.bid, self.rfq_line)
        self.assertIn('5.00', str(line))
        self.assertIn('1000.00', str(line))

    def test_bid_line_cascade_delete_with_bid(self):
        make_bid_line(self.bid, self.rfq_line)
        bid_id = self.bid.pk
        self.bid.delete()
        self.assertEqual(BidLine.objects.filter(bid_id=bid_id).count(), 0)

    def test_bid_line_total_price_stored(self):
        line = make_bid_line(self.bid, self.rfq_line, qty='5.00', unit_price='200.00', total_price='1000.00')
        self.assertEqual(float(line.total_price), 1000.00)


# ---------------------------------------------------------------------------
# Winner selection tests
# ---------------------------------------------------------------------------

class BidWinnerSelectionTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('winproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('winreq@test.com', 'REQUESTER', self.dept)
        self.supplier_a = make_supplier('Winner Supplier', 'winner@test.com')
        self.supplier_b = make_supplier('Loser Supplier', 'loser@test.com')
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)

    def test_selecting_winner_marks_bid_as_winner(self):
        bid = make_bid(self.rfq, self.supplier_a, submitter=self.proc)
        bid.is_winner = True
        bid.save()
        bid.refresh_from_db()
        self.assertTrue(bid.is_winner)

    def test_only_one_winner_per_rfq(self):
        """Simulates what the select_winner endpoint does."""
        bid_a = make_bid(self.rfq, self.supplier_a, '3000.00', self.proc)
        bid_b = make_bid(self.rfq, self.supplier_b, '2800.00', self.proc)

        # Select bid_a first
        Bid.objects.filter(rfq=self.rfq, is_winner=True).update(is_winner=False)
        bid_a.is_winner = True
        bid_a.save()
        self.assertTrue(Bid.objects.get(pk=bid_a.pk).is_winner)
        self.assertFalse(Bid.objects.get(pk=bid_b.pk).is_winner)

        # Now switch to bid_b
        Bid.objects.filter(rfq=self.rfq, is_winner=True).update(is_winner=False)
        bid_b.is_winner = True
        bid_b.save()
        self.assertFalse(Bid.objects.get(pk=bid_a.pk).is_winner)
        self.assertTrue(Bid.objects.get(pk=bid_b.pk).is_winner)


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class BidAPITest(APITestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('bidapiproc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('bidapireq@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier('API Supplier', 'apisup@test.com')
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)
        self.list_url = '/api/bids/'

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_bid(self):
        self.client.force_authenticate(user=self.proc)
        data = {
            'rfq': str(self.rfq.pk),
            'supplier': str(self.supplier.pk),
            'bid_date': str(datetime.date.today()),
            'grand_total': '9500.00',
            'freight_cost': '200.00',
            'insurance_cost': '100.00',
            'tax_amount': '0.00',
            'lines': [],
        }
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['grand_total'], '9500.00')
        self.assertFalse(resp.data['is_winner'])

    def test_create_bid_with_priced_lines(self):
        """A quotation is the line prices; posting a bid without them is not a
        realistic path, so nested creation has to work."""
        self.client.force_authenticate(user=self.proc)
        rfq_line = make_rfq_line(self.rfq)

        resp = self.client.post(self.list_url, {
            'rfq': str(self.rfq.pk),
            'supplier': str(self.supplier.pk),
            'bid_date': str(datetime.date.today()),
            'grand_total': '2000.00',
            'lines': [
                {'rfq_line': str(rfq_line.pk), 'quantity_offered': '2',
                 'unit_price': '900.00', 'total_price': '1800.00'},
            ],
        }, format='json')

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        self.assertEqual(len(resp.data['lines']), 1)
        self.assertEqual(BidLine.objects.filter(bid_id=resp.data['id']).count(), 1)

    def test_select_winner_action(self):
        bid_a = make_bid(self.rfq, self.supplier, '3500.00', self.proc)
        # BR-06 requires at least 2 distinct suppliers — add a second
        supplier_b = make_supplier('Bid Supplier B', 'bidsupB@test.com')
        make_bid(self.rfq, supplier_b, '4000.00', self.proc)
        self.client.force_authenticate(user=self.proc)
        url = f'{self.list_url}{bid_a.pk}/select_winner/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('winning bidder', resp.data['message'])
        bid_a.refresh_from_db()
        self.assertTrue(bid_a.is_winner)

    def test_list_bids(self):
        make_bid(self.rfq, self.supplier, submitter=self.proc)
        self.client.force_authenticate(user=self.proc)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)
