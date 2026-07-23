from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from .models import FinancialReview
from .serializers import FinancialReviewSerializer
from apps.orders.models import PurchaseOrder
from apps.core.permissions import IsFinancialReviewer

class FinancialReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Financial Reviewers to approve or return Purchase Orders.
    """
    queryset = FinancialReview.objects.all()
    serializer_class = FinancialReviewSerializer
    permission_classes = [IsFinancialReviewer]
    http_method_names = ['get', 'post']

    def perform_create(self, serializer):
        po = serializer.validated_data['purchase_order']
        decision = serializer.validated_data['decision']
        reviewer = self.request.user

        # Business Rule: Can only review POs currently in FINANCIAL_REVIEW
        if po.status != 'FINANCIAL_REVIEW':
            raise ValidationError({
                'error': f'Cannot review PO. Current status is {po.status}, must be FINANCIAL_REVIEW.'
            })

        # Save the review record
        review = serializer.save(reviewer=reviewer)

        # Transition the PO status
        if decision == 'APPROVED':
            # For MVP, we transition straight to PO_APPROVED to bypass FINAL_APPROVAL delay
            po.status = 'PO_APPROVED'
            po.final_approved_at = review.reviewed_at
        elif decision == 'RETURNED':
            # Return to PO_CREATED so Procurement can fix it
            po.status = 'PO_CREATED'
        
        po.save()