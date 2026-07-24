import uuid
from django.db import models


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)
    entity_id = models.UUIDField()
    old_status = models.CharField(max_length=30, blank=True, null=True)
    new_status = models.CharField(max_length=30, blank=True, null=True)
    comment = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    extra_data = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']
        # Append-only: no update/delete in normal operations
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"[{self.timestamp}] {self.action} on {self.entity_type}/{self.entity_id}"

    def save(self, *args, **kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists():
            raise RuntimeError('AuditLog entries are immutable.')
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise RuntimeError('AuditLog entries cannot be deleted.')
