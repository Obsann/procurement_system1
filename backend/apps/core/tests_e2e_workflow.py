"""
End-to-End Procurement Lifecycle Test
======================================
This test simulates the COMPLETE procurement workflow from start to finish:

  1.  Create users with proper roles (Requester, Budget Holder,
      Procurement Officer, Financial Reviewer, Warehouse Officer)
  2.  Create a Purchase Requisition (DRAFT)
  3.  Submit the PR (DRAFT → SUBMITTED)
  4.  Approve the PR (SUBMITTED → APPROVED)
  5.  Transition PR to PROCUREMENT_PROCESSING (APPROVED → PROCUREMENT_PROCESSING)
  6.  Create an RFQ from the approved PR (DRAFT)
  7.  Invite suppliers to the RFQ
  8.  Send the RFQ (DRAFT → SENT)
  9.  Receive bids from suppliers
  10. Mark the RFQ as responded (SENT → RESPONDED)
  11. Select a winning bid
  12. Close the RFQ (RESPONDED → CLOSED)
  13. Generate a Purchase Order from the winning bid (PO_CREATED)
  14. Submit PO for financial review (PO_CREATED → FINANCIAL_REVIEW)
  15. Financial Reviewer approves PO (FINANCIAL_REVIEW → FINANCIAL_APPROVED)
  16. Submit PO for final approval (FINANCIAL_APPROVED → FINAL_APPROVAL)
  17. Budget Holder gives final approval (FINAL_APPROVAL → PO_APPROVED)
  18. Warehouse records goods receipt (PO_APPROVED → GOODS_RECEIVED)
  19. Verify all Approval records exist for each action
  20. Verify PO is in final GOODS_RECEIVED state

Authored by: Obsan & Mary (joint) | Reviewed by: both
"""
import datetime
import uuid
from django.test import TestCase

from apps.accounts.models import User, Role, UserRole
from apps.organizations.models import Organization, Department
from apps.procurement.models import PurchaseRequisition, PurchaseRequisitionLine
from apps.suppliers.models import Supplier, SupplierContact
from apps.rfq.models import RFQ, RFQLine, RFQSupplier
from apps.bids.models import Bid, BidLine
from apps.orders.models import PurchaseOrder, PurchaseOrderLine
from apps.approvals.models import Approval
from apps.financial_reviews.models import FinancialReview
from apps.receiving.models import PreReceive, GoodsReceipt, GoodsReceiptLine
from apps.core.workflow import WorkflowEngine
from apps.core.exceptions import InvalidTransitionError


def create_role(name):
    role, _ = Role.objects.get_or_create(name=name)
    return role


def create_user(email, role_name, dept=None):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name=role_name.split('_')[0].capitalize(), last_name='User',
        department=dept
    )
    role = create_role(role_name)
    UserRole.objects.create(user=user, role=role)
    return user


