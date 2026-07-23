from rest_framework.routers import DefaultRouter
from .views import FinancialReviewViewSet

router = DefaultRouter()
router.register(r'', FinancialReviewViewSet, basename='financial-review')

urlpatterns = router.urls
