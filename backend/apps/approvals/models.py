import uuid
from django.db import models
from apps.core.models import TimeStampedModel


class Approval(TimeStampedModel):
    ENTITY_TYPE_CHOICES = [
        ('PR', 'Purchase Requisition'),
        ('PO', 'Purchase Order'),
    ]
    ACTION_CHOICES = [
        ('APPROVE', 'Approve'),
        ('REJECT', 'Reject'),
        ('RETURN', 'Return'),
    ]

    entity_type = models.CharField(max_length=10, choices=ENTITY_TYPE_CHOICES)
    entity_id = models.UUIDField()
    approver = models.ForeignKey('accounts.User', on_delete=models.PROTECT, related_name='approvals')
    role = models.CharField(max_length=50)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    comment = models.TextField(blank=True)
    previous_status = models.CharField(max_length=30)
    new_status = models.CharField(max_length=30)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.entity_type}-{self.entity_id}: {self.action} by {self.approver}"