class FullProcurementLifecycleTest(TestCase):
    """
    Runs the complete procurement flow in a single test, asserting state
    at each step to ensure the end-to-end business process is coherent.
    """

    def setUp(self):
        # ---------------------------------------------------------------
        # Step 0: Organizational setup
        # ---------------------------------------------------------------
        self.org = Organization.objects.create(name='E2E Test Corp', code='E2E-CORP')
        self.dept = Department.objects.create(
            name='Operations', code='OPS-001', organization=self.org
        )

        # ---------------------------------------------------------------
        # Step 0: Create all role users
        # ---------------------------------------------------------------
        self.requester = create_user('e2e_req@corp.com', 'REQUESTER', self.dept)
        self.budget_holder = create_user('e2e_bh@corp.com', 'BUDGET_HOLDER', self.dept)
        self.proc_officer = create_user('e2e_proc@corp.com', 'PROCUREMENT_OFFICER', self.dept)
        self.fin_reviewer = create_user('e2e_fin@corp.com', 'FINANCIAL_REVIEWER', self.dept)
        self.warehouse = create_user('e2e_wh@corp.com', 'WAREHOUSE_OFFICER', self.dept)

        # ---------------------------------------------------------------
        # Step 0: Create suppliers
        # ---------------------------------------------------------------
        self.supplier_a = Supplier.objects.create(
            legal_name='Alpha Supplies Ltd',
            contact_person='Alice Johnson',
            email='alice@alpha.com',
            phone='+251911111111',
            country='Ethiopia',
            status='ACTIVE',
        )
        SupplierContact.objects.create(
            supplier=self.supplier_a, name='Alice Johnson',
            email='alice@alpha.com', is_primary=True
        )

        self.supplier_b = Supplier.objects.create(
            legal_name='Beta Trading Co',
            contact_person='Bob Smith',
            email='bob@beta.com',
            phone='+251922222222',
            status='ACTIVE',
        )

    def test_full_procurement_lifecycle(self):
        # ---------------------------------------------------------------
        # Step 1: Create Purchase Requisition (DRAFT)
        # ---------------------------------------------------------------
        pr = PurchaseRequisition.objects.create(
            requester=self.requester,
            department=self.dept,
            title='Office Equipment Procurement',
            description='Purchasing laptops and accessories for the team',
            currency='USD',
            status='DRAFT',
        )
        line1 = PurchaseRequisitionLine.objects.create(
            purchase_requisition=pr,
            item_name='Laptop Dell XPS',
            quantity='5.00',
            estimated_unit_price='1200.00',
            unit_of_measure='PCS',
        )
        line2 = PurchaseRequisitionLine.objects.create(
            purchase_requisition=pr,
            item_name='USB-C Hub',
            quantity='10.00',
            estimated_unit_price='45.00',
            unit_of_measure='PCS',
        )
        self.assertEqual(pr.status, 'DRAFT')
        self.assertTrue(pr.pr_number.startswith('PR-'))
        self.assertEqual(pr.total_estimated_amount, 6450.00)  # 5*1200 + 10*45

        # ---------------------------------------------------------------
        # Step 2: Requester submits the PR (DRAFT → SUBMITTED)
        # ---------------------------------------------------------------
        WorkflowEngine.transition('PR', pr, 'submit', 'REQUESTER')
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'SUBMITTED')

        # ---------------------------------------------------------------
        # Step 3: Budget Holder approves the PR (SUBMITTED → APPROVED)
        # ---------------------------------------------------------------
        approval_pr = Approval.objects.create(
            entity_type='PR',
            entity_id=pr.pk,
            approver=self.budget_holder,
            role='BUDGET_HOLDER',
            action='APPROVE',
            previous_status='SUBMITTED',
            new_status='APPROVED',
        )
        WorkflowEngine.transition('PR', pr, 'approve', 'BUDGET_HOLDER')
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'APPROVED')
        self.assertEqual(Approval.objects.filter(entity_id=pr.pk).count(), 1)

        # ---------------------------------------------------------------
        # Step 4: Procurement Officer starts processing the PR
        # ---------------------------------------------------------------
        WorkflowEngine.transition('PR', pr, 'process', 'PROCUREMENT_OFFICER')
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'PROCUREMENT_PROCESSING')

        # ---------------------------------------------------------------
        # Step 5: Procurement Officer creates an RFQ
        # ---------------------------------------------------------------
        rfq = RFQ.objects.create(
            purchase_requisition=pr,
            title='RFQ for Office Equipment',
            description='Please quote for laptops and USB hubs',
            submission_deadline=datetime.date.today() + datetime.timedelta(days=14),
            instructions='Include warranty terms with your quotation.',
            status='DRAFT',
            created_by=self.proc_officer,
        )
        rfq_line1 = RFQLine.objects.create(
            rfq=rfq, pr_line=line1, item_name='Laptop Dell XPS', quantity='5.00'
        )
        rfq_line2 = RFQLine.objects.create(
            rfq=rfq, pr_line=line2, item_name='USB-C Hub', quantity='10.00'
        )
        self.assertEqual(rfq.status, 'DRAFT')
        self.assertTrue(rfq.rfq_number.startswith('RFQ-'))

        # ---------------------------------------------------------------
        # Step 6: Invite suppliers to the RFQ
        # ---------------------------------------------------------------
        rfq_supplier_a = RFQSupplier.objects.create(rfq=rfq, supplier=self.supplier_a)
        rfq_supplier_b = RFQSupplier.objects.create(rfq=rfq, supplier=self.supplier_b)
        self.assertEqual(rfq.invited_suppliers.count(), 2)

        # ---------------------------------------------------------------
        # Step 7: Send the RFQ (DRAFT → SENT)
        # ---------------------------------------------------------------
        WorkflowEngine.transition('RFQ', rfq, 'send', 'PROCUREMENT_OFFICER')
        rfq.refresh_from_db()
        self.assertEqual(rfq.status, 'SENT')

        # ---------------------------------------------------------------
        # Step 8: Receive bids from two suppliers
        # ---------------------------------------------------------------
        bid_a = Bid.objects.create(
            rfq=rfq, supplier=self.supplier_a, bid_date=datetime.date.today(),
            expiry_date=datetime.date.today() + datetime.timedelta(days=30),
            freight_cost='150.00', insurance_cost='50.00', tax_amount='0.00',
            grand_total='6700.00',
            notes='Includes 1-year warranty',
            submitted_by=self.proc_officer,
        )
        BidLine.objects.create(
            bid=bid_a, rfq_line=rfq_line1,
            quantity_offered='5.00', unit_price='1230.00', total_price='6150.00'
        )
        BidLine.objects.create(
            bid=bid_a, rfq_line=rfq_line2,
            quantity_offered='10.00', unit_price='35.00', total_price='350.00'
        )

        bid_b = Bid.objects.create(
            rfq=rfq, supplier=self.supplier_b, bid_date=datetime.date.today(),
            freight_cost='200.00', insurance_cost='80.00', tax_amount='0.00',
            grand_total='7080.00',
            submitted_by=self.proc_officer,
        )
        BidLine.objects.create(
            bid=bid_b, rfq_line=rfq_line1,
            quantity_offered='5.00', unit_price='1280.00', total_price='6400.00'
        )
        BidLine.objects.create(
            bid=bid_b, rfq_line=rfq_line2,
            quantity_offered='10.00', unit_price='40.00', total_price='400.00'
        )

        self.assertEqual(rfq.bids.count(), 2)

        # ---------------------------------------------------------------
        # Step 9: Mark RFQ as responded (SENT → RESPONDED)
        # ---------------------------------------------------------------
        rfq_supplier_a.responded = True
        rfq_supplier_a.save()
        rfq_supplier_b.responded = True
        rfq_supplier_b.save()

        WorkflowEngine.transition('RFQ', rfq, 'respond', 'PROCUREMENT_OFFICER')
        rfq.refresh_from_db()
        self.assertEqual(rfq.status, 'RESPONDED')

        # ---------------------------------------------------------------
        # Step 10: Select winning bid (Alpha Supplies — lower price)
        # ---------------------------------------------------------------
        Bid.objects.filter(rfq=rfq, is_winner=True).update(is_winner=False)
        bid_a.is_winner = True
        bid_a.save()

        self.assertTrue(Bid.objects.get(pk=bid_a.pk).is_winner)
        self.assertFalse(Bid.objects.get(pk=bid_b.pk).is_winner)

        # ---------------------------------------------------------------
        # Step 11: Close the RFQ (RESPONDED → CLOSED)
        # ---------------------------------------------------------------
        WorkflowEngine.transition('RFQ', rfq, 'close', 'PROCUREMENT_OFFICER')
        rfq.refresh_from_db()
        self.assertEqual(rfq.status, 'CLOSED')

        # ---------------------------------------------------------------
        # Step 12: Generate Purchase Order from winning bid
        # ---------------------------------------------------------------
        po = PurchaseOrder.objects.create(
            purchase_requisition=pr,
            rfq=rfq,
            winning_bid=bid_a,
            supplier=self.supplier_a,
            currency='USD',
            subtotal='6500.00',
            freight_cost='150.00',
            insurance_cost='50.00',
            tax_amount='0.00',
            total_amount='6700.00',
            payment_terms='Net 30',
            delivery_method='Courier',
            notes='Please include packing list',
            created_by=self.proc_officer,
        )
        PurchaseOrderLine.objects.create(
            purchase_order=po, item_name='Laptop Dell XPS',
            quantity='5.00', unit_price='1230.00', total_price='6150.00'
        )
        PurchaseOrderLine.objects.create(
            purchase_order=po, item_name='USB-C Hub',
            quantity='10.00', unit_price='35.00', total_price='350.00'
        )

        self.assertEqual(po.status, 'PO_CREATED')
        self.assertTrue(po.po_number.startswith('PO-'))
        self.assertEqual(po.lines.count(), 2)

        # ---------------------------------------------------------------
        # Step 13: Submit PO for financial review (PO_CREATED → FINANCIAL_REVIEW)
        # ---------------------------------------------------------------
        WorkflowEngine.transition('PO', po, 'submit_for_review', 'PROCUREMENT_OFFICER')
        po.refresh_from_db()
        self.assertEqual(po.status, 'FINANCIAL_REVIEW')

        # ---------------------------------------------------------------
        # Step 14: Financial reviewer approves (FINANCIAL_REVIEW → FINANCIAL_APPROVED)
        # ---------------------------------------------------------------
        fin_review = FinancialReview.objects.create(
            purchase_order=po,
            reviewer=self.fin_reviewer,
            decision='APPROVED',
            comments='Budget is available. Approved.',
            previous_status='FINANCIAL_REVIEW',
            new_status='FINANCIAL_APPROVED',
        )
        WorkflowEngine.transition('PO', po, 'approve_financial', 'FINANCIAL_REVIEWER')
        po.refresh_from_db()
        self.assertEqual(po.status, 'FINANCIAL_APPROVED')
        self.assertEqual(FinancialReview.objects.filter(purchase_order=po).count(), 1)
        self.assertEqual(fin_review.decision, 'APPROVED')

        # ---------------------------------------------------------------
        # Step 15: Submit PO for final approval (FINANCIAL_APPROVED → FINAL_APPROVAL)
        # ---------------------------------------------------------------
        WorkflowEngine.transition('PO', po, 'submit_final', 'PROCUREMENT_OFFICER')
        po.refresh_from_db()
        self.assertEqual(po.status, 'FINAL_APPROVAL')

        # ---------------------------------------------------------------
        # Step 16: Budget Holder gives final approval (FINAL_APPROVAL → PO_APPROVED)
        # ---------------------------------------------------------------
        final_approval = Approval.objects.create(
            entity_type='PO',
            entity_id=po.pk,
            approver=self.budget_holder,
            role='BUDGET_HOLDER',
            action='APPROVE',
            previous_status='FINAL_APPROVAL',
            new_status='PO_APPROVED',
        )
        WorkflowEngine.transition('PO', po, 'approve', 'BUDGET_HOLDER')
        po.refresh_from_db()
        self.assertEqual(po.status, 'PO_APPROVED')

        # ---------------------------------------------------------------
        # Step 17: Pre-receive setup
        # ---------------------------------------------------------------
        pre_receive = PreReceive.objects.create(
            purchase_order=po,
            expected_delivery_date=datetime.date.today() + datetime.timedelta(days=5),
            notes='Expecting delivery in 5 days',
            created_by=self.warehouse,
        )
        self.assertEqual(pre_receive.purchase_order, po)

        # ---------------------------------------------------------------
        # Step 18: Warehouse records goods receipt (PO_APPROVED → GOODS_RECEIVED)
        # ---------------------------------------------------------------
        gr = GoodsReceipt.objects.create(
            purchase_order=po,
            received_by=self.warehouse,
            received_date=datetime.date.today(),
            status='COMPLETE',
            notes='All items received in good condition',
        )
        for po_line in po.lines.all():
            GoodsReceiptLine.objects.create(
                goods_receipt=gr,
                po_line=po_line,
                expected_quantity=po_line.quantity,
                received_quantity=po_line.quantity,
                notes='Complete delivery',
            )

        WorkflowEngine.transition('PO', po, 'receive', 'WAREHOUSE_OFFICER')
        po.refresh_from_db()
        self.assertEqual(po.status, 'GOODS_RECEIVED')
        self.assertTrue(gr.grn_number.startswith('GRN-'))
        self.assertEqual(gr.lines.count(), 2)
        self.assertEqual(gr.status, 'COMPLETE')

        # ---------------------------------------------------------------
        # Final Assertions — entire workflow completed successfully
        # ---------------------------------------------------------------
        self.assertEqual(pr.status, 'PROCUREMENT_PROCESSING')
        self.assertEqual(rfq.status, 'CLOSED')
        self.assertEqual(po.status, 'GOODS_RECEIVED')

        # Verify approval records
        pr_approvals = Approval.objects.filter(entity_id=pr.pk)
        po_approvals = Approval.objects.filter(entity_id=po.pk)
        self.assertEqual(pr_approvals.count(), 1)  # PR approve
        self.assertEqual(po_approvals.count(), 1)  # PO final approve

        # Verify financial review record
        self.assertEqual(FinancialReview.objects.filter(purchase_order=po, decision='APPROVED').count(), 1)

        # Verify GRN lines match PO lines
        self.assertEqual(
            GoodsReceiptLine.objects.filter(goods_receipt=gr).count(),
            po.lines.count()
        )


