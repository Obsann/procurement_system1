from decimal import Decimal

from rest_framework import viewsets
from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.db.models import Sum
from .models import GoodsReceipt, GoodsReceiptLine
from .serializers import GoodsReceiptSerializer
from apps.core.permissions import IsWarehouseOfficer
from apps.core.workflow import WorkflowEngine

RECEIVABLE_PO_STATUSES = ('PO_APPROVED', 'PARTIALLY_RECEIVED')


class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.all().order_by('-created_at')
    serializer_class = GoodsReceiptSerializer
    permission_classes = [IsWarehouseOfficer]
    http_method_names = ['get', 'post']

    @transaction.atomic
    def perform_create(self, serializer):
        po = serializer.validated_data['purchase_order']
        lines_data = serializer.validated_data.get('lines', [])

        # BR-10: goods may only be received against a fully approved PO.
        if po.status not in RECEIVABLE_PO_STATUSES:
            raise ValidationError({
                'error': f'BR-10 Violation: Cannot receive goods. PO status is {po.status}, '
                         f'must be one of {", ".join(RECEIVABLE_PO_STATUSES)}.'
            })

        gr_status = serializer.validated_data.get('status', 'PARTIAL')
        if not lines_data and gr_status == 'PARTIAL':
            raise ValidationError({'error': 'Must provide at least one line item for a PARTIAL receipt.'})

        # Totals must be read before saving, otherwise the lines being created
        # are aggregated alongside the incoming quantities and counted twice.
        received_by_line = {
            row['po_line']: row['total']
            for row in GoodsReceiptLine.objects
            .filter(po_line__purchase_order=po)
            .values('po_line')
            .annotate(total=Sum('received_quantity'))
        }

        for line_data in lines_data:
            po_line = line_data['po_line']
            incoming = line_data['received_quantity']
            already_received = received_by_line.get(po_line.pk, Decimal('0'))
            running_total = already_received + incoming

            if running_total > po_line.quantity:
                raise ValidationError({
                    'error': f'Receiving {incoming} exceeds ordered quantity for PO Line {po_line.id}. '
                             f'(Ordered: {po_line.quantity}, Already Received: {already_received})'
                })

            received_by_line[po_line.pk] = running_total

        serializer.save()

        # The PO closes only once every ordered line is satisfied, not merely
        # the lines that happened to appear on this receipt.
        is_fully_received = all(
            received_by_line.get(line.pk, Decimal('0')) >= line.quantity
            for line in po.lines.all()
        )

        WorkflowEngine.transition_for_user(
            'PO', po, 'receive' if is_fully_received else 'receive_partial', self.request.user
        )
