"""End-to-end procurement lifecycle, driven entirely through the REST API.

Section 15.1 of the blueprint calls the MVP complete when the twenty-step
procurement scenario runs "without manual database intervention". An earlier
version of this file asserted that by calling WorkflowEngine.transition() and
Model.objects.create() directly, which is exactly the manual intervention the
criteria rule out: it passed while the API had no endpoint to move a purchase
order out of FINANCIAL_APPROVED, so the workflow dead-ended in production and
nothing caught it.

Every step here therefore goes through a real endpoint, authenticated as the
role that owns it. The state machine itself is unit tested in core/tests.py;
this file exists to prove the product is reachable through its own API.

Authored by: Obsan & Mary (joint) | Reviewed by: both
"""
import datetime

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User, Role, UserRole
from apps.approvals.models import Approval
from apps.auditing.models import AuditLog
from apps.financial_reviews.models import FinancialReview
from apps.notifications.models import Notification
from apps.organizations.models import Organization, Department
from apps.procurement.models import PurchaseRequisition
from apps.suppliers.models import Supplier


def create_user(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name=role_name.split('_')[0].capitalize(), last_name='User',
        department=dept,
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


class FullProcurementLifecycleAPITest(APITestCase):
    """Walks the blueprint's twenty-step scenario over HTTP."""

    def setUp(self):
        self.org = Organization.objects.create(name='E2E Test Corp', code='E2E-CORP')
        self.dept = Department.objects.create(
            name='Operations', code='OPS-001', organization=self.org
        )
        self.requester = create_user('e2e_req@corp.com', 'REQUESTER', self.dept)
        self.budget_holder = create_user('e2e_bh@corp.com', 'BUDGET_HOLDER', self.dept)
        self.proc_officer = create_user('e2e_proc@corp.com', 'PROCUREMENT_OFFICER', self.dept)
        self.fin_reviewer = create_user('e2e_fin@corp.com', 'FINANCIAL_REVIEWER', self.dept)
        self.warehouse = create_user('e2e_wh@corp.com', 'WAREHOUSE_OFFICER', self.dept)

        self.supplier_a = Supplier.objects.create(
            legal_name='Alpha Supplies Ltd', contact_person='Alice Johnson',
            email='alice@alpha.com', phone='+251911111111', status='ACTIVE',
        )
        self.supplier_b = Supplier.objects.create(
            legal_name='Beta Trading Co', contact_person='Bob Smith',
            email='bob@beta.com', phone='+251922222222', status='ACTIVE',
        )

    def post(self, url, payload=None, *, as_user):
        self.client.force_authenticate(user=as_user)
        return self.client.post(url, payload or {}, format='json')

    def get(self, url, *, as_user):
        self.client.force_authenticate(user=as_user)
        return self.client.get(url)

    def test_full_procurement_lifecycle_through_the_api(self):
        deadline = datetime.date.today() + datetime.timedelta(days=14)

        # Steps 2-3: the requester raises a requisition with line items.
        resp = self.post('/api/requisitions/', {
            'department': str(self.dept.pk),
            'title': 'Office Equipment Procurement',
            'description': 'Laptops and accessories for the team',
            'required_delivery_date': str(deadline),
            'lines': [
                {'item_name': 'Laptop', 'description': '16GB RAM',
                 'quantity': '2', 'estimated_unit_price': '1500.00'},
                {'item_name': 'Docking station', 'description': 'USB-C',
                 'quantity': '2', 'estimated_unit_price': '250.00'},
            ],
        }, as_user=self.requester)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        pr_id = resp.data['id']
        self.assertEqual(len(resp.data['lines']), 2)

        # Step 4: submission.
        resp = self.post(f'/api/requisitions/{pr_id}/submit/', as_user=self.requester)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data['status'], 'SUBMITTED')

        # Step 5: it reaches the approver's queue.
        resp = self.get('/api/requisitions/?status=SUBMITTED', as_user=self.budget_holder)
        self.assertIn(pr_id, [row['id'] for row in resp.data['results']])

        # Step 6: approval.
        resp = self.post('/api/approvals/approve/', {
            'entity_type': 'PR', 'entity_id': pr_id, 'comment': 'Within budget.',
        }, as_user=self.budget_holder)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data['new_status'], 'APPROVED')

        # Step 7: procurement picks it up.
        resp = self.get('/api/requisitions/?status=APPROVED', as_user=self.proc_officer)
        self.assertIn(pr_id, [row['id'] for row in resp.data['results']])

        # Step 8: an RFQ with lines, sent to two suppliers.
        resp = self.post('/api/rfqs/', {
            'purchase_requisition': pr_id,
            'title': 'RFQ for office equipment',
            'description': 'Please quote your best price',
            'submission_deadline': str(deadline),
            'supplier_ids': [str(self.supplier_a.pk), str(self.supplier_b.pk)],
            'lines': [
                {'item_name': 'Laptop', 'quantity': '2'},
                {'item_name': 'Docking station', 'quantity': '2'},
            ],
        }, as_user=self.proc_officer)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        rfq_id = resp.data['id']
        rfq_lines = resp.data['lines']
        self.assertEqual(len(rfq_lines), 2)
        self.assertEqual(len(resp.data['invited_suppliers']), 2)

        resp = self.post(f'/api/rfqs/{rfq_id}/send/', as_user=self.proc_officer)
        self.assertEqual(resp.data['status'], 'SENT')

        # Step 9: BR-06 needs quotations from two distinct suppliers.
        bid_ids = []
        for supplier, unit_price, total in (
            (self.supplier_a, '1450.00', '3400.00'),
            (self.supplier_b, '1600.00', '3700.00'),
        ):
            resp = self.post('/api/bids/', {
                'rfq': rfq_id,
                'supplier': str(supplier.pk),
                'bid_date': str(datetime.date.today()),
                'lead_time_days': 14,
                'grand_total': total,
                'lines': [
                    {'rfq_line': rfq_lines[0]['id'], 'quantity_offered': '2',
                     'unit_price': unit_price, 'total_price': '2900.00'},
                    {'rfq_line': rfq_lines[1]['id'], 'quantity_offered': '2',
                     'unit_price': '250.00', 'total_price': '500.00'},
                ],
            }, as_user=self.proc_officer)
            self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
            self.assertEqual(len(resp.data['lines']), 2)
            bid_ids.append(resp.data['id'])

        # Step 10: the bids can be compared side by side.
        resp = self.get(f'/api/bids/?rfq={rfq_id}', as_user=self.proc_officer)
        self.assertEqual(resp.data['count'], 2)

        # Step 11: award to the cheaper supplier.
        resp = self.post(f'/api/bids/{bid_ids[0]}/select_winner/', as_user=self.proc_officer)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertTrue(resp.data['bid']['is_winner'])

        # Step 12: the purchase order.
        resp = self.post('/api/purchase-orders/generate-from-bid/',
                         {'bid_id': bid_ids[0]}, as_user=self.proc_officer)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        po_id = resp.data['id']
        self.assertTrue(resp.data['po_number'].startswith('PO-'))
        self.assertEqual(len(resp.data['lines']), 2)

        resp = self.post(f'/api/purchase-orders/{po_id}/submit-for-review/',
                         as_user=self.proc_officer)
        self.assertEqual(resp.data['status'], 'FINANCIAL_REVIEW')

        # Step 13: it reaches the financial reviewer.
        resp = self.get('/api/purchase-orders/?status=FINANCIAL_REVIEW', as_user=self.fin_reviewer)
        self.assertIn(po_id, [row['id'] for row in resp.data['results']])

        # Step 14: financial approval.
        resp = self.post('/api/financial-reviews/review/', {
            'purchase_order': po_id, 'decision': 'APPROVED', 'comments': 'Funds available.',
        }, as_user=self.fin_reviewer)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data['new_status'], 'FINANCIAL_APPROVED')

        # Step 15: final approval, via the endpoint whose absence used to end
        # the workflow here.
        resp = self.post(f'/api/purchase-orders/{po_id}/submit-final/', as_user=self.proc_officer)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data['status'], 'FINAL_APPROVAL')

        resp = self.post('/api/approvals/approve/', {
            'entity_type': 'PO', 'entity_id': po_id, 'comment': 'Approved for purchase.',
        }, as_user=self.budget_holder)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data['new_status'], 'PO_APPROVED')

        # Steps 16-17: goods receipt closes the order.
        resp = self.get(f'/api/purchase-orders/{po_id}/', as_user=self.warehouse)
        po_lines = resp.data['lines']

        resp = self.post('/api/goods-receipts/', {
            'purchase_order': po_id,
            'received_date': str(datetime.date.today()),
            'status': 'COMPLETE',
            'notes': 'All items received in good condition',
            'lines': [
                {'po_line': line['id'], 'expected_quantity': line['quantity'],
                 'received_quantity': line['quantity']}
                for line in po_lines
            ],
        }, as_user=self.warehouse)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        self.assertTrue(resp.data['grn_number'].startswith('GRN-'))
        self.assertEqual(len(resp.data['lines']), 2)

        resp = self.get(f'/api/purchase-orders/{po_id}/', as_user=self.warehouse)
        self.assertEqual(resp.data['status'], 'GOODS_RECEIVED')

        # Step 18: the history is readable through the API.
        resp = self.get(f'/api/approvals/?entity_type=PR&entity_id={pr_id}', as_user=self.requester)
        self.assertEqual(resp.data['count'], 1)
        self.assertEqual(resp.data['results'][0]['action'], 'APPROVE')
        self.assertEqual(Approval.objects.filter(entity_id=po_id).count(), 1)
        self.assertEqual(
            FinancialReview.objects.filter(purchase_order_id=po_id, decision='APPROVED').count(), 1
        )

        # Step 19: every transition is auditable.
        resp = self.get('/api/audit-logs/', as_user=self.budget_holder)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(
            AuditLog.objects.filter(action='WORKFLOW_TRANSITION', entity_id=po_id).count(), 4
        )

        # Step 20: both directions of notification — forward to whoever acts
        # next, and back to whoever raised the record.
        resp = self.get('/api/notifications/', as_user=self.requester)
        self.assertGreater(resp.data['count'], 0,
                           'the requester was never told the outcome of their own request')
        self.assertTrue(Notification.objects.filter(recipient=self.warehouse).exists())

        pr = PurchaseRequisition.objects.get(pk=pr_id)
        self.assertEqual(pr.status, 'APPROVED')