class WorkflowRejectionAndReturnCycleTest(TestCase):
    """
    Tests the rejection and return cycles — ensuring the system handles
    unhappy paths correctly and state integrity is maintained.
    """

    def setUp(self):
        self.org = Organization.objects.create(name='Rejection Corp', code='REJ-CORP')
        self.dept = Department.objects.create(name='Procurement', code='REJ-PROC', organization=self.org)
        self.requester = create_user('rej_req@corp.com', 'REQUESTER', self.dept)
        self.budget_holder = create_user('rej_bh@corp.com', 'BUDGET_HOLDER', self.dept)
        self.proc_officer = create_user('rej_proc@corp.com', 'PROCUREMENT_OFFICER', self.dept)

    def test_pr_return_and_resubmit_cycle(self):
        pr = PurchaseRequisition.objects.create(
            requester=self.requester, department=self.dept,
            title='Return Cycle PR', description='Test', status='DRAFT'
        )
        # Submit
        WorkflowEngine.transition('PR', pr, 'submit', 'REQUESTER')
        self.assertEqual(pr.status, 'SUBMITTED')
        # Budget holder returns
        WorkflowEngine.transition('PR', pr, 'return', 'BUDGET_HOLDER')
        self.assertEqual(pr.status, 'RETURNED')
        # Requester revises and resubmits
        pr.description = 'Revised description with more details'
        pr.save()
        WorkflowEngine.transition('PR', pr, 'submit', 'REQUESTER')
        self.assertEqual(pr.status, 'SUBMITTED')
        # Budget holder approves
        WorkflowEngine.transition('PR', pr, 'approve', 'BUDGET_HOLDER')
        self.assertEqual(pr.status, 'APPROVED')

    def test_pr_rejection_is_terminal(self):
        pr = PurchaseRequisition.objects.create(
            requester=self.requester, department=self.dept,
            title='Rejected PR', description='Test', status='SUBMITTED'
        )
        WorkflowEngine.transition('PR', pr, 'reject', 'BUDGET_HOLDER')
        self.assertEqual(pr.status, 'REJECTED')
        # Cannot submit from REJECTED
        with self.assertRaises(InvalidTransitionError):
            WorkflowEngine.transition('PR', pr, 'submit', 'REQUESTER')

    def test_po_returned_from_financial_review(self):
        supplier = Supplier.objects.create(
            legal_name='Return Supplier', contact_person='Rep',
            email='retsup@corp.com', phone='+25100000001'
        )
        pr = PurchaseRequisition.objects.create(
            requester=self.requester, department=self.dept,
            title='Return PO PR', description='Test', status='PROCUREMENT_PROCESSING'
        )
        rfq = RFQ.objects.create(
            purchase_requisition=pr, title='RFQ',
            submission_deadline=datetime.date.today() + datetime.timedelta(days=7),
            status='CLOSED', created_by=self.proc_officer,
        )
        bid = Bid.objects.create(
            rfq=rfq, supplier=supplier, bid_date=datetime.date.today(),
            grand_total='5000.00', is_winner=True, submitted_by=self.proc_officer
        )
        po = PurchaseOrder.objects.create(
            purchase_requisition=pr, rfq=rfq, winning_bid=bid,
            supplier=supplier, subtotal='4700.00', freight_cost='200.00',
            insurance_cost='100.00', tax_amount='0.00', total_amount='5000.00',
            created_by=self.proc_officer, status='FINANCIAL_REVIEW',
        )
        # Financial reviewer returns PO
        WorkflowEngine.transition('PO', po, 'return', 'FINANCIAL_REVIEWER')
        self.assertEqual(po.status, 'PO_CREATED')
        # Procurement officer can resubmit for review
        WorkflowEngine.transition('PO', po, 'submit_for_review', 'PROCUREMENT_OFFICER')
        self.assertEqual(po.status, 'FINANCIAL_REVIEW')
