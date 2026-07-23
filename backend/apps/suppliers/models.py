from django.db import models

class Supplier(models.Model):
    STATUS_CHOICES = [('ACTIVE', 'Active'), ('INACTIVE', 'Inactive'), ('BLOCKED', 'Blocked')]
    supplier_code = models.CharField(max_length=50, unique=True)
    legal_name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    address = models.TextField()
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    tax_id = models.CharField(max_length=100)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='ACTIVE')
    categories = models.TextField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.legal_name

class SupplierContact(models.Model):
    supplier = models.ForeignKey(Supplier, related_name='contacts', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    position = models.CharField(max_length=100)
    is_primary = models.BooleanField(default=False)
