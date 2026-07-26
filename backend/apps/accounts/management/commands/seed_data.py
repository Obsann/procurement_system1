from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import Role, User, UserRole
from apps.organizations.models import Organization, Department, Location
from apps.procurement.models import PurchaseRequisition, PurchaseRequisitionLine

DEMO_PASSWORD = 'demopassword123'

# One account per role so every stage of the workflow can be signed into.
DEMO_USERS = [
    ('requester@pmp.com', 'Ada', 'Lovelace', 'REQUESTER'),
    ('budget@pmp.com', 'Grace', 'Hopper', 'BUDGET_HOLDER'),
    ('procurement@pmp.com', 'Alan', 'Turing', 'PROCUREMENT_OFFICER'),
    ('finance@pmp.com', 'Katherine', 'Johnson', 'FINANCIAL_REVIEWER'),
    ('warehouse@pmp.com', 'Mary', 'Jackson', 'WAREHOUSE_OFFICER'),
]

# A draft to edit and two submitted requisitions so the approval queue is not
# empty on a fresh install.
DEMO_REQUISITIONS = [
    ('Standing desks', 'Six height-adjustable desks for the engineering floor', 'DRAFT',
     [('Standing desk', 'Electric, 160x80cm', 6, 700)]),
    ('Server rack', 'One 42U rack plus rails for the new switch stack', 'SUBMITTED',
     [('42U rack', 'Lockable, ventilated', 1, 2400), ('Rail kit', 'Universal', 4, 120)]),
    ('Laptop refresh', 'Replace machines that are out of warranty', 'SUBMITTED',
     [('Laptop', '16GB RAM, 512GB SSD', 10, 1450)]),
]


class Command(BaseCommand):
    help = 'Seeds roles, an admin, one user per role, an organization, and demo requisitions.'

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

        demo_users = {}
        for email, first, last, role_code in DEMO_USERS:
            user = User.objects.filter(email=email).first()
            if user is None:
                user = User.objects.create_user(
                    email=email, password=DEMO_PASSWORD,
                    first_name=first, last_name=last, department=dept,
                )
                UserRole.objects.get_or_create(user=user, role=roles[role_code])
                self.stdout.write(self.style.SUCCESS(f'Created {role_code}: {email} / {DEMO_PASSWORD}'))
            demo_users[role_code] = user

        requester = demo_users.get('REQUESTER')
        if requester:
            for title, description, status, lines in DEMO_REQUISITIONS:
                if PurchaseRequisition.objects.filter(title=title, requester=requester).exists():
                    continue
                pr = PurchaseRequisition.objects.create(
                    requester=requester,
                    department=dept,
                    delivery_location=loc,
                    title=title,
                    description=description,
                    status=status,
                    required_delivery_date=timezone.now().date() + timedelta(days=30),
                    submitted_at=timezone.now() if status == 'SUBMITTED' else None,
                )
                for item, line_description, quantity, price in lines:
                    PurchaseRequisitionLine.objects.create(
                        purchase_requisition=pr,
                        item_name=item,
                        description=line_description,
                        quantity=quantity,
                        estimated_unit_price=price,
                    )
                self.stdout.write(self.style.SUCCESS(f'Created requisition: {pr.pr_number} ({status})'))
