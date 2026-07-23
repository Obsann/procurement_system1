from django.db import models
from apps.core.models import TimeStampedModel


class FinancialReview(TimeStampedModel):
    DECISION_CHOICES = [
        ('APPROVED', 'Approved'),
        ('RETURNED', 'Returned'),
    ]

    purchase_order = models.ForeignKey('orders.PurchaseOrder', on_delete=models.CASCADE, related_name='financial_reviews')
    reviewer = models.ForeignKey('accounts.User', on_delete=models.PROTECT)
    review_date = models.DateTimeField(auto_now_add=True)
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    comments = models.TextField(blank=True)
    previous_status = models.CharField(max_length=30)
    new_status = models.CharField(max_length=30)

    def __str__(self):
        return f"Financial Review: {self.purchase_order.po_number} - {self.decision}"
