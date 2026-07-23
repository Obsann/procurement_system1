from django.contrib import admin
from .models import RFQ, RFQLine, RFQSupplier

admin.site.register(RFQ)
admin.site.register(RFQLine)
admin.site.register(RFQSupplier)
