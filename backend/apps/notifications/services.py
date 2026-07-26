from apps.accounts.models import User
from .models import Notification


def notify_user(recipient, title, message, *, entity_type=None, entity_id=None):
    """Notify one specific person, typically whoever raised the record."""
    if recipient is None:
        return
    Notification.objects.create(
        recipient=recipient, title=title, message=message,
        entity_type=entity_type, entity_id=entity_id,
    )


def notify_role(role_name, title, message, *, entity_type=None, entity_id=None, department=None, exclude_user=None):
    """Create in-app notifications for active users holding a workflow role."""
    recipients = User.objects.filter(is_active=True, roles__name=role_name)
    if department is not None:
        recipients = recipients.filter(department=department)
    if exclude_user is not None:
        recipients = recipients.exclude(pk=exclude_user.pk)
    Notification.objects.bulk_create([
        Notification(
            recipient=recipient,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        for recipient in recipients.distinct()
    ])
