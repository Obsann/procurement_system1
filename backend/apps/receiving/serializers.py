from rest_framework import serializers
from .models import PreReceive, GoodsReceipt, GoodsReceiptLine


class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoodsReceiptLine
        fields = '__all__'


class GoodsReceiptSerializer(serializers.ModelSerializer):
    lines = GoodsReceiptLineSerializer(many=True, required=False)
    received_by_name = serializers.SerializerMethodField()
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)

    class Meta:
        model = GoodsReceipt
        fields = ['id', 'purchase_order', 'po_number', 'grn_number', 'received_by', 'received_by_name', 'received_date', 'status', 'notes', 'lines', 'created_at']
        read_only_fields = ['id', 'grn_number', 'received_by', 'created_at']

    def get_received_by_name(self, obj):
        return f"{obj.received_by.first_name} {obj.received_by.last_name}"

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        validated_data['received_by'] = self.context['request'].user
        gr = GoodsReceipt.objects.create(**validated_data)
        for line_data in lines_data:
            GoodsReceiptLine.objects.create(goods_receipt=gr, **line_data)
        return gr


class PreReceiveSerializer(serializers.ModelSerializer):
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)

    class Meta:
        model = PreReceive
        fields = ['id', 'purchase_order', 'po_number', 'expected_delivery_date', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
