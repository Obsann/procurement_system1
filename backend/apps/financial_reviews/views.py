from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FinancialReview
from .serializers import FinancialReviewSerializer
from apps.orders.models import PurchaseOrder
from apps.core.workflow import WorkflowEngine


class FinancialReviewViewSet(viewsets.ModelViewSet):
    queryset = FinancialReview.objects.all().order_by('-created_at')
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

        user_role = request.user.roles.first().name if request.user.roles.exists() else 'FINANCIAL_REVIEWER'
        previous_status = po.status
        action_name = 'approve_financial' if decision == 'APPROVED' else 'return'
        next_status = WorkflowEngine.transition('PO', po, action_name, user_role)

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
