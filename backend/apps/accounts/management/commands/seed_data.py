from django.core.management.base import BaseCommand
from apps.accounts.models import Role, User, UserRole
from apps.organizations.models import Organization, Department, Location


class Command(BaseCommand):
    help = 'Seeds initial roles, admin user, default organization, department, and location.'

    def handle(self, *args, **kwargs):
        roles_data = [
            ('REQUESTER', 'Initiates procurement requests'),
            ('BUDGET_HOLDER', 'Approves procurement requisitions and final POs'),
            ('PROCUREMENT_OFFICER', 'Manages RFQs, supplier bids, and PO creation'),
            ('FINANCIAL_REVIEWER', 'Reviews POs for financial compliance'),
            ('WAREHOUSE_OFFICER', 'Records receipt of goods'),
            ('ADMIN', 'Full system administration'),
        ]

        roles = {}
        for code, desc in roles_data:
            role, created = Role.objects.get_or_create(name=code, defaults={'description': desc})
            roles[code] = role
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {code}'))

        org, _ = Organization.objects.get_or_create(
            code='HQ',
            defaults={'name': 'Main Organization'}
        )

        dept, _ = Department.objects.get_or_create(
            code='IT',
            defaults={'name': 'Information Technology', 'organization': org}
        )

        loc, _ = Location.objects.get_or_create(
            code='ADDIS-HQ',
            defaults={'name': 'Addis Ababa HQ', 'organization': org, 'city': 'Addis Ababa'}
        )

        admin_email = 'admin@pmp.com'
        if not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password='adminpassword123',
                first_name='System',
                last_name='Admin',
                department=dept
            )
            admin_role = roles['ADMIN']
            UserRole.objects.create(user=admin_user, role=admin_role)
            self.stdout.write(self.style.SUCCESS(f'Created superuser: {admin_email} / adminpassword123'))
        else:
            self.stdout.write('Admin user already exists.')
