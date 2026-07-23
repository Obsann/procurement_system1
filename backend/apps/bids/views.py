from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import Bid
from .serializers import BidSerializer
from apps.core.permissions import IsProcurementOfficer

class BidViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing bids and selecting the winning supplier.
    """
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsProcurementOfficer]
    http_method_names = ['get', 'post'] # Only allow viewing and creating bids initially

    @action(detail=True, methods=['post'], url_path='select')
    @transaction.atomic
    def select_winner(self, request, pk=None):
        """
        Custom endpoint: POST /api/bids/{id}/select/
        Enforces BR-06 (min 2 distinct suppliers) and BR-07 (only one winner).
        """
        bid = self.get_object()
        rfq = bid.rfq

        # BR-06: Check for minimum 2 distinct supplier bids
        distinct_suppliers = Bid.objects.filter(rfq=rfq).values('supplier_id').distinct().count()
        if distinct_suppliers < 2:
            raise ValidationError({
                'error': 'BR-06 Violation: Cannot select a winner. RFQ must have bids from at least 2 distinct suppliers.'
            })

        # Check if RFQ is already closed
        if rfq.status == 'CLOSED':
            raise ValidationError({
                'error': 'This RFQ is already closed and a winner has been selected.'
            })

        # BR-07: Unselect any previous winners for this RFQ
        Bid.objects.filter(rfq=rfq, is_winner=True).update(is_winner=False)

        # Select the new winner
        bid.is_winner = True
        bid.save()

        # Close the RFQ
        rfq.status = 'CLOSED'
        rfq.save()

        serializer = self.get_serializer(bid)
        return Response({'message': 'Winning supplier selected successfully.', 'bid': serializer.data}, status=status.HTTP_200_OK)