from django.contrib import admin

from .models import PreReceive, GoodsReceipt, GoodsReceiptLine

admin.site.register(PreReceive)
admin.site.register(GoodsReceipt)
admin.site.register(GoodsReceiptLine)

