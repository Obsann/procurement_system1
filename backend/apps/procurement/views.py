from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PurchaseRequisition
from .serializers import PurchaseRequisitionSerializer
from apps.core.workflow import WorkflowEngine

class PurchaseRequisitionViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRequisition.objects.all().order_by('-created_at')
    serializer_class = PurchaseRequisitionSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        user_role = request.user.roles.first().name if request.user.roles.exists() else 'REQUESTER'
        next_status = WorkflowEngine.transition('PR', pr, 'submit', user_role)
        pr.submitted_at = timezone.now()
        pr.save()
        return Response({'status': next_status, 'message': 'Purchase Requisition submitted successfully.'})
