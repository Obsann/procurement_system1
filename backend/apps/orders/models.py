from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.utils import generate_po_number


class PurchaseOrder(TimeStampedModel):
    STATUS_CHOICES = [
        ('PO_CREATED', 'PO Created'),
        ('FINANCIAL_REVIEW', 'Financial Review'),
        ('FINANCIAL_APPROVED', 'Financial Approved'),
        ('FINAL_APPROVAL', 'Final Approval'),
        ('PO_APPROVED', 'PO Approved'),
        ('REJECTED', 'Rejected'),
        ('PARTIALLY_RECEIVED', 'Partially Received'),
        ('GOODS_RECEIVED', 'Goods Received'),
    ]

    po_number = models.CharField(max_length=50, unique=True, default=generate_po_number)
    purchase_requisition = models.ForeignKey('procurement.PurchaseRequisition', on_delete=models.CASCADE, related_name='purchase_orders')
    rfq = models.ForeignKey('rfq.RFQ', on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_orders')
    winning_bid = models.ForeignKey('bids.Bid', on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_orders')
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.PROTECT, related_name='purchase_orders')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PO_CREATED')
    currency = models.CharField(max_length=10, default='USD')
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    freight_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=100, blank=True)
    delivery_method = models.CharField(max_length=100, blank=True)
    delivery_location = models.ForeignKey('organizations.Location', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.PROTECT, related_name='created_purchase_orders')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.po_number} - {self.supplier.legal_name} (${self.total_amount})"


class PurchaseOrderLine(TimeStampedModel):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines')
    item_name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=14, decimal_places=2)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.item_name} (x{self.quantity}) - ${self.total_price}"
