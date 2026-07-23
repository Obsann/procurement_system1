from rest_framework import serializers
from .models import User, Role, Permission, UserRole, RolePermission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = '__all__'

    def get_permissions(self, obj):
        perms = [rp.permission for rp in obj.permissions.all()]
        return PermissionSerializer(perms, many=True).data

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'is_active', 'is_staff', 'date_joined', 'department', 'roles']
        read_only_fields = ['id', 'date_joined']

    def get_roles(self, obj):
        roles = [ur.role for ur in obj.roles.all()]
        return RoleSerializer(roles, many=True).data

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
