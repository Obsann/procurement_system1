from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/users/', include('apps.accounts.user_urls')),
    path('api/organizations/', include('apps.organizations.urls')),
    path('api/requisitions/', include('apps.procurement.urls')),
    path('api/suppliers/', include('apps.suppliers.urls')),
    path('api/rfqs/', include('apps.rfq.urls')),
    path('api/bids/', include('apps.bids.urls')),
    path('api/purchase-orders/', include('apps.orders.urls')),
    path('api/approvals/', include('apps.approvals.urls')),
    path('api/financial-reviews/', include('apps.financial_reviews.urls')),
    path('api/goods-receipts/', include('apps.receiving.urls')),
    path('api/audit-logs/', include('apps.auditing.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
