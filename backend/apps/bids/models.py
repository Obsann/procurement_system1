from django.db import models
from django.conf import settings

class Bid(models.Model):
    rfq = models.ForeignKey('rfq.RFQ', on_delete=models.CASCADE)
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.CASCADE)
    bid_date = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField()
    lead_time_days = models.IntegerField()
    freight_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    insurance_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=15, decimal_places=2)
    is_winner = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Bid by {self.supplier.legal_name} for {self.rfq.rfq_number}"

class BidLine(models.Model):
    bid = models.ForeignKey(Bid, related_name='lines', on_delete=models.CASCADE)
    rfq_line = models.ForeignKey('rfq.RFQLine', on_delete=models.CASCADE)
    quantity_offered = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)

class BidAttachment(models.Model):
    bid = models.ForeignKey(Bid, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='bid_attachments/')
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
