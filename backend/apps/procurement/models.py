from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class PurchaseRequisition(TimeStampedModel):
    pr_number = models.CharField(max_length=50, unique=True)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    department = models.ForeignKey('organizations.Department', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    delivery_location = models.ForeignKey('organizations.Location', null=True, blank=True, on_delete=models.SET_NULL)
    required_delivery_date = models.DateField()
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=50, choices=[
        ('DRAFT', 'Draft'), ('SUBMITTED', 'Submitted'), ('APPROVED', 'Approved'),
        ('RETURNED', 'Returned'), ('REJECTED', 'Rejected'), ('PROCUREMENT_PROCESSING', 'Procurement Processing')
    ], default='DRAFT')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    @property
    def total_estimated_amount(self):
        return sum(line.estimated_total for line in self.lines.all())

    def __str__(self):
        return self.pr_number

class PurchaseRequisitionLine(models.Model):
    purchase_requisition = models.ForeignKey(PurchaseRequisition, related_name='lines', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_of_measure = models.CharField(max_length=20)
    estimated_unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    sort_order = models.IntegerField(default=0)

    @property
    def estimated_total(self):
        return self.quantity * self.estimated_unit_price

    def __str__(self):
        return f"{self.item_name} - {self.purchase_requisition.pr_number}"

class PurchaseRequisitionAttachment(models.Model):
    purchase_requisition = models.ForeignKey(PurchaseRequisition, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='pr_attachments/')
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
