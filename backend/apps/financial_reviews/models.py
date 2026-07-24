from django.db import models
from apps.core.models import TimeStampedModel


class FinancialReview(TimeStampedModel):
    DECISION_CHOICES = [
        ('APPROVED', 'Approved'),
        ('RETURNED', 'Returned'),
    ]

    class Decision(models.TextChoices):
        APPROVED = 'APPROVED', 'Approved'
        RETURNED = 'RETURNED', 'Returned'

    purchase_order = models.ForeignKey(
        'orders.PurchaseOrder', on_delete=models.CASCADE, related_name='financial_reviews'
    )
    reviewer = models.ForeignKey(
        'accounts.User', on_delete=models.RESTRICT, related_name='financial_reviews'
    )
    decision = models.CharField(max_length=10, choices=Decision.choices)
    comments = models.TextField(blank=True, null=True)
    previous_status = models.CharField(max_length=50, blank=True, null=True)
    new_status = models.CharField(max_length=50, blank=True, null=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-reviewed_at']

    def __str__(self):
        return f"PO {self.purchase_order.po_number} - {self.decision}"
