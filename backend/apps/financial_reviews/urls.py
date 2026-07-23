from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinancialReviewViewSet

router = DefaultRouter()
router.register(r'', FinancialReviewViewSet, basename='financial-review')

urlpatterns = [
    path('', include(router.urls)),
]