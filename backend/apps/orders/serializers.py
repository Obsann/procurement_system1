from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderLine


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderLine
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.legal_name', read_only=True)
    pr_number = serializers.CharField(source='purchase_requisition.pr_number', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'purchase_requisition', 'pr_number', 'rfq',
            'winning_bid', 'supplier', 'supplier_name', 'status', 'currency',
            'subtotal', 'freight_cost', 'insurance_cost', 'tax_amount',
            'total_amount', 'payment_terms', 'delivery_method', 'delivery_location',
            'notes', 'lines', 'submitted_at', 'approved_at', 'created_at'
        ]
        read_only_fields = ['id', 'po_number', 'status', 'submitted_at', 'approved_at', 'created_at']
