from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PurchaseRequisition
from .serializers import PurchaseRequisitionSerializer
from apps.core.workflow import WorkflowEngine

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
        # Admin or procurement sees all, users see their own or department
        if user.is_staff or user.roles.filter(name__in=['PROCUREMENT_OFFICER', 'ADMIN']).exists():
            return queryset
        return queryset.filter(requester=user)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        pr = self.get_object()
        next_status, _ = WorkflowEngine.transition_for_user('PR', pr, 'submit', request.user)
        pr.submitted_at = timezone.now()
        pr.save()
        return Response({'status': next_status, 'message': 'Purchase Requisition submitted successfully.'})
