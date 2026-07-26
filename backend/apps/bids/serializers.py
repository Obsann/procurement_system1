from rest_framework import serializers
from .models import Bid, BidLine, BidAttachment


class BidLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = BidLine
        fields = '__all__'
        # Set by BidSerializer.create once the parent bid exists.
        read_only_fields = ['bid']


class BidAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BidAttachment
        fields = ['id', 'file', 'file_name', 'created_at']


class BidSerializer(serializers.ModelSerializer):
    lines = BidLineSerializer(many=True, required=False)
    attachments = BidAttachmentSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.legal_name', read_only=True)

    class Meta:
        model = Bid
        fields = [
            'id', 'rfq', 'supplier', 'supplier_name', 'bid_date', 'expiry_date',
            'lead_time_days', 'freight_cost', 'insurance_cost', 'tax_amount',
            'grand_total', 'is_winner', 'notes', 'lines', 'attachments', 'created_at'
        ]
        read_only_fields = ['id', 'is_winner', 'created_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        validated_data['submitted_by'] = self.context['request'].user
        bid = Bid.objects.create(**validated_data)
        for line_data in lines_data:
            BidLine.objects.create(bid=bid, **line_data)
        return bid
