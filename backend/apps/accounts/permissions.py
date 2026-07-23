from rest_framework.permissions import BasePermission

class HasRolePermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Custom logic for role-based permission can be added here
        return True
