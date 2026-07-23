from django.contrib import admin
from .models import Bid, BidLine, BidAttachment

admin.site.register(Bid)
admin.site.register(BidLine)
admin.site.register(BidAttachment)
