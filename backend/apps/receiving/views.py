from rest_framework import viewsets, permissions
from .models import GoodsReceipt
from .serializers import GoodsReceiptSerializer


class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.all().order_by('-created_at')
    serializer_class = GoodsReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
