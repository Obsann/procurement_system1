from django.contrib import admin
from .models import PurchaseRequisition, PurchaseRequisitionLine, PurchaseRequisitionAttachment

admin.site.register(PurchaseRequisition)
admin.site.register(PurchaseRequisitionLine)
admin.site.register(PurchaseRequisitionAttachment)
