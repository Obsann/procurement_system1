from django.core.management.base import BaseCommand
from apps.accounts.models import Role, User, UserRole
from apps.organizations.models import Organization, Department, Location
from apps.suppliers.models import Supplier
from apps.procurement.models import PurchaseRequisition, PurchaseRequisitionLine
from apps.orders.models import PurchaseOrder, PurchaseOrderLine
from apps.receiving.models import GoodsReceipt, GoodsReceiptLine
from apps.notifications.models import Notification
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds the database with roles, a demo organization, users with Amharic names, and realistic sample data.'

    def handle(self, *args, **options):
        # 1. Roles
        self.stdout.write('Seeding roles...')
        roles = {}
        for name, _ in Role.ROLE_CHOICES:
            role, _ = Role.objects.get_or_create(name=name)
            roles[name] = role

        # 2. Org & Depts
        self.stdout.write('Seeding organization...')
        org, _ = Organization.objects.get_or_create(code='HQ', defaults={'name': 'Headquarters'})
        dept_it, _ = Department.objects.get_or_create(code='IT', defaults={'name': 'Information Technology', 'organization': org})
        dept_fin, _ = Department.objects.get_or_create(code='FIN', defaults={'name': 'Finance', 'organization': org})
        dept_ops, _ = Department.objects.get_or_create(code='OPS', defaults={'name': 'Operations', 'organization': org})
        loc, _ = Location.objects.get_or_create(code='AA', defaults={'name': 'Addis Ababa Office', 'organization': org, 'city': 'Addis Ababa', 'country': 'Ethiopia'})

        # 3. Users (Amharic Names)
        self.stdout.write('Seeding users (Amharic names)...')
        demo_users = [
            {'email': 'abebe@demo.com', 'first_name': 'Abebe', 'last_name': 'Kebede', 'role': 'REQUESTER', 'dept': dept_it},
            {'email': 'almaz@demo.com', 'first_name': 'Almaz', 'last_name': 'Tesfaye', 'role': 'BUDGET_HOLDER', 'dept': dept_it},
            {'email': 'chaltu@demo.com', 'first_name': 'Chaltu', 'last_name': 'Tadesse', 'role': 'PROCUREMENT_OFFICER', 'dept': dept_ops},
            {'email': 'dawit@demo.com', 'first_name': 'Dawit', 'last_name': 'Bekele', 'role': 'FINANCIAL_REVIEWER', 'dept': dept_fin},
            {'email': 'selamawit@demo.com', 'first_name': 'Selamawit', 'last_name': 'Alemu', 'role': 'WAREHOUSE_OFFICER', 'dept': dept_ops},
            {'email': 'yared@demo.com', 'first_name': 'Yared', 'last_name': 'Assefa', 'role': 'SYSTEM_ADMINISTRATOR', 'dept': dept_it},
        ]
        users = {}
        for u in demo_users:
            user, created = User.objects.get_or_create(
                email=u['email'],
                defaults={'first_name': u['first_name'], 'last_name': u['last_name'], 'department': u['dept']}
            )
            if created:
                user.set_password('demo1234')
                user.save()
            UserRole.objects.get_or_create(user=user, role=roles[u['role']])
            users[u['email']] = user

        # 4. Suppliers
        self.stdout.write('Seeding suppliers...')
        suppliers_data = [
            {'code': 'SUP-001', 'name': 'Ethio Telecom', 'contact': 'Tilahun G.', 'email': 'sales@ethiotelecom.et', 'cat': 'IT, Telecom'},
            {'code': 'SUP-002', 'name': 'BGI Ethiopia', 'contact': 'Ephrem M.', 'email': 'supply@bgi.et', 'cat': 'Food & Beverage'},
            {'code': 'SUP-003', 'name': 'East African Trading PLC', 'contact': 'Hirut A.', 'email': 'hirut@eatrading.com', 'cat': 'Office Supplies'},
        ]
        sups = []
        for s in suppliers_data:
            sup, _ = Supplier.objects.get_or_create(
                supplier_code=s['code'],
                defaults={
                    'legal_name': s['name'], 'contact_person': s['contact'],
                    'email': s['email'], 'phone': '+251 911 234567',
                    'city': 'Addis Ababa', 'country': 'Ethiopia',
                    'categories': s['cat'], 'status': 'ACTIVE'
                }
            )
            sups.append(sup)

        # 5. Purchase Requisitions
        self.stdout.write('Seeding purchase requisitions...')
        now = timezone.now()
        
        pr1, _ = PurchaseRequisition.objects.get_or_create(
            title='Laptops for new Dev Team',
            defaults={
                'requester': users['abebe@demo.com'], 'department': dept_it,
                'description': 'Need 5 new high-performance laptops.',
                'status': 'APPROVED', 'currency': 'ETB',
                'delivery_location': loc,
                'submitted_at': now - timedelta(days=5),
                'approved_at': now - timedelta(days=4)
            }
        )
        PurchaseRequisitionLine.objects.get_or_create(purchase_requisition=pr1, item_name='ThinkPad T14', defaults={'quantity': Decimal('5.0'), 'estimated_unit_price': Decimal('85000.0')})

        pr2, _ = PurchaseRequisition.objects.get_or_create(
            title='Office Stationery Q3',
            defaults={
                'requester': users['abebe@demo.com'], 'department': dept_it,
                'description': 'Pens, paper, staplers.',
                'status': 'SUBMITTED', 'currency': 'ETB',
                'delivery_location': loc,
                'submitted_at': now - timedelta(hours=2)
            }
        )
        PurchaseRequisitionLine.objects.get_or_create(purchase_requisition=pr2, item_name='A4 Copy Paper', defaults={'quantity': Decimal('20.0'), 'estimated_unit_price': Decimal('800.0')})

        # 6. Purchase Orders
        self.stdout.write('Seeding purchase orders...')
        po1, _ = PurchaseOrder.objects.get_or_create(
            purchase_requisition=pr1, supplier=sups[0],
            defaults={
                'created_by': users['chaltu@demo.com'],
                'status': 'PO_APPROVED', 'currency': 'ETB',
                'subtotal': Decimal('425000.0'), 'tax_amount': Decimal('63750.0'), 'total_amount': Decimal('488750.0'),
                'submitted_at': now - timedelta(days=3),
                'approved_at': now - timedelta(days=2)
            }
        )
        po_line, _ = PurchaseOrderLine.objects.get_or_create(
            purchase_order=po1, item_name='ThinkPad T14',
            defaults={'quantity': Decimal('5.0'), 'unit_price': Decimal('85000.0'), 'total_price': Decimal('425000.0')}
        )

        po2, _ = PurchaseOrder.objects.get_or_create(
            purchase_requisition=pr1, supplier=sups[2],
            defaults={
                'created_by': users['chaltu@demo.com'],
                'status': 'FINANCIAL_REVIEW', 'currency': 'ETB',
                'subtotal': Decimal('15000.0'), 'tax_amount': Decimal('2250.0'), 'total_amount': Decimal('17250.0'),
                'submitted_at': now - timedelta(hours=1),
            }
        )
        PurchaseOrderLine.objects.get_or_create(
            purchase_order=po2, item_name='Docking Stations',
            defaults={'quantity': Decimal('5.0'), 'unit_price': Decimal('3000.0'), 'total_price': Decimal('15000.0')}
        )

        # 7. Goods Receipt
        self.stdout.write('Seeding goods receipts...')
        gr, _ = GoodsReceipt.objects.get_or_create(
            purchase_order=po1,
            defaults={
                'received_by': users['selamawit@demo.com'],
                'status': 'PARTIAL', 'notes': 'Received 3 out of 5 laptops.',
                'received_date': timezone.now().date()
            }
        )
        GoodsReceiptLine.objects.get_or_create(
            goods_receipt=gr, po_line=po_line,
            defaults={'expected_quantity': Decimal('5.0'), 'received_quantity': Decimal('3.0')}
        )
        
        # Adjust PO status to Partially Received if it was approved and we just created a GR
        po1.status = 'PARTIALLY_RECEIVED'
        po1.save()

        # 8. Notifications
        self.stdout.write('Seeding notifications...')
        Notification.objects.get_or_create(
            recipient=users['abebe@demo.com'], title='PR Approved',
            defaults={'message': 'Your requisition "Laptops for new Dev Team" has been approved.', 'entity_type': 'requisition', 'entity_id': pr1.id}
        )
        Notification.objects.get_or_create(
            recipient=users['dawit@demo.com'], title='Financial Review Required',
            defaults={'message': 'A new PO is awaiting financial review.', 'entity_type': 'purchase_order', 'entity_id': po2.id, 'is_read': False}
        )

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
