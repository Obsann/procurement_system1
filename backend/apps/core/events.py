"""Central side effects for authorised workflow transitions."""
from apps.auditing.models import AuditLog
from apps.notifications.services import notify_role, notify_user


NEXT_ROLE = {
    ('PR', 'SUBMITTED'): 'BUDGET_HOLDER',
    ('PR', 'APPROVED'): 'PROCUREMENT_OFFICER',
    ('PO', 'FINANCIAL_REVIEW'): 'FINANCIAL_REVIEWER',
    ('PO', 'FINANCIAL_APPROVED'): 'PROCUREMENT_OFFICER',
    ('PO', 'FINAL_APPROVAL'): 'BUDGET_HOLDER',
    ('PO', 'PO_APPROVED'): 'WAREHOUSE_OFFICER',
}

# States that resolve someone's submission. Notifications otherwise only fan
# forward to whoever acts next, leaving the person who raised the record with
# no idea whether it was approved, sent back, or refused.
OUTCOME_STATES = {
    ('PR', 'APPROVED'),
    ('PR', 'RETURNED'),
    ('PR', 'REJECTED'),
    ('PO', 'PO_APPROVED'),
    ('PO', 'REJECTED'),
    ('PO', 'PO_CREATED'),  # returned by the financial reviewer
}


def _originator(entity):
    """Whoever raised the record: the requester of a PR, the author of a PO."""
    return getattr(entity, 'requester', None) or getattr(entity, 'created_by', None)


def _reference(entity):
    return (
        getattr(entity, 'pr_number', None)
        or getattr(entity, 'po_number', None)
        or str(entity.id)
    )


def _department_of(entity):
    department = getattr(entity, 'department', None)
    if department is None and hasattr(entity, 'purchase_requisition'):
        department = entity.purchase_requisition.department
    return department


def record_workflow_transition(*, entity_type, entity, previous_status, new_status, actor):
    AuditLog.objects.create(
        user=actor, action='WORKFLOW_TRANSITION', entity_type=entity_type,
        entity_id=entity.id, old_status=previous_status, new_status=new_status,
    )

    number = _reference(entity)
    summary = f'{entity_type} {number} moved from {previous_status} to {new_status}.'

    role = NEXT_ROLE.get((entity_type, new_status))
    if role:
        notify_role(
            role, f'{entity_type} {number} requires attention', summary,
            entity_type=entity_type, entity_id=entity.id,
            department=_department_of(entity), exclude_user=actor,
        )

    if (entity_type, new_status) in OUTCOME_STATES:
        originator = _originator(entity)
        # Someone who actioned their own record already knows the outcome.
        if originator is not None and originator != actor:
            notify_user(
                originator, f'{entity_type} {number} is now {new_status}', summary,
                entity_type=entity_type, entity_id=entity.id,
            )
