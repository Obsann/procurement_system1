from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=100)
    entity_id = models.UUIDField()
    old_status = models.CharField(max_length=50, null=True, blank=True)
    new_status = models.CharField(max_length=50, null=True, blank=True)
    comment = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    extra_data = models.JSONField(null=True, blank=True)
