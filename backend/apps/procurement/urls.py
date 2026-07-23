from rest_framework.routers import DefaultRouter
from .views import PurchaseRequisitionViewSet

router = DefaultRouter()
router.register(r'', PurchaseRequisitionViewSet, basename='requisition')

urlpatterns = router.urls
