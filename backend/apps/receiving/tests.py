"""
Tests for receiving module — covers PreReceive, GoodsReceipt, GoodsReceiptLine models,
partial and complete goods receipt logic, GRN number generation, and API endpoints.
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
from apps.orders.models import PurchaseOrder, PurchaseOrderLine
from apps.receiving.models import PreReceive, GoodsReceipt, GoodsReceiptLine


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org_dept():
    org = Organization.objects.create(name='Receiving Org', code='RCV-ORG')
    dept = Department.objects.create(name='Receiving Dept', code='RCV-DEPT', organization=org)
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
        legal_name='Receiving Supplier', contact_person='Rep',
        email='rcvsup@test.com', phone='+25190000001'
    )


def make_approved_po(requester, dept, proc, supplier):
    pr = PurchaseRequisition.objects.create(
        requester=requester, department=dept,
        title='RCV PR', description='Test', status='PROCUREMENT_PROCESSING'
    )
    rfq = RFQ.objects.create(
        purchase_requisition=pr, title='RCV RFQ',
        submission_deadline=datetime.date.today() + datetime.timedelta(days=7),
        status='CLOSED', created_by=proc,
    )
    bid = Bid.objects.create(
        rfq=rfq, supplier=supplier, bid_date=datetime.date.today(),
        grand_total='8000.00', is_winner=True, submitted_by=proc
    )
    return PurchaseOrder.objects.create(
        purchase_requisition=pr, rfq=rfq, winning_bid=bid,
        supplier=supplier, subtotal='7500.00', freight_cost='300.00',
        insurance_cost='200.00', tax_amount='0.00', total_amount='8000.00',
        created_by=proc, status='PO_APPROVED',
    )


def add_po_line(po, item='Server', qty='3.00', unit_price='2500.00', total='7500.00'):
    return PurchaseOrderLine.objects.create(
        purchase_order=po, item_name=item, quantity=qty,
        unit_price=unit_price, total_price=total
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class PreReceiveModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('prrcv_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.wh = make_user_with_role('prrcv_wh@test.com', 'WAREHOUSE_OFFICER', self.dept)
        self.req = make_user_with_role('prrcv_req@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()
        self.po = make_approved_po(self.req, self.dept, self.proc, self.supplier)

    def test_pre_receive_str(self):
        pr = PreReceive.objects.create(
            purchase_order=self.po,
            expected_delivery_date=datetime.date.today() + datetime.timedelta(days=3),
            created_by=self.wh,
        )
        self.assertIn(self.po.po_number, str(pr))

    def test_pre_receive_uuid_pk(self):
        pr = PreReceive.objects.create(purchase_order=self.po, created_by=self.wh)
        import uuid
        self.assertIsInstance(pr.pk, uuid.UUID)

    def test_pre_receive_one_to_one_with_po(self):
        PreReceive.objects.create(purchase_order=self.po, created_by=self.wh)
        with self.assertRaises(Exception):
            PreReceive.objects.create(purchase_order=self.po, created_by=self.wh)


class GoodsReceiptModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('grmodel_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.wh = make_user_with_role('grmodel_wh@test.com', 'WAREHOUSE_OFFICER', self.dept)
        self.req = make_user_with_role('grmodel_req@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()
        self.po = make_approved_po(self.req, self.dept, self.proc, self.supplier)

    def test_grn_auto_generates_number(self):
        gr = GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today(), status='PARTIAL'
        )
        self.assertTrue(gr.grn_number.startswith('GRN-'))

    def test_goods_receipt_str(self):
        gr = GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today(), status='PARTIAL'
        )
        self.assertIn(gr.grn_number, str(gr))
        self.assertIn(self.po.po_number, str(gr))

    def test_goods_receipt_default_status_partial(self):
        gr = GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today(),
        )
        self.assertEqual(gr.status, 'PARTIAL')

    def test_goods_receipt_status_choices(self):
        valid = [c[0] for c in GoodsReceipt.STATUS_CHOICES]
        self.assertIn('PARTIAL', valid)
        self.assertIn('COMPLETE', valid)

    def test_multiple_receipts_for_same_po(self):
        """Supports partial deliveries — multiple GRNs for one PO."""
        GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today(), status='PARTIAL'
        )
        GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today() + datetime.timedelta(days=1), status='COMPLETE'
        )
        self.assertEqual(GoodsReceipt.objects.filter(purchase_order=self.po).count(), 2)


class GoodsReceiptLineModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('grlmodel_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.wh = make_user_with_role('grlmodel_wh@test.com', 'WAREHOUSE_OFFICER', self.dept)
        self.req = make_user_with_role('grlmodel_req@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()
        self.po = make_approved_po(self.req, self.dept, self.proc, self.supplier)
        self.po_line = add_po_line(self.po)
        self.gr = GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today(), status='PARTIAL'
        )

    def test_grn_line_str(self):
        line = GoodsReceiptLine.objects.create(
            goods_receipt=self.gr, po_line=self.po_line,
            expected_quantity='3.00', received_quantity='2.00'
        )
        self.assertIn('2.00', str(line))
        self.assertIn('3.00', str(line))

    def test_grn_line_cascade_delete_with_grn(self):
        GoodsReceiptLine.objects.create(
            goods_receipt=self.gr, po_line=self.po_line,
            expected_quantity='3.00', received_quantity='1.00'
        )
        gr_id = self.gr.pk
        self.gr.delete()
        self.assertEqual(GoodsReceiptLine.objects.filter(goods_receipt_id=gr_id).count(), 0)

    def test_partial_receipt_line_quantities(self):
        line = GoodsReceiptLine.objects.create(
            goods_receipt=self.gr, po_line=self.po_line,
            expected_quantity='3.00', received_quantity='1.00'
        )
        self.assertEqual(float(line.expected_quantity), 3.0)
        self.assertEqual(float(line.received_quantity), 1.0)


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class GoodsReceiptAPITest(APITestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('grapi_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.wh = make_user_with_role('grapi_wh@test.com', 'WAREHOUSE_OFFICER', self.dept)
        self.req = make_user_with_role('grapi_req@test.com', 'REQUESTER', self.dept)
        self.supplier = make_supplier()
        self.po = make_approved_po(self.req, self.dept, self.proc, self.supplier)
        self.po_line = add_po_line(self.po)
        self.list_url = '/api/goods-receipts/'

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_goods_receipt(self):
        self.client.force_authenticate(user=self.wh)
        data = {
            'purchase_order': str(self.po.pk),
            'received_date': str(datetime.date.today()),
            'status': 'PARTIAL',
            'notes': 'First partial delivery',
            'lines': [
                {
                    'po_line': str(self.po_line.pk),
                    'expected_quantity': '3.00',
                    'received_quantity': '1.00',
                    'notes': 'Partial - remaining to follow',
                }
            ]
        }
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.data['grn_number'].startswith('GRN-'))
        self.assertEqual(resp.data['status'], 'PARTIAL')

    def test_create_complete_goods_receipt(self):
        self.client.force_authenticate(user=self.wh)
        data = {
            'purchase_order': str(self.po.pk),
            'received_date': str(datetime.date.today()),
            'status': 'COMPLETE',
            'notes': 'Full delivery received',
            'lines': [],
        }
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['status'], 'COMPLETE')

    def test_list_goods_receipts(self):
        GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today(), status='PARTIAL'
        )
        self.client.force_authenticate(user=self.wh)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_retrieve_goods_receipt(self):
        gr = GoodsReceipt.objects.create(
            purchase_order=self.po, received_by=self.wh,
            received_date=datetime.date.today(), status='COMPLETE'
        )
        self.client.force_authenticate(user=self.wh)
        resp = self.client.get(f'{self.list_url}{gr.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['grn_number'], gr.grn_number)
        self.assertEqual(resp.data['po_number'], self.po.po_number)
