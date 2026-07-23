from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, DepartmentViewSet, LocationViewSet

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'locations', LocationViewSet, basename='location')

urlpatterns = router.urls
