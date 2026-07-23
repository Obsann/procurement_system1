from django.core.management.base import BaseCommand
from apps.accounts.models import User, Role, Permission, UserRole, RolePermission
from apps.organizations.models import Organization, Department, Location

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **kwargs):
        # Create permissions
        perm_view, _ = Permission.objects.get_or_create(name='View All', description='Can view all')
        perm_edit, _ = Permission.objects.get_or_create(name='Edit All', description='Can edit all')

        # Create roles
        admin_role, _ = Role.objects.get_or_create(name='Admin', description='Administrator')
        RolePermission.objects.get_or_create(role=admin_role, permission=perm_view)
        RolePermission.objects.get_or_create(role=admin_role, permission=perm_edit)

        # Create organization
        org, _ = Organization.objects.get_or_create(name='Acme Corp', description='Acme Corporation')
        Location.objects.get_or_create(organization=org, name='HQ', address='123 Main St')
        dept, _ = Department.objects.get_or_create(organization=org, name='IT', description='Information Technology')

        # Create admin user
        if not User.objects.filter(email='admin@example.com').exists():
            admin_user = User.objects.create_superuser(
                email='admin@example.com',
                password='admin',
                first_name='Admin',
                last_name='User',
                department=dept
            )
            UserRole.objects.get_or_create(user=admin_user, role=admin_role)
            self.stdout.write(self.style.SUCCESS('Successfully created admin user.'))
        else:
            self.stdout.write('Admin user already exists.')

        self.stdout.write(self.style.SUCCESS('Successfully seeded database.'))
