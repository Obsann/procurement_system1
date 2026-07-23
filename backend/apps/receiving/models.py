from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.utils import generate_grn_number


class PreReceive(TimeStampedModel):
    purchase_order = models.OneToOneField('orders.PurchaseOrder', on_delete=models.CASCADE, related_name='pre_receive')
    expected_delivery_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.PROTECT)

    def __str__(self):
        return f"Pre-Receive for {self.purchase_order.po_number}"


class GoodsReceipt(TimeStampedModel):
    STATUS_CHOICES = [
        ('PARTIAL', 'Partial'),
        ('COMPLETE', 'Complete'),
    ]

    purchase_order = models.ForeignKey('orders.PurchaseOrder', on_delete=models.CASCADE, related_name='goods_receipts')
    grn_number = models.CharField(max_length=50, unique=True, default=generate_grn_number)
    received_by = models.ForeignKey('accounts.User', on_delete=models.PROTECT)
    received_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PARTIAL')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.grn_number} - {self.purchase_order.po_number}"


class GoodsReceiptLine(TimeStampedModel):
    goods_receipt = models.ForeignKey(GoodsReceipt, on_delete=models.CASCADE, related_name='lines')
    po_line = models.ForeignKey('orders.PurchaseOrderLine', on_delete=models.CASCADE)
    expected_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    received_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Received {self.received_quantity}/{self.expected_quantity}"
