from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Approval
from .serializers import ApprovalSerializer
from apps.core.workflow import WorkflowEngine
from apps.procurement.models import PurchaseRequisition
from apps.orders.models import PurchaseOrder


class ApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Approval.objects.all().order_by('-created_at')
    serializer_class = ApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Lets a record show only its own approval history.
    filterset_fields = ['entity_type', 'entity_id']

    @action(detail=False, methods=['post'], url_path='approve')
    def approve_entity(self, request):
        return self._handle_action(request, 'approve')

    @action(detail=False, methods=['post'], url_path='return-entity')
    def return_entity(self, request):
        return self._handle_action(request, 'return')

    @action(detail=False, methods=['post'], url_path='reject')
    def reject_entity(self, request):
        return self._handle_action(request, 'reject')

    def _handle_action(self, request, action_name):
        entity_type = request.data.get('entity_type')
        entity_id = request.data.get('entity_id')
        comment = request.data.get('comment', '')

        if not entity_type or not entity_id:
            return Response({'error': 'entity_type and entity_id are required.'}, status=400)

        # Get entity
        if entity_type == 'PR':
            try:
                entity = PurchaseRequisition.objects.get(id=entity_id)
            except PurchaseRequisition.DoesNotExist:
                return Response({'error': 'Purchase Requisition not found.'}, status=404)
            workflow_action = action_name
        elif entity_type == 'PO':
            try:
                entity = PurchaseOrder.objects.get(id=entity_id)
            except PurchaseOrder.DoesNotExist:
                return Response({'error': 'Purchase Order not found.'}, status=404)
            # Map generic actions to PO-specific workflow actions
            po_action_map = {
                'approve': 'approve_financial' if entity.status == 'FINANCIAL_REVIEW' else 'approve',
                'return': 'return',
                'reject': 'reject',
            }
            workflow_action = po_action_map.get(action_name, action_name)
        else:
            return Response({'error': 'Invalid entity_type. Use PR or PO.'}, status=400)

        previous_status = entity.status

        next_status, user_role = WorkflowEngine.transition_for_user(entity_type, entity, workflow_action, request.user)

        # Record approval
        approval = Approval.objects.create(
            entity_type=entity_type,
            entity_id=entity_id,
            approver=request.user,
            role=user_role,
            action=action_name.upper(),
            comment=comment,
            previous_status=previous_status,
            new_status=next_status,
        )

        # Update timestamps on entity
        if action_name == 'approve' and hasattr(entity, 'approved_at'):
            entity.approved_at = timezone.now()
            entity.save()

        return Response({
            'message': f'{entity_type} {action_name}d successfully.',
            'approval_id': str(approval.id),
            'previous_status': previous_status,
            'new_status': next_status,
        })
