from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.procurement.models import PurchaseRequisition
from apps.orders.models import PurchaseOrder
from apps.receiving.models import GoodsReceipt
from apps.notifications.models import Notification


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role_names = list(user.roles.values_list('name', flat=True))
        is_admin = user.is_staff or any(r in role_names for r in ('ADMIN', 'SYSTEM_ADMINISTRATOR'))

        # Base querysets
        pr_qs = PurchaseRequisition.objects.all()
        po_qs = PurchaseOrder.objects.all()

        if not is_admin:
            if user.department_id and 'BUDGET_HOLDER' in role_names:
                pr_qs = pr_qs.filter(department_id=user.department_id)
            elif 'PROCUREMENT_OFFICER' not in role_names:
                pr_qs = pr_qs.filter(requester=user)

        stats = {
            'total_requisitions': pr_qs.count(),
            'pending_approvals': pr_qs.filter(status='SUBMITTED').count(),
            'approved_requisitions': pr_qs.filter(status='APPROVED').count(),
            'total_purchase_orders': po_qs.count(),
            'po_pending_review': po_qs.filter(status='FINANCIAL_REVIEW').count(),
            'po_approved': po_qs.filter(status='PO_APPROVED').count(),
            'goods_received': po_qs.filter(status='GOODS_RECEIVED').count(),
            'total_goods_receipts': GoodsReceipt.objects.count(),
            'unread_notifications': Notification.objects.filter(recipient=user, is_read=False).count(),
        }

        # Recent activity (last 10 PRs)
        recent_prs = pr_qs.order_by('-created_at')[:5].values(
            'id', 'pr_number', 'title', 'status', 'created_at'
        )
        # Recent POs
        recent_pos = po_qs.order_by('-created_at')[:5].values(
            'id', 'po_number', 'status', 'total_amount', 'created_at'
        )

        stats['recent_requisitions'] = list(recent_prs)
        stats['recent_purchase_orders'] = list(recent_pos)

        return Response(stats)
