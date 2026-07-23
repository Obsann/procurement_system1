from django.db import models
from django.conf import settings

class PreReceive(models.Model):
    purchase_order = models.OneToOneField('orders.PurchaseOrder', on_delete=models.CASCADE)
    expected_delivery_date = models.DateField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class GoodsReceipt(models.Model):
    purchase_order = models.ForeignKey('orders.PurchaseOrder', on_delete=models.CASCADE)
    grn_number = models.CharField(max_length=50, unique=True)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    received_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[('PARTIAL', 'Partial'), ('COMPLETE', 'Complete')])
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class GoodsReceiptLine(models.Model):
    goods_receipt = models.ForeignKey(GoodsReceipt, related_name='lines', on_delete=models.CASCADE)
    po_line = models.ForeignKey('orders.PurchaseOrderLine', on_delete=models.CASCADE)
    expected_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    received_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
