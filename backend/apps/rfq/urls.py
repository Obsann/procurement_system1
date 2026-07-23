from rest_framework.routers import DefaultRouter
from .views import RFQViewSet

router = DefaultRouter()
router.register(r'', RFQViewSet, basename='rfq')

urlpatterns = router.urls
