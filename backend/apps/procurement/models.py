from django.db import models
from apps.core.models import TimeStampedModel
from apps.core.utils import generate_pr_number

class PurchaseRequisition(TimeStampedModel):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('RETURNED', 'Returned'),
        ('REJECTED', 'Rejected'),
        ('PROCUREMENT_PROCESSING', 'Procurement Processing'),
    ]

    pr_number = models.CharField(max_length=50, unique=True, default=generate_pr_number)
    requester = models.ForeignKey('accounts.User', on_delete=models.PROTECT, related_name='purchase_requisitions')
    department = models.ForeignKey('organizations.Department', on_delete=models.PROTECT, related_name='purchase_requisitions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    delivery_location = models.ForeignKey('organizations.Location', on_delete=models.SET_NULL, null=True, blank=True)
    required_delivery_date = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='DRAFT')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.pr_number} - {self.title}"

    @property
    def total_estimated_amount(self):
        return sum(line.estimated_total for line in self.lines.all())

class PurchaseRequisitionLine(TimeStampedModel):
    purchase_requisition = models.ForeignKey(PurchaseRequisition, on_delete=models.CASCADE, related_name='lines')
    item_name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_of_measure = models.CharField(max_length=30, default='PCS')
    estimated_unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'created_at']

    def __str__(self):
        return f"{self.item_name} (x{self.quantity})"

    @property
    def estimated_total(self):
        from decimal import Decimal
        return Decimal(str(self.quantity)) * Decimal(str(self.estimated_unit_price))

class PurchaseRequisitionAttachment(TimeStampedModel):
    purchase_requisition = models.ForeignKey(PurchaseRequisition, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='pr_attachments/')
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.file_name
