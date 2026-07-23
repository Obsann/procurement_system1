from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.utils import generate_rfq_number

class RFQ(TimeStampedModel):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('RESPONDED', 'Responded'),
        ('CLOSED', 'Closed'),
    ]

    rfq_number = models.CharField(max_length=50, unique=True, default=generate_rfq_number)
    purchase_requisition = models.ForeignKey('procurement.PurchaseRequisition', on_delete=models.CASCADE, related_name='rfqs')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    submission_deadline = models.DateField()
    instructions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    created_by = models.ForeignKey('accounts.User', on_delete=models.PROTECT)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.rfq_number} - {self.title}"

class RFQLine(TimeStampedModel):
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='lines')
    pr_line = models.ForeignKey('procurement.PurchaseRequisitionLine', on_delete=models.SET_NULL, null=True, blank=True)
    item_name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_of_measure = models.CharField(max_length=30, default='PCS')
    sort_order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.item_name

class RFQSupplier(TimeStampedModel):
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='invited_suppliers')
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.CASCADE)
    invited_at = models.DateTimeField(auto_now_add=True)
    responded = models.BooleanField(default=False)

    class Meta:
        unique_together = ('rfq', 'supplier')

    def __str__(self):
        return f"{self.supplier.legal_name} - {self.rfq.rfq_number}"
