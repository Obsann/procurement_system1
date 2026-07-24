"""
Tests for RFQ module — covers RFQ, RFQLine, RFQSupplier models,
workflow transitions (DRAFT -> SENT -> RESPONDED -> CLOSED),
and API endpoints.
Authored by: Obsan & Mary | Reviewed by: both
"""
import datetime
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User, Role, UserRole
from apps.organizations.models import Organization, Department
from apps.procurement.models import PurchaseRequisition, PurchaseRequisitionLine
from apps.suppliers.models import Supplier
from apps.rfq.models import RFQ, RFQLine, RFQSupplier


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org_dept():
    org = Organization.objects.create(name='RFQ Org', code='RFQ-ORG')
    dept = Department.objects.create(name='RFQ Dept', code='RFQ-DEPT', organization=org)
    return org, dept


def make_user_with_role(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Test', last_name='User', department=dept
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_pr(requester, dept):
    return PurchaseRequisition.objects.create(
        requester=requester,
        department=dept,
        title='PR for RFQ Test',
        description='Test PR',
        status='APPROVED',
    )


def make_supplier(name='Test Supplier', email='supp@rfq.com'):
    return Supplier.objects.create(
        legal_name=name,
        contact_person='Contact',
        email=email,
        phone='+25190000001',
        status='ACTIVE',
    )


def make_rfq(pr, created_by, status='DRAFT'):
    return RFQ.objects.create(
        purchase_requisition=pr,
        title='RFQ for Test PR',
        description='Please submit your best price',
        submission_deadline=datetime.date.today() + datetime.timedelta(days=14),
        status=status,
        created_by=created_by,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class RFQModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('rfq_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('rfq_req@test.com', 'REQUESTER', self.dept)
        self.pr = make_pr(self.req, self.dept)

    def test_rfq_auto_generates_number(self):
        rfq = make_rfq(self.pr, self.proc)
        self.assertTrue(rfq.rfq_number.startswith('RFQ-'))

    def test_rfq_default_status_is_draft(self):
        rfq = make_rfq(self.pr, self.proc)
        self.assertEqual(rfq.status, 'DRAFT')

    def test_rfq_str(self):
        rfq = make_rfq(self.pr, self.proc)
        self.assertIn(rfq.rfq_number, str(rfq))

    def test_rfq_uuid_pk(self):
        rfq = make_rfq(self.pr, self.proc)
        import uuid
        self.assertIsInstance(rfq.pk, uuid.UUID)

    def test_rfq_linked_to_pr(self):
        rfq = make_rfq(self.pr, self.proc)
        self.assertEqual(rfq.purchase_requisition, self.pr)

    def test_rfq_status_choices(self):
        valid = [c[0] for c in RFQ.STATUS_CHOICES]
        self.assertIn('DRAFT', valid)
        self.assertIn('SENT', valid)
        self.assertIn('RESPONDED', valid)
        self.assertIn('CLOSED', valid)


class RFQLineModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('rfqline_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('rfqline_req@test.com', 'REQUESTER', self.dept)
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)

    def test_rfq_line_creation(self):
        line = RFQLine.objects.create(
            rfq=self.rfq,
            item_name='Office Chair',
            quantity='10.00',
        )
        self.assertEqual(line.item_name, 'Office Chair')
        self.assertEqual(line.rfq, self.rfq)

    def test_rfq_line_str(self):
        line = RFQLine.objects.create(
            rfq=self.rfq, item_name='Desk Lamp', quantity='5.00'
        )
        self.assertIn('Desk Lamp', str(line))

    def test_rfq_line_default_uom(self):
        line = RFQLine.objects.create(
            rfq=self.rfq, item_name='Paper Ream', quantity='100.00'
        )
        self.assertEqual(line.unit_of_measure, 'PCS')

    def test_rfq_lines_cascade_delete_with_rfq(self):
        RFQLine.objects.create(rfq=self.rfq, item_name='Item', quantity='1.00')
        rfq_id = self.rfq.pk
        self.rfq.delete()
        self.assertEqual(RFQLine.objects.filter(rfq_id=rfq_id).count(), 0)


class RFQSupplierModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('rfqsupp_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('rfqsupp_req@test.com', 'REQUESTER', self.dept)
        self.pr = make_pr(self.req, self.dept)
        self.rfq = make_rfq(self.pr, self.proc)
        self.supplier = make_supplier()

    def test_rfq_supplier_str(self):
        rs = RFQSupplier.objects.create(rfq=self.rfq, supplier=self.supplier)
        self.assertIn(self.supplier.legal_name, str(rs))
        self.assertIn(self.rfq.rfq_number, str(rs))

    def test_rfq_supplier_unique_together(self):
        RFQSupplier.objects.create(rfq=self.rfq, supplier=self.supplier)
        with self.assertRaises(Exception):
            RFQSupplier.objects.create(rfq=self.rfq, supplier=self.supplier)

    def test_rfq_supplier_default_not_responded(self):
        rs = RFQSupplier.objects.create(rfq=self.rfq, supplier=self.supplier)
        self.assertFalse(rs.responded)

    def test_mark_rfq_supplier_responded(self):
        rs = RFQSupplier.objects.create(rfq=self.rfq, supplier=self.supplier)
        rs.responded = True
        rs.save()
        rs.refresh_from_db()
        self.assertTrue(rs.responded)


# ---------------------------------------------------------------------------
# Workflow tests
# ---------------------------------------------------------------------------

class RFQWorkflowTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('rfqwf_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('rfqwf_req@test.com', 'REQUESTER', self.dept)
        self.pr = make_pr(self.req, self.dept)

    def test_draft_to_sent(self):
        from apps.core.workflow import WorkflowEngine
        rfq = make_rfq(self.pr, self.proc, 'DRAFT')
        WorkflowEngine.transition('RFQ', rfq, 'send', 'PROCUREMENT_OFFICER')
        self.assertEqual(rfq.status, 'SENT')

    def test_sent_to_responded(self):
        from apps.core.workflow import WorkflowEngine
        rfq = make_rfq(self.pr, self.proc, 'SENT')
        WorkflowEngine.transition('RFQ', rfq, 'respond', 'PROCUREMENT_OFFICER')
        self.assertEqual(rfq.status, 'RESPONDED')

    def test_responded_to_closed(self):
        from apps.core.workflow import WorkflowEngine
        rfq = make_rfq(self.pr, self.proc, 'RESPONDED')
        WorkflowEngine.transition('RFQ', rfq, 'close', 'PROCUREMENT_OFFICER')
        self.assertEqual(rfq.status, 'CLOSED')

    def test_invalid_transition_raises_error(self):
        from apps.core.workflow import WorkflowEngine
        from apps.core.exceptions import InvalidTransitionError
        rfq = make_rfq(self.pr, self.proc, 'DRAFT')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('RFQ', rfq, 'close', 'PROCUREMENT_OFFICER')

    def test_requester_cannot_send_rfq(self):
        from apps.core.workflow import WorkflowEngine
        from apps.core.exceptions import InvalidTransitionError
        rfq = make_rfq(self.pr, self.proc, 'DRAFT')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('RFQ', rfq, 'send', 'REQUESTER')


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class RFQAPITest(APITestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.proc = make_user_with_role('rfqapi_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        self.req = make_user_with_role('rfqapi_req@test.com', 'REQUESTER', self.dept)
        self.pr = make_pr(self.req, self.dept)
        self.list_url = '/api/rfqs/'

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_list_rfqs(self):
        make_rfq(self.pr, self.proc)
        self.client.force_authenticate(user=self.proc)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_create_rfq(self):
        self.client.force_authenticate(user=self.proc)
        data = {
            'purchase_requisition': str(self.pr.pk),
            'title': 'New RFQ',
            'description': 'Request for Quotation',
            'submission_deadline': str(datetime.date.today() + datetime.timedelta(days=7)),
            'created_by': str(self.proc.pk),
        }
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['status'], 'DRAFT')

    def test_retrieve_rfq(self):
        rfq = make_rfq(self.pr, self.proc)
        self.client.force_authenticate(user=self.proc)
        url = f'{self.list_url}{rfq.pk}/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['rfq_number'], rfq.rfq_number)
