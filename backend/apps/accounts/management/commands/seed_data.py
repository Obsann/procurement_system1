from django.core.management.base import BaseCommand
from apps.accounts.models import Role, User, UserRole
from apps.organizations.models import Organization, Department, Location


class Command(BaseCommand):
    help = 'Seeds the database with roles, a demo organization, and demo users.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding roles...')
        roles = {}
        for name, _ in Role.ROLE_CHOICES:
            role, created = Role.objects.get_or_create(name=name)
            roles[name] = role
            if created:
                self.stdout.write(f'  Created role: {name}')
            else:
                self.stdout.write(f'  Role exists: {name}')

        self.stdout.write('Seeding organization...')
        org, _ = Organization.objects.get_or_create(
            code='HQ', defaults={'name': 'Headquarters'}
        )

        dept, _ = Department.objects.get_or_create(
            code='IT', defaults={'name': 'Information Technology', 'organization': org}
        )
        dept_fin, _ = Department.objects.get_or_create(
            code='FIN', defaults={'name': 'Finance', 'organization': org}
        )
        dept_ops, _ = Department.objects.get_or_create(
            code='OPS', defaults={'name': 'Operations', 'organization': org}
        )

        loc, _ = Location.objects.get_or_create(
            code='AA', defaults={'name': 'Addis Ababa Office', 'organization': org, 'city': 'Addis Ababa', 'country': 'Ethiopia'}
        )

        self.stdout.write('Seeding demo users...')
        demo_users = [
            {'email': 'requester@demo.com', 'first_name': 'Alice', 'last_name': 'Requester', 'role': 'REQUESTER', 'dept': dept},
            {'email': 'budget@demo.com', 'first_name': 'Bob', 'last_name': 'Budget', 'role': 'BUDGET_HOLDER', 'dept': dept},
            {'email': 'procurement@demo.com', 'first_name': 'Carol', 'last_name': 'Procurement', 'role': 'PROCUREMENT_OFFICER', 'dept': dept_ops},
            {'email': 'finance@demo.com', 'first_name': 'David', 'last_name': 'Finance', 'role': 'FINANCIAL_REVIEWER', 'dept': dept_fin},
            {'email': 'warehouse@demo.com', 'first_name': 'Eve', 'last_name': 'Warehouse', 'role': 'WAREHOUSE_OFFICER', 'dept': dept_ops},
            {'email': 'admin@demo.com', 'first_name': 'Admin', 'last_name': 'User', 'role': 'SYSTEM_ADMINISTRATOR', 'dept': dept},
        ]

        for u in demo_users:
            user, created = User.objects.get_or_create(
                email=u['email'],
                defaults={
                    'first_name': u['first_name'],
                    'last_name': u['last_name'],
                    'department': u['dept'],
                }
            )
            if created:
                user.set_password('demo1234')
                user.save()
                self.stdout.write(f'  Created user: {u["email"]}')
            else:
                self.stdout.write(f'  User exists: {u["email"]}')

            UserRole.objects.get_or_create(user=user, role=roles[u['role']])

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
