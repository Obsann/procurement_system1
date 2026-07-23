from rest_framework import serializers
from .models import Approval


class ApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.SerializerMethodField()

    class Meta:
        model = Approval
        fields = [
            'id', 'entity_type', 'entity_id', 'approver', 'approver_name',
            'role', 'action', 'comment', 'previous_status', 'new_status', 'created_at'
        ]
        read_only_fields = ['id', 'approver', 'previous_status', 'new_status', 'created_at']

    def get_approver_name(self, obj):
        return f"{obj.approver.first_name} {obj.approver.last_name}"
