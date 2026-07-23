from django.db import models
from django.conf import settings

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('PO_CREATED', 'PO Created'), ('FINANCIAL_REVIEW', 'Financial Review'),
        ('FINANCIAL_APPROVED', 'Financial Approved'), ('FINAL_APPROVAL', 'Final Approval'),
        ('PO_APPROVED', 'PO Approved'), ('GOODS_RECEIVED', 'Goods Received')
    ]
    po_number = models.CharField(max_length=50, unique=True)
    purchase_requisition = models.ForeignKey('procurement.PurchaseRequisition', on_delete=models.CASCADE)
    rfq = models.ForeignKey('rfq.RFQ', null=True, blank=True, on_delete=models.SET_NULL)
    winning_bid = models.ForeignKey('bids.Bid', null=True, blank=True, on_delete=models.SET_NULL)
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PO_CREATED')
    currency = models.CharField(max_length=3, default='USD')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2)
    freight_cost = models.DecimalField(max_digits=10, decimal_places=2)
    insurance_cost = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_terms = models.TextField()
    delivery_method = models.CharField(max_length=100)
    delivery_location = models.ForeignKey('organizations.Location', null=True, blank=True, on_delete=models.SET_NULL)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.po_number

class PurchaseOrderLine(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, related_name='lines', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    sort_order = models.IntegerField(default=0)
