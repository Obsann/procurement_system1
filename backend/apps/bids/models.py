from django.db import models

from apps.core.models import TimeStampedModel


class Bid(TimeStampedModel):
    rfq = models.ForeignKey('rfq.RFQ', on_delete=models.CASCADE, related_name='bids')
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.CASCADE, related_name='bids')
    bid_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    lead_time_days = models.PositiveIntegerField(null=True, blank=True)
    freight_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=14, decimal_places=2)
    is_winner = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    submitted_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Bid from {self.supplier.legal_name} for {self.rfq.rfq_number} - ${self.grand_total}"


class BidLine(TimeStampedModel):
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='lines')
    rfq_line = models.ForeignKey('rfq.RFQLine', on_delete=models.SET_NULL, null=True, blank=True)
    quantity_offered = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=14, decimal_places=2)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"BidLine: {self.quantity_offered} x ${self.unit_price}"


class BidAttachment(TimeStampedModel):
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='bid_attachments/')
    file_name = models.CharField(max_length=255)

    def __str__(self):
        return self.file_name
