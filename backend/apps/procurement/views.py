from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import PurchaseRequisition
from .serializers import PurchaseRequisitionSerializer
from apps.core.workflow import WorkflowEngine

ORG_WIDE_ROLES = ['PROCUREMENT_OFFICER', 'ADMIN', 'SYSTEM_ADMINISTRATOR']

class PurchaseRequisitionViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRequisition.objects.select_related('requester', 'department', 'delivery_location').prefetch_related('lines', 'attachments').order_by('-created_at')
    serializer_class = PurchaseRequisitionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'department']
    search_fields = ['pr_number', 'title', 'description']
    ordering_fields = ['created_at', 'required_delivery_date', 'status']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.is_staff or user.roles.filter(name__in=ORG_WIDE_ROLES).exists():
            return queryset
        # BR-04 makes the budget holder the approver, so they have to see
        # requisitions somebody else raised, scoped to their own department.
        if user.department_id and user.roles.filter(name='BUDGET_HOLDER').exists():
            return queryset.filter(Q(department_id=user.department_id) | Q(requester=user))
        return queryset.filter(requester=user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        pr = self.get_object()
        next_status, _ = WorkflowEngine.transition_for_user('PR', pr, 'submit', request.user)
        pr.submitted_at = timezone.now()
        pr.save()
        return Response({'status': next_status, 'message': 'Purchase Requisition submitted successfully.'})
