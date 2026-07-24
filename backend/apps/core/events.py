"""Central side effects for authorised workflow transitions."""
from apps.auditing.models import AuditLog
from apps.notifications.services import notify_role


NEXT_ROLE = {
    ('PR', 'SUBMITTED'): 'BUDGET_HOLDER',
    ('PR', 'APPROVED'): 'PROCUREMENT_OFFICER',
    ('PO', 'FINANCIAL_REVIEW'): 'FINANCIAL_REVIEWER',
    ('PO', 'FINANCIAL_APPROVED'): 'PROCUREMENT_OFFICER',
    ('PO', 'FINAL_APPROVAL'): 'BUDGET_HOLDER',
    ('PO', 'PO_APPROVED'): 'WAREHOUSE_OFFICER',
}


def record_workflow_transition(*, entity_type, entity, previous_status, new_status, actor):
    AuditLog.objects.create(
        user=actor, action='WORKFLOW_TRANSITION', entity_type=entity_type,
        entity_id=entity.id, old_status=previous_status, new_status=new_status,
    )
    role = NEXT_ROLE.get((entity_type, new_status))
    if role:
        number = getattr(entity, 'pr_number', None) or getattr(entity, 'po_number', None) or str(entity.id)
        department = getattr(entity, 'department', None)
        if department is None and hasattr(entity, 'purchase_requisition'):
            department = entity.purchase_requisition.department
        notify_role(
            role, f'{entity_type} {number} requires attention',
            f'{entity_type} {number} moved from {previous_status} to {new_status}.',
            entity_type=entity_type, entity_id=entity.id, department=department, exclude_user=actor,
        )
