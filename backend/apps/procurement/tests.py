"""
Tests for the procurement module — covers PurchaseRequisition, PR lines,
workflow transitions (submit/approve/reject/return), and serializer validation.
Authored by: Obsan (primary) | Reviewed by: both
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import datetime

from apps.accounts.models import User, Role, UserRole
from apps.organizations.models import Organization, Department
from apps.procurement.models import PurchaseRequisition, PurchaseRequisitionLine


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org_dept():
    org = Organization.objects.create(name='Procurement Org', code='PROC-ORG')
    dept = Department.objects.create(name='Procurement Dept', code='PROC-DEPT', organization=org)
    return org, dept


def make_user_with_role(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='First', last_name='Last', department=dept
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_pr(requester, dept, status='DRAFT'):
    return PurchaseRequisition.objects.create(
        requester=requester,
        department=dept,
        title='Test PR',
        description='Test purchase requisition',
        status=status,
    )


def add_pr_line(pr, item='Laptop', qty='2.00', price='1000.00'):
    return PurchaseRequisitionLine.objects.create(
        purchase_requisition=pr,
        item_name=item,
        quantity=qty,
        estimated_unit_price=price,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class PurchaseRequisitionModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.requester = make_user_with_role('req@test.com', 'REQUESTER', self.dept)

    def test_pr_auto_generates_pr_number(self):
        pr = make_pr(self.requester, self.dept)
        self.assertTrue(pr.pr_number.startswith('PR-'))

    def test_pr_default_status_is_draft(self):
        pr = make_pr(self.requester, self.dept)
        self.assertEqual(pr.status, 'DRAFT')

    def test_pr_uuid_pk(self):
        pr = make_pr(self.requester, self.dept)
        import uuid
        self.assertIsInstance(pr.pk, uuid.UUID)

    def test_pr_str(self):
        pr = make_pr(self.requester, self.dept)
        self.assertIn('Test PR', str(pr))

    def test_pr_total_estimated_amount(self):
        pr = make_pr(self.requester, self.dept)
        add_pr_line(pr, 'Laptop', '2.00', '1000.00')
        add_pr_line(pr, 'Mouse', '5.00', '25.00')
        self.assertEqual(pr.total_estimated_amount, 2125.00)

    def test_pr_total_is_zero_with_no_lines(self):
        pr = make_pr(self.requester, self.dept)
        self.assertEqual(pr.total_estimated_amount, 0)


class PurchaseRequisitionLineModelTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.requester = make_user_with_role('linereq@test.com', 'REQUESTER', self.dept)
        self.pr = make_pr(self.requester, self.dept)

    def test_line_estimated_total(self):
        line = add_pr_line(self.pr, 'Monitor', '3.00', '500.00')
        self.assertEqual(line.estimated_total, 1500.00)

    def test_line_str(self):
        line = add_pr_line(self.pr, 'Keyboard', '10.00', '50.00')
        self.assertIn('Keyboard', str(line))

    def test_line_default_unit_of_measure(self):
        line = add_pr_line(self.pr)
        self.assertEqual(line.unit_of_measure, 'PCS')


# ---------------------------------------------------------------------------
# Workflow tests
# ---------------------------------------------------------------------------

class PRWorkflowTest(TestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.requester = make_user_with_role('wf_req@test.com', 'REQUESTER', self.dept)
        self.approver = make_user_with_role('wf_appr@test.com', 'BUDGET_HOLDER', self.dept)
        self.procurement = make_user_with_role('wf_proc@test.com', 'PROCUREMENT_OFFICER', self.dept)

    def test_submit_transitions_draft_to_submitted(self):
        from apps.core.workflow import WorkflowEngine
        pr = make_pr(self.requester, self.dept, 'DRAFT')
        WorkflowEngine.transition('PR', pr, 'submit', 'REQUESTER')
        self.assertEqual(pr.status, 'SUBMITTED')

    def test_approve_transitions_submitted_to_approved(self):
        from apps.core.workflow import WorkflowEngine
        pr = make_pr(self.requester, self.dept, 'SUBMITTED')
        WorkflowEngine.transition('PR', pr, 'approve', 'BUDGET_HOLDER')
        self.assertEqual(pr.status, 'APPROVED')

    def test_reject_transitions_submitted_to_rejected(self):
        from apps.core.workflow import WorkflowEngine
        pr = make_pr(self.requester, self.dept, 'SUBMITTED')
        WorkflowEngine.transition('PR', pr, 'reject', 'BUDGET_HOLDER')
        self.assertEqual(pr.status, 'REJECTED')

    def test_return_transitions_submitted_to_returned(self):
        from apps.core.workflow import WorkflowEngine
        pr = make_pr(self.requester, self.dept, 'SUBMITTED')
        WorkflowEngine.transition('PR', pr, 'return', 'BUDGET_HOLDER')
        self.assertEqual(pr.status, 'RETURNED')

    def test_returned_pr_can_be_resubmitted(self):
        from apps.core.workflow import WorkflowEngine
        pr = make_pr(self.requester, self.dept, 'RETURNED')
        WorkflowEngine.transition('PR', pr, 'submit', 'REQUESTER')
        self.assertEqual(pr.status, 'SUBMITTED')

    def test_approved_pr_can_go_to_procurement_processing(self):
        from apps.core.workflow import WorkflowEngine
        pr = make_pr(self.requester, self.dept, 'APPROVED')
        WorkflowEngine.transition('PR', pr, 'process', 'PROCUREMENT_OFFICER')
        self.assertEqual(pr.status, 'PROCUREMENT_PROCESSING')

    def test_invalid_role_cannot_submit(self):
        from apps.core.workflow import WorkflowEngine
        from apps.core.exceptions import InvalidTransitionError
        pr = make_pr(self.requester, self.dept, 'DRAFT')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('PR', pr, 'submit', 'BUDGET_HOLDER')

    def test_invalid_action_raises_exception(self):
        from apps.core.workflow import WorkflowEngine
        from apps.core.exceptions import InvalidTransitionError
        pr = make_pr(self.requester, self.dept, 'DRAFT')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('PR', pr, 'approve', 'REQUESTER')

    def test_cannot_approve_already_approved_pr(self):
        from apps.core.workflow import WorkflowEngine
        from apps.core.exceptions import InvalidTransitionError
        pr = make_pr(self.requester, self.dept, 'APPROVED')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('PR', pr, 'approve', 'BUDGET_HOLDER')


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class PurchaseRequisitionAPITest(APITestCase):
    def setUp(self):
        self.org, self.dept = make_org_dept()
        self.requester = make_user_with_role('api_req@test.com', 'REQUESTER', self.dept)
        self.approver = make_user_with_role('api_appr@test.com', 'BUDGET_HOLDER', self.dept)
        self.list_url = '/api/requisitions/'

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_requester_can_create_pr(self):
        self.client.force_authenticate(user=self.requester)
        data = {
            'title': 'New Equipment',
            'description': 'Buying new equipment',
            'department': str(self.dept.pk),
            'lines': [
                {
                    'item_name': 'Laptop',
                    'quantity': '2.00',
                    'estimated_unit_price': '1500.00',
                    'unit_of_measure': 'PCS'
                }
            ]
        }
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['status'], 'DRAFT')
        self.assertTrue(resp.data['pr_number'].startswith('PR-'))

    def test_pr_submit_action(self):
        self.client.force_authenticate(user=self.requester)
        pr = make_pr(self.requester, self.dept)
        url = f'/api/requisitions/{pr.pk}/submit/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'SUBMITTED')

    def test_requester_sees_only_own_prs(self):
        other_user = make_user_with_role('other@test.com', 'REQUESTER', self.dept)
        make_pr(self.requester, self.dept)
        make_pr(other_user, self.dept)
        self.client.force_authenticate(user=self.requester)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for pr in resp.data['results']:
            self.assertEqual(str(pr['requester']), str(self.requester.pk))

    def test_procurement_officer_sees_all_prs(self):
        proc = make_user_with_role('proc@test.com', 'PROCUREMENT_OFFICER', self.dept)
        make_pr(self.requester, self.dept)
        self.client.force_authenticate(user=proc)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_cannot_submit_already_submitted_pr(self):
        self.client.force_authenticate(user=self.requester)
        pr = make_pr(self.requester, self.dept, 'SUBMITTED')
        url = f'/api/requisitions/{pr.pk}/submit/'
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_budget_holder_sees_requisitions_awaiting_approval(self):
        """BR-04 makes the Budget Holder the approver of submitted PRs, so the
        list must show requisitions they did not raise themselves."""
        budget_holder = make_user_with_role('bh@test.com', 'BUDGET_HOLDER', self.dept)
        pr = make_pr(self.requester, self.dept, 'SUBMITTED')
        self.client.force_authenticate(user=budget_holder)

        resp = self.client.get(self.list_url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        returned = {str(row['id']) for row in resp.data['results']}
        self.assertIn(str(pr.pk), returned)

    def test_budget_holder_does_not_see_other_departments(self):
        other_org = Organization.objects.create(name='Other Org', code='OTHER-ORG')
        other_dept = Department.objects.create(
            name='Other Dept', code='OTHER-DEPT', organization=other_org
        )
        outsider = make_user_with_role('outsider@test.com', 'REQUESTER', other_dept)
        foreign_pr = make_pr(outsider, other_dept, 'SUBMITTED')
        budget_holder = make_user_with_role('bh2@test.com', 'BUDGET_HOLDER', self.dept)
        self.client.force_authenticate(user=budget_holder)

        resp = self.client.get(self.list_url)

        returned = {str(row['id']) for row in resp.data['results']}
        self.assertNotIn(str(foreign_pr.pk), returned)

    def test_requester_still_sees_only_their_own(self):
        peer = make_user_with_role('peer@test.com', 'REQUESTER', self.dept)
        peer_pr = make_pr(peer, self.dept, 'SUBMITTED')
        self.client.force_authenticate(user=self.requester)

        resp = self.client.get(self.list_url)

        returned = {str(row['id']) for row in resp.data['results']}
        self.assertNotIn(str(peer_pr.pk), returned)

    def test_pr_response_names_the_requester(self):
        """requester_name reads User.get_full_name, which AbstractBaseUser
        does not provide; without it the field serialises blank."""
        self.client.force_authenticate(user=self.requester)
        pr = make_pr(self.requester, self.dept)
        resp = self.client.get(f'/api/requisitions/{pr.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['requester_name'], 'First Last')
        self.assertEqual(resp.data['department_name'], self.dept.name)
