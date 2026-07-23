import uuid
from django.db import models
from apps.core.models import TimeStampedModel


class Notification(TimeStampedModel):
    recipient = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    entity_type = models.CharField(max_length=50, blank=True, null=True)
    entity_id = models.UUIDField(blank=True, null=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.recipient.email}: {self.title}"
