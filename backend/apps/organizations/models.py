from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Location(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='locations')
    name = models.CharField(max_length=255)
    address = models.TextField()

    def __str__(self):
        return self.name

class Department(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.organization.name})"
