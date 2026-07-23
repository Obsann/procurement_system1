from apps.core.exceptions import InvalidTransitionError

class WorkflowEngine:
    def __init__(self, instance, state_field, transitions):
        self.instance = instance
        self.state_field = state_field
        self.transitions = transitions

    def transition(self, to_state, user=None):
        current_state = getattr(self.instance, self.state_field)
        allowed_transitions = self.transitions.get(current_state, [])
        
        if to_state not in allowed_transitions:
            raise InvalidTransitionError(f"Cannot transition from {current_state} to {to_state}")
        
        setattr(self.instance, self.state_field, to_state)
        self.instance.save(update_fields=[self.state_field])
