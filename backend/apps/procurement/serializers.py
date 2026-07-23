from rest_framework import serializers
from .models import PurchaseRequisition, PurchaseRequisitionLine, PurchaseRequisitionAttachment

class PurchaseRequisitionLineSerializer(serializers.ModelSerializer):
    estimated_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseRequisitionLine
        fields = ['id', 'item_name', 'description', 'category', 'quantity', 'unit_of_measure', 'estimated_unit_price', 'estimated_total', 'sort_order']

class PurchaseRequisitionAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseRequisitionAttachment
        fields = ['id', 'file', 'file_name', 'file_size', 'created_at']

class PurchaseRequisitionSerializer(serializers.ModelSerializer):
    lines = PurchaseRequisitionLineSerializer(many=True, required=False)
    attachments = PurchaseRequisitionAttachmentSerializer(many=True, read_only=True)
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    total_estimated_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseRequisition
        fields = [
            'id', 'pr_number', 'requester', 'requester_name', 'department', 'department_name',
            'title', 'description', 'delivery_location', 'required_delivery_date', 'currency',
            'status', 'total_estimated_amount', 'lines', 'attachments', 'submitted_at', 'approved_at', 'created_at'
        ]
        read_only_fields = ['id', 'pr_number', 'requester', 'status', 'submitted_at', 'approved_at', 'created_at']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        validated_data['requester'] = self.context['request'].user
        pr = PurchaseRequisition.objects.create(**validated_data)
        for line_data in lines_data:
            PurchaseRequisitionLine.objects.create(purchase_requisition=pr, **line_data)
        return pr

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lines_data is not None:
            instance.lines.all().delete()
            for line_data in lines_data:
                PurchaseRequisitionLine.objects.create(purchase_requisition=instance, **line_data)
        return instance
