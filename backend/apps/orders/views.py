from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PurchaseOrder, PurchaseOrderLine
from .serializers import PurchaseOrderSerializer
from apps.core.workflow import WorkflowEngine


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related('purchase_requisition', 'rfq', 'supplier', 'created_by').prefetch_related('lines').order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'supplier', 'purchase_requisition']
    search_fields = ['po_number', 'supplier__legal_name']
    ordering_fields = ['created_at', 'total_amount', 'status']

    @action(detail=False, methods=['post'], url_path='generate-from-bid')
    def generate_from_bid(self, request):
        """Generate a PO from a winning bid."""
        from apps.bids.models import Bid
        bid_id = request.data.get('bid_id')
        if not bid_id:
            return Response({'error': 'bid_id is required.'}, status=400)

        try:
            bid = Bid.objects.get(id=bid_id, is_winner=True)
        except Bid.DoesNotExist:
            return Response({'error': 'Winning bid not found.'}, status=404)

        po = PurchaseOrder.objects.create(
            purchase_requisition=bid.rfq.purchase_requisition,
            rfq=bid.rfq,
            winning_bid=bid,
            supplier=bid.supplier,
            currency='USD',
            subtotal=bid.grand_total - bid.freight_cost - bid.insurance_cost - bid.tax_amount,
            freight_cost=bid.freight_cost,
            insurance_cost=bid.insurance_cost,
            tax_amount=bid.tax_amount,
            total_amount=bid.grand_total,
            created_by=request.user,
        )

        for bid_line in bid.lines.all():
            PurchaseOrderLine.objects.create(
                purchase_order=po,
                item_name=bid_line.rfq_line.item_name if bid_line.rfq_line else 'Item',
                description=bid_line.notes,
                quantity=bid_line.quantity_offered,
                unit_price=bid_line.unit_price,
                total_price=bid_line.total_price,
            )

        serializer = self.get_serializer(po)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['post'], url_path='submit-for-review')
    def submit_for_review(self, request, pk=None):
        po = self.get_object()
        next_status, _ = WorkflowEngine.transition_for_user('PO', po, 'submit_for_review', request.user)
        po.submitted_at = timezone.now()
        po.save()
        return Response({'status': next_status, 'message': 'PO submitted for financial review.'})

    @action(detail=True, methods=['post'], url_path='submit-final')
    def submit_final(self, request, pk=None):
        """Hand a financially approved PO to the budget holder for sign-off.

        The workflow engine has always defined this transition, but nothing
        exposed it, so purchase orders stopped dead at FINANCIAL_APPROVED and
        could never be approved or received.
        """
        po = self.get_object()
        next_status, _ = WorkflowEngine.transition_for_user('PO', po, 'submit_final', request.user)
        return Response({'status': next_status, 'message': 'PO submitted for final approval.'})
