from django.db import models
from django.conf import settings

class Approval(models.Model):
    ENTITY_CHOICES = [('PR', 'Purchase Requisition'), ('PO', 'Purchase Order')]
    ACTION_CHOICES = [('APPROVE', 'Approve'), ('REJECT', 'Reject'), ('RETURN', 'Return')]

    entity_type = models.CharField(max_length=2, choices=ENTITY_CHOICES)
    entity_id = models.UUIDField()
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    comment = models.TextField(blank=True)
    previous_status = models.CharField(max_length=50)
    new_status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
