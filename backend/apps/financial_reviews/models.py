from django.db import models
from django.conf import settings

class FinancialReview(models.Model):
    purchase_order = models.ForeignKey('orders.PurchaseOrder', on_delete=models.CASCADE)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    review_date = models.DateTimeField(auto_now_add=True)
    decision = models.CharField(max_length=20, choices=[('APPROVED', 'Approved'), ('RETURNED', 'Returned')])
    comments = models.TextField(blank=True)
    previous_status = models.CharField(max_length=50)
    new_status = models.CharField(max_length=50)
