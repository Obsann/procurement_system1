from django.db import models
from apps.core.models import TimeStampedModel

class Organization(TimeStampedModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Department(TimeStampedModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Location(TimeStampedModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='locations')
    address = models.TextField(blank=True)
    city = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, default='Ethiopia')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.city}"
