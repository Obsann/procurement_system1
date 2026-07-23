from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, ProfileView

urlpatterns = [
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
