from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from apps.core.models import TimeStampedModel
from .managers import CustomUserManager

class Role(TimeStampedModel):
    ROLE_CHOICES = [
        ('REQUESTER', 'Requester'),
        ('BUDGET_HOLDER', 'Budget Holder'),
        ('PROCUREMENT_OFFICER', 'Procurement Officer'),
        ('FINANCIAL_REVIEWER', 'Financial Reviewer'),
        ('WAREHOUSE_OFFICER', 'Warehouse Officer'),
        ('ADMIN', 'Administrator'),
        ('SYSTEM_ADMINISTRATOR', 'System Administrator'),
    ]

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.get_name_display()

class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey('organizations.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    roles = models.ManyToManyField(Role, through='UserRole', related_name='users')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_full_name(self):
        # AbstractBaseUser does not supply this; serializers and the admin
        # expect it, and its absence silently renders blank names.
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class UserRole(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'role')
