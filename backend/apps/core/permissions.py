from rest_framework import permissions

class RolePermission(permissions.BasePermission):
    """
    Base class for role-based permissions.
    Subclasses must define `allowed_roles`.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if hasattr(request.user, 'roles') and request.user.roles.filter(name='SYSTEM_ADMINISTRATOR').exists():
            return True

        if not self.allowed_roles:
            return False
            
        return request.user.roles.filter(name__in=self.allowed_roles).exists()

class IsBudgetHolder(RolePermission):
    allowed_roles = ['BUDGET_HOLDER']

class IsProcurementOfficer(RolePermission):
    allowed_roles = ['PROCUREMENT_OFFICER']

class IsFinancialReviewer(RolePermission):
    allowed_roles = ['FINANCIAL_REVIEWER']

class IsWarehouseOfficer(RolePermission):
    allowed_roles = ['WAREHOUSE_OFFICER']

class IsRequester(RolePermission):
    allowed_roles = ['REQUESTER']