class WorkflowUnhappyPathAPITest(APITestCase):
    """Return and rejection cycles, also through the API."""

    def setUp(self):
        self.org = Organization.objects.create(name='Rejection Corp', code='REJ-CORP')
        self.dept = Department.objects.create(
            name='Procurement', code='REJ-PROC', organization=self.org
        )
        self.requester = create_user('rej_req@corp.com', 'REQUESTER', self.dept)
        self.budget_holder = create_user('rej_bh@corp.com', 'BUDGET_HOLDER', self.dept)

    def _draft(self, title='Unhappy path PR'):
        return PurchaseRequisition.objects.create(
            requester=self.requester, department=self.dept,
            title=title, description='Test', status='DRAFT',
        )

    def _decide(self, action, pr_id, comment='See comments.'):
        self.client.force_authenticate(user=self.budget_holder)
        return self.client.post(f'/api/approvals/{action}/', {
            'entity_type': 'PR', 'entity_id': str(pr_id), 'comment': comment,
        }, format='json')

    def test_returned_requisition_can_be_revised_and_resubmitted(self):
        pr = self._draft()
        self.client.force_authenticate(user=self.requester)
        self.client.post(f'/api/requisitions/{pr.pk}/submit/', {}, format='json')

        resp = self._decide('return-entity', pr.pk, 'Please add a second quote.')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data['new_status'], 'RETURNED')

        self.client.force_authenticate(user=self.requester)
        resp = self.client.patch(f'/api/requisitions/{pr.pk}/',
                                 {'description': 'Revised with detail'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        resp = self.client.post(f'/api/requisitions/{pr.pk}/submit/', {}, format='json')
        self.assertEqual(resp.data['status'], 'SUBMITTED')

        resp = self._decide('approve', pr.pk)
        self.assertEqual(resp.data['new_status'], 'APPROVED')

    def test_rejection_is_terminal(self):
        pr = self._draft('Rejected PR')
        self.client.force_authenticate(user=self.requester)
        self.client.post(f'/api/requisitions/{pr.pk}/submit/', {}, format='json')

        resp = self._decide('reject', pr.pk, 'Not needed this year.')
        self.assertEqual(resp.data['new_status'], 'REJECTED')

        self.client.force_authenticate(user=self.requester)
        resp = self.client.post(f'/api/requisitions/{pr.pk}/submit/', {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'REJECTED')

    def test_requester_cannot_approve_their_own_requisition(self):
        pr = self._draft('Self approval attempt')
        self.client.force_authenticate(user=self.requester)
        self.client.post(f'/api/requisitions/{pr.pk}/submit/', {}, format='json')

        resp = self.client.post('/api/approvals/approve/', {
            'entity_type': 'PR', 'entity_id': str(pr.pk),
        }, format='json')

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'SUBMITTED')
