from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Bid
from .serializers import BidSerializer


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all().order_by('-created_at')
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def select_winner(self, request, pk=None):
        bid = self.get_object()
        # Clear any existing winner for this RFQ
        Bid.objects.filter(rfq=bid.rfq, is_winner=True).update(is_winner=False)
        bid.is_winner = True
        bid.save()
        return Response({
            'message': f'Supplier "{bid.supplier.legal_name}" selected as winning bidder.',
            'bid_id': str(bid.id),
            'supplier': bid.supplier.legal_name,
            'grand_total': str(bid.grand_total)
        })
