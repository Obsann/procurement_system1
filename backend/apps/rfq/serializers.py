from rest_framework import serializers
from .models import RFQ, RFQLine, RFQSupplier

class RFQLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFQLine
        fields = '__all__'
        # The parent serializer attaches the line to the RFQ it just created,
        # so demanding it on input makes nested creation impossible.
        read_only_fields = ['rfq']

class RFQSupplierSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.legal_name', read_only=True)

    class Meta:
        model = RFQSupplier
        fields = ['id', 'supplier', 'supplier_name', 'invited_at', 'responded']

class RFQSerializer(serializers.ModelSerializer):
    lines = RFQLineSerializer(many=True, required=False)
    invited_suppliers = RFQSupplierSerializer(many=True, read_only=True)
    supplier_ids = serializers.ListField(child=serializers.UUIDField(), write_only=True, required=False)

    class Meta:
        model = RFQ
        fields = ['id', 'rfq_number', 'purchase_requisition', 'title', 'description', 'submission_deadline', 'instructions', 'status', 'lines', 'invited_suppliers', 'supplier_ids', 'created_at']
        read_only_fields = ['id', 'rfq_number', 'status', 'created_at']

    def create(self, validated_data):
        supplier_ids = validated_data.pop('supplier_ids', [])
        lines_data = validated_data.pop('lines', [])
        validated_data['created_by'] = self.context['request'].user
        rfq = RFQ.objects.create(**validated_data)
        
        for line_data in lines_data:
            RFQLine.objects.create(rfq=rfq, **line_data)
            
        for supplier_id in supplier_ids:
            RFQSupplier.objects.create(rfq=rfq, supplier_id=supplier_id)
            
        return rfq
