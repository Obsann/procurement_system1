from django.db import models
from django.conf import settings

class RFQ(models.Model):
    rfq_number = models.CharField(max_length=50, unique=True)
    purchase_requisition = models.ForeignKey('procurement.PurchaseRequisition', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    submission_deadline = models.DateTimeField()
    instructions = models.TextField()
    status = models.CharField(max_length=50, choices=[
        ('DRAFT', 'Draft'), ('SENT', 'Sent'), ('RESPONDED', 'Responded'), ('CLOSED', 'Closed')
    ], default='DRAFT')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.rfq_number

class RFQLine(models.Model):
    rfq = models.ForeignKey(RFQ, related_name='lines', on_delete=models.CASCADE)
    pr_line = models.ForeignKey('procurement.PurchaseRequisitionLine', on_delete=models.CASCADE)
    item_name = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_of_measure = models.CharField(max_length=20)
    sort_order = models.IntegerField(default=0)

class RFQSupplier(models.Model):
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE)
    supplier = models.ForeignKey('suppliers.Supplier', on_delete=models.CASCADE)
    invited_at = models.DateTimeField(auto_now_add=True)
    responded = models.BooleanField(default=False)

    class Meta:
        unique_together = ('rfq', 'supplier')
