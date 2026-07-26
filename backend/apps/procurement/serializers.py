from django.db import transaction
from rest_framework import serializers
from .models import PurchaseRequisition, PurchaseRequisitionLine, PurchaseRequisitionAttachment

class PurchaseRequisitionLineSerializer(serializers.ModelSerializer):
    estimated_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseRequisitionLine
        fields = ['id', 'item_name', 'description', 'category', 'quantity', 'unit_of_measure', 'estimated_unit_price', 'estimated_total', 'sort_order']

    def validate(self, attrs):
        if attrs['quantity'] <= 0 or attrs['estimated_unit_price'] < 0:
            raise serializers.ValidationError('Quantity must be positive and unit price cannot be negative.')
        return attrs

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
        with transaction.atomic():
            pr = PurchaseRequisition.objects.create(**validated_data)
            for line_data in lines_data:
                PurchaseRequisitionLine.objects.create(purchase_requisition=pr, **line_data)
        return pr

    # BR-03: locked after submission "unless it is returned for correction",
    # so a returned requisition has to be editable or the return path is a
    # dead end and the requester can only resubmit the same document.
    EDITABLE_STATUSES = ('DRAFT', 'RETURNED')

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        if instance.status not in self.EDITABLE_STATUSES:
            raise serializers.ValidationError(
                'Only draft or returned requisitions can be edited.'
            )
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            if lines_data is not None:
                instance.lines.all().delete()
                for line_data in lines_data:
                    PurchaseRequisitionLine.objects.create(purchase_requisition=instance, **line_data)
        return instance
