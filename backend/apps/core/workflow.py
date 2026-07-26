from .exceptions import InvalidTransitionError

class WorkflowEngine:
    PR_TRANSITIONS = {
        'DRAFT': {'submit': ('SUBMITTED', ['REQUESTER', 'ADMIN'])},
        'SUBMITTED': {
            'approve': ('APPROVED', ['BUDGET_HOLDER', 'ADMIN']),
            'return': ('RETURNED', ['BUDGET_HOLDER', 'ADMIN']),
            'reject': ('REJECTED', ['BUDGET_HOLDER', 'ADMIN'])
        },
        'RETURNED': {'submit': ('SUBMITTED', ['REQUESTER', 'ADMIN'])},
        'APPROVED': {'process': ('PROCUREMENT_PROCESSING', ['PROCUREMENT_OFFICER', 'ADMIN'])},
    }

    PO_TRANSITIONS = {
        'PO_CREATED': {'submit_for_review': ('FINANCIAL_REVIEW', ['PROCUREMENT_OFFICER', 'ADMIN'])},
        'FINANCIAL_REVIEW': {
            'approve_financial': ('FINANCIAL_APPROVED', ['FINANCIAL_REVIEWER', 'ADMIN']),
            'return': ('PO_CREATED', ['FINANCIAL_REVIEWER', 'ADMIN'])
        },
        'FINANCIAL_APPROVED': {'submit_final': ('FINAL_APPROVAL', ['PROCUREMENT_OFFICER', 'ADMIN'])},
        'FINAL_APPROVAL': {
            'approve': ('PO_APPROVED', ['BUDGET_HOLDER', 'ADMIN']),
            'return': ('PO_CREATED', ['BUDGET_HOLDER', 'ADMIN']),
            'reject': ('REJECTED', ['BUDGET_HOLDER', 'ADMIN'])
        },
        'PO_APPROVED': {
            'receive_partial': ('PARTIALLY_RECEIVED', ['WAREHOUSE_OFFICER', 'ADMIN']),
            'receive': ('GOODS_RECEIVED', ['WAREHOUSE_OFFICER', 'ADMIN']),
        },
        'PARTIALLY_RECEIVED': {
            'receive_partial': ('PARTIALLY_RECEIVED', ['WAREHOUSE_OFFICER', 'ADMIN']),
            'receive': ('GOODS_RECEIVED', ['WAREHOUSE_OFFICER', 'ADMIN']),
        },
    }

    RFQ_TRANSITIONS = {
        'DRAFT': {'send': ('SENT', ['PROCUREMENT_OFFICER', 'ADMIN'])},
        'SENT': {'respond': ('RESPONDED', ['PROCUREMENT_OFFICER', 'ADMIN'])},
        'RESPONDED': {'close': ('CLOSED', ['PROCUREMENT_OFFICER', 'ADMIN'])},
    }

    TRANSITION_MAP = {
        'PR': PR_TRANSITIONS,
        'PO': PO_TRANSITIONS,
        'RFQ': RFQ_TRANSITIONS,
    }

    @classmethod
    def can_transition(cls, entity_type, current_status, action, user_role):
        transitions = cls.TRANSITION_MAP.get(entity_type, {})
        status_actions = transitions.get(current_status, {})
        if action not in status_actions:
            return False, None
        
        next_status, allowed_roles = status_actions[action]
        if user_role not in allowed_roles:
            return False, None
            
        return True, next_status

    @classmethod
    def transition(cls, entity_type, entity, action, user_role):
        can, next_status = cls.can_transition(entity_type, entity.status, action, user_role)
        if not can:
            raise InvalidTransitionError(f"Cannot perform action '{action}' on {entity_type} in state '{entity.status}' with role '{user_role}'.")
        
        entity.status = next_status
        entity.save()
        return next_status

    @classmethod
    def transition_for_user(cls, entity_type, entity, action, user):
        """Use any assigned role that is authorised for this exact transition.

        Selecting the first role is unsafe because role ordering is undefined
        and can reject a user who legitimately holds the required role.
        """
        roles = list(user.roles.values_list('name', flat=True))
        if getattr(user, 'is_staff', False):
            roles.append('ADMIN')
        for role in roles:
            if cls.can_transition(entity_type, entity.status, action, role)[0]:
                previous_status = entity.status
                next_status = cls.transition(entity_type, entity, action, role)
                from .events import record_workflow_transition
                record_workflow_transition(
                    entity_type=entity_type, entity=entity, previous_status=previous_status,
                    new_status=next_status, actor=user,
                )
                return next_status, role
        raise InvalidTransitionError(
            f"User has no role authorised to perform '{action}' on {entity_type} in state '{entity.status}'."
        )
