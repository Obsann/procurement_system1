from django.db import models

from apps.core.models import TimeStampedModel
from apps.core.utils import generate_supplier_code

class Supplier(TimeStampedModel):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('BLOCKED', 'Blocked'),
    ]

    supplier_code = models.CharField(max_length=50, unique=True, default=generate_supplier_code)
    legal_name = models.CharField(max_length=150)
    display_name = models.CharField(max_length=150, blank=True)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, default='Ethiopia')
    tax_id = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    categories = models.TextField(blank=True, help_text="Comma separated categories")
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.legal_name} ({self.supplier_code})"

class SupplierContact(TimeStampedModel):
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    position = models.CharField(max_length=50, blank=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.supplier.legal_name}"

