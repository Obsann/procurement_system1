from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FinancialReview
from .serializers import FinancialReviewSerializer
from apps.orders.models import PurchaseOrder
from apps.core.workflow import WorkflowEngine


class FinancialReviewViewSet(viewsets.ModelViewSet):
    queryset = FinancialReview.objects.select_related('purchase_order', 'reviewer').order_by('-created_at')
    serializer_class = FinancialReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='review')
    def review_po(self, request):
        po_id = request.data.get('purchase_order')
        decision = request.data.get('decision')
        comments = request.data.get('comments', '')

        if not po_id or not decision:
            return Response({'error': 'purchase_order and decision are required.'}, status=400)

        try:
            po = PurchaseOrder.objects.get(id=po_id)
        except PurchaseOrder.DoesNotExist:
            return Response({'error': 'Purchase Order not found.'}, status=404)

        previous_status = po.status
        if decision not in {'APPROVED', 'RETURNED'}:
            return Response({'error': 'decision must be APPROVED or RETURNED.'}, status=400)
        action_name = 'approve_financial' if decision == 'APPROVED' else 'return'
        next_status, user_role = WorkflowEngine.transition_for_user('PO', po, action_name, request.user)

        review = FinancialReview.objects.create(
            purchase_order=po,
            reviewer=request.user,
            decision=decision,
            comments=comments,
            previous_status=previous_status,
            new_status=next_status,
        )

        return Response({
            'message': f'Financial review {decision.lower()} successfully.',
            'review_id': str(review.id),
            'new_status': next_status,
        })
