from rest_framework import serializers
from .models import FinancialReview

class FinancialReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialReview
        fields = ['id', 'purchase_order', 'reviewer', 'decision', 'comments', 'reviewed_at']
        read_only_fields = ['id', 'reviewer', 'reviewed_at']

    def validate(self, data):
        decision = data.get('decision')
        comments = data.get('comments')

        if decision == 'RETURNED' and not comments:
            raise serializers.ValidationError({
                'comments': 'Comments are mandatory when returning a Purchase Order.'
            })
        return data