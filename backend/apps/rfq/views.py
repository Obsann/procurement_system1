from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RFQ
from .serializers import RFQSerializer
from apps.core.workflow import WorkflowEngine

class RFQViewSet(viewsets.ModelViewSet):
    queryset = RFQ.objects.all().order_by('-created_at')
    serializer_class = RFQSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        rfq = self.get_object()
        user_role = request.user.roles.first().name if request.user.roles.exists() else 'PROCUREMENT_OFFICER'
        next_status = WorkflowEngine.transition('RFQ', rfq, 'send', user_role)
        return Response({'status': next_status, 'message': 'RFQ marked as sent to suppliers.'})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        rfq = self.get_object()
        user_role = request.user.roles.first().name if request.user.roles.exists() else 'PROCUREMENT_OFFICER'
        next_status = WorkflowEngine.transition('RFQ', rfq, 'close', user_role)
        return Response({'status': next_status, 'message': 'RFQ closed successfully.'})
