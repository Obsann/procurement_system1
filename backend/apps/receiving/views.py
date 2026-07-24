
from rest_framework import viewsets, permissions
from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.db.models import Sum
from .models import GoodsReceipt, GoodsReceiptLine
from .serializers import GoodsReceiptSerializer
from apps.orders.models import PurchaseOrder
from apps.core.permissions import IsWarehouseOfficer

class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.all().order_by('-created_at')
    serializer_class = GoodsReceiptSerializer
    permission_classes = [IsWarehouseOfficer] # Apply your RBAC rule
    http_method_names = ['get', 'post']

    @transaction.atomic
    def perform_create(self, serializer):
        po = serializer.validated_data['purchase_order']
        lines_data = serializer.validated_data.get('lines', [])

        # BR-10: Check PO Status
        if po.status not in ['PO_APPROVED', 'PARTIALLY_RECEIVED']:
            raise ValidationError({
                'error': f'BR-10 Violation: Cannot receive goods. PO status is {po.status}, must be PO_APPROVED or PARTIALLY_RECEIVED.'
            })

        gr_status = serializer.validated_data.get('status', 'PARTIAL')
        if not lines_data and gr_status == 'PARTIAL':
            raise ValidationError({'error': 'Must provide at least one line item for a PARTIAL receipt.'})

        # 1. Save the Goods Receipt using Obsan's serializer logic
        receipt = serializer.save()

        is_fully_received = True

        # 2. Validate quantities and update PO Line tracking
        for line_data in lines_data:
            po_line = line_data['po_line']
            qty_received_now = line_data['received_quantity']
            
            # Calculate total received for this PO Line across all receipts
            total_received = GoodsReceiptLine.objects.filter(po_line=po_line).aggregate(
                total=Sum('received_quantity')
            )['total'] or 0

            # Add the current quantity being received
            total_received += qty_received_now

            # BR-10 (defense in depth): Check against ordered quantity
            if total_received > po_line.quantity:
                raise ValidationError({
                    'error': f'Receiving {qty_received_now} exceeds ordered quantity for PO Line {po_line.id}. (Ordered: {po_line.quantity}, Already Received: {total_received - qty_received_now})'
                })

            # Check if this line is fully received
            if total_received < po_line.quantity:
                is_fully_received = False

        # 3. Update PO Status
        if is_fully_received:
            po.status = 'GOODS_RECEIVED'
        else:
            po.status = 'PARTIALLY_RECEIVED'
        
        po.save()

