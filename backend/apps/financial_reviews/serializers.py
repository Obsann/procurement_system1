from rest_framework import serializers
from .models import FinancialReview


class FinancialReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)

    class Meta:
        model = FinancialReview
        fields = ['id', 'purchase_order', 'po_number', 'reviewer', 'reviewer_name', 'review_date', 'decision', 'comments', 'previous_status', 'new_status', 'created_at']
        read_only_fields = ['id', 'reviewer', 'review_date', 'previous_status', 'new_status', 'created_at']

    def get_reviewer_name(self, obj):
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"
