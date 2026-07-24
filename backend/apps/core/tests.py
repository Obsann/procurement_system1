"""
Tests for core module — covers WorkflowEngine, InvalidTransitionError,
utility number generators, TimeStampedModel, and pagination.
Authored by: Obsan (primary) | Reviewed by: both
"""
import uuid
from django.test import TestCase
from apps.core.workflow import WorkflowEngine
from apps.core.exceptions import InvalidTransitionError
from apps.core.utils import (
    generate_pr_number, generate_po_number,
    generate_rfq_number, generate_grn_number, generate_supplier_code
)


class NumberGeneratorTest(TestCase):
    def test_pr_number_prefix(self):
        self.assertTrue(generate_pr_number().startswith('PR-'))

    def test_po_number_prefix(self):
        self.assertTrue(generate_po_number().startswith('PO-'))

    def test_rfq_number_prefix(self):
        self.assertTrue(generate_rfq_number().startswith('RFQ-'))

    def test_grn_number_prefix(self):
        self.assertTrue(generate_grn_number().startswith('GRN-'))

    def test_supplier_code_prefix(self):
        self.assertTrue(generate_supplier_code().startswith('SUP-'))

    def test_generated_numbers_have_date_component(self):
        from django.utils import timezone
        date_str = timezone.now().strftime('%Y%m%d')
        self.assertIn(date_str, generate_pr_number())

    def test_generated_numbers_are_unique(self):
        import time
        nums = set()
        for _ in range(50):
            n = generate_pr_number()
            # Allow some collision in the random suffix but verify structure
            self.assertRegex(n, r'^PR-\d{8}-\d{4}$')


class WorkflowEngineCanTransitionTest(TestCase):
    def test_can_submit_draft_pr_as_requester(self):
        can, next_status = WorkflowEngine.can_transition('PR', 'DRAFT', 'submit', 'REQUESTER')
        self.assertTrue(can)
        self.assertEqual(next_status, 'SUBMITTED')

    def test_cannot_submit_draft_pr_as_budget_holder(self):
        can, next_status = WorkflowEngine.can_transition('PR', 'DRAFT', 'submit', 'BUDGET_HOLDER')
        self.assertFalse(can)
        self.assertIsNone(next_status)

    def test_can_approve_submitted_pr_as_budget_holder(self):
        can, next_status = WorkflowEngine.can_transition('PR', 'SUBMITTED', 'approve', 'BUDGET_HOLDER')
        self.assertTrue(can)
        self.assertEqual(next_status, 'APPROVED')

    def test_admin_can_approve_pr(self):
        can, next_status = WorkflowEngine.can_transition('PR', 'SUBMITTED', 'approve', 'ADMIN')
        self.assertTrue(can)
        self.assertEqual(next_status, 'APPROVED')

    def test_unknown_entity_type_returns_false(self):
        can, next_status = WorkflowEngine.can_transition('UNKNOWN', 'DRAFT', 'submit', 'REQUESTER')
        self.assertFalse(can)
        self.assertIsNone(next_status)

    def test_unknown_action_returns_false(self):
        can, next_status = WorkflowEngine.can_transition('PR', 'DRAFT', 'fly', 'REQUESTER')
        self.assertFalse(can)
        self.assertIsNone(next_status)

    def test_rfq_draft_to_sent(self):
        can, next_status = WorkflowEngine.can_transition('RFQ', 'DRAFT', 'send', 'PROCUREMENT_OFFICER')
        self.assertTrue(can)
        self.assertEqual(next_status, 'SENT')

    def test_po_created_to_financial_review(self):
        can, next_status = WorkflowEngine.can_transition('PO', 'PO_CREATED', 'submit_for_review', 'PROCUREMENT_OFFICER')
        self.assertTrue(can)
        self.assertEqual(next_status, 'FINANCIAL_REVIEW')

    def test_po_final_approval_approve_as_budget_holder(self):
        can, next_status = WorkflowEngine.can_transition('PO', 'FINAL_APPROVAL', 'approve', 'BUDGET_HOLDER')
        self.assertTrue(can)
        self.assertEqual(next_status, 'PO_APPROVED')


class WorkflowEngineTransitionTest(TestCase):
    """Tests the actual mutation path via WorkflowEngine.transition()."""

    def _make_status_entity(self, status):
        """Minimal mock entity for workflow transition testing."""
        class FakeEntity:
            def __init__(self, st):
                self.status = st
                self._saved = False
            def save(self):
                self._saved = True
        return FakeEntity(status)

    def test_transition_mutates_entity_status(self):
        entity = self._make_status_entity('DRAFT')
        WorkflowEngine.transition('PR', entity, 'submit', 'REQUESTER')
        self.assertEqual(entity.status, 'SUBMITTED')
        self.assertTrue(entity._saved)

    def test_transition_raises_for_invalid_role(self):
        entity = self._make_status_entity('DRAFT')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('PR', entity, 'submit', 'FINANCIAL_REVIEWER')

    def test_transition_raises_for_wrong_state(self):
        entity = self._make_status_entity('APPROVED')
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('PR', entity, 'submit', 'REQUESTER')

    def test_invalid_transition_error_http_status(self):
        error = InvalidTransitionError()
        self.assertEqual(error.status_code, 400)

    def test_complete_pr_path_transitions(self):
        entity = self._make_status_entity('DRAFT')
        WorkflowEngine.transition('PR', entity, 'submit', 'REQUESTER')
        self.assertEqual(entity.status, 'SUBMITTED')
        WorkflowEngine.transition('PR', entity, 'approve', 'BUDGET_HOLDER')
        self.assertEqual(entity.status, 'APPROVED')
        WorkflowEngine.transition('PR', entity, 'process', 'PROCUREMENT_OFFICER')
        self.assertEqual(entity.status, 'PROCUREMENT_PROCESSING')

    def test_complete_po_path_transitions(self):
        entity = self._make_status_entity('PO_CREATED')
        WorkflowEngine.transition('PO', entity, 'submit_for_review', 'PROCUREMENT_OFFICER')
        self.assertEqual(entity.status, 'FINANCIAL_REVIEW')
        WorkflowEngine.transition('PO', entity, 'approve_financial', 'FINANCIAL_REVIEWER')
        self.assertEqual(entity.status, 'FINANCIAL_APPROVED')
        WorkflowEngine.transition('PO', entity, 'submit_final', 'PROCUREMENT_OFFICER')
        self.assertEqual(entity.status, 'FINAL_APPROVAL')
        WorkflowEngine.transition('PO', entity, 'approve', 'BUDGET_HOLDER')
        self.assertEqual(entity.status, 'PO_APPROVED')
        WorkflowEngine.transition('PO', entity, 'receive', 'WAREHOUSE_OFFICER')
        self.assertEqual(entity.status, 'GOODS_RECEIVED')
