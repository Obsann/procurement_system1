"""
Tests for suppliers module — covers Supplier model, SupplierContact,
status management (ACTIVE/INACTIVE/BLOCKED), serializers, and API endpoints.
Authored by: Mary (primary) | Reviewed by: both
"""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import User, Role, UserRole
from apps.suppliers.models import Supplier, SupplierContact


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_user_with_role(email, role_name):
    user = User.objects.create_user(
        email=email, password='Pass1234!',
        first_name='Test', last_name='User'
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    UserRole.objects.create(user=user, role=role)
    return user


def make_supplier(legal_name='Acme Corp', email='acme@supplier.com', status='ACTIVE'):
    return Supplier.objects.create(
        legal_name=legal_name,
        contact_person='John Doe',
        email=email,
        phone='+251900000001',
        status=status,
    )


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class SupplierModelTest(TestCase):
    def test_supplier_auto_generates_code(self):
        s = make_supplier()
        self.assertTrue(s.supplier_code.startswith('SUP-'))

    def test_supplier_str(self):
        s = make_supplier()
        self.assertIn('Acme Corp', str(s))
        self.assertIn(s.supplier_code, str(s))

    def test_supplier_default_status_is_active(self):
        s = make_supplier()
        self.assertEqual(s.status, 'ACTIVE')

    def test_supplier_uuid_pk(self):
        s = make_supplier()
        import uuid
        self.assertIsInstance(s.pk, uuid.UUID)

    def test_supplier_status_choices(self):
        valid_statuses = [c[0] for c in Supplier.STATUS_CHOICES]
        self.assertIn('ACTIVE', valid_statuses)
        self.assertIn('INACTIVE', valid_statuses)
        self.assertIn('BLOCKED', valid_statuses)

    def test_supplier_can_be_inactive(self):
        s = make_supplier(status='INACTIVE')
        self.assertEqual(s.status, 'INACTIVE')

    def test_supplier_can_be_blocked(self):
        s = make_supplier(status='BLOCKED')
        self.assertEqual(s.status, 'BLOCKED')

    def test_supplier_code_is_unique(self):
        s1 = make_supplier(legal_name='Supplier One', email='one@test.com')
        s2 = make_supplier(legal_name='Supplier Two', email='two@test.com')
        self.assertNotEqual(s1.supplier_code, s2.supplier_code)

    def test_supplier_country_defaults_to_ethiopia(self):
        s = make_supplier()
        self.assertEqual(s.country, 'Ethiopia')


class SupplierContactModelTest(TestCase):
    def setUp(self):
        self.supplier = make_supplier()

    def test_contact_str(self):
        contact = SupplierContact.objects.create(
            supplier=self.supplier,
            name='Jane Smith',
            email='jane@acme.com',
            is_primary=True
        )
        self.assertIn('Jane Smith', str(contact))
        self.assertIn('Acme Corp', str(contact))

    def test_contact_default_not_primary(self):
        contact = SupplierContact.objects.create(
            supplier=self.supplier,
            name='Bob Jones',
            email='bob@acme.com',
        )
        self.assertFalse(contact.is_primary)

    def test_multiple_contacts_per_supplier(self):
        SupplierContact.objects.create(
            supplier=self.supplier, name='Contact 1', email='c1@acme.com'
        )
        SupplierContact.objects.create(
            supplier=self.supplier, name='Contact 2', email='c2@acme.com'
        )
        self.assertEqual(self.supplier.contacts.count(), 2)

    def test_contact_cascade_delete_with_supplier(self):
        SupplierContact.objects.create(
            supplier=self.supplier, name='To Delete', email='td@acme.com'
        )
        supplier_id = self.supplier.pk
        self.supplier.delete()
        self.assertEqual(SupplierContact.objects.filter(supplier_id=supplier_id).count(), 0)


# ---------------------------------------------------------------------------
# API tests
# ---------------------------------------------------------------------------

class SupplierAPITest(APITestCase):
    def setUp(self):
        self.proc_officer = make_user_with_role('proc@test.com', 'PROCUREMENT_OFFICER')
        self.requester = make_user_with_role('req@test.com', 'REQUESTER')
        self.list_url = '/api/suppliers/'

    def test_unauthenticated_cannot_list(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_list_suppliers(self):
        make_supplier()
        self.client.force_authenticate(user=self.proc_officer)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_create_supplier(self):
        self.client.force_authenticate(user=self.proc_officer)
        data = {
            'legal_name': 'Beta Supplies',
            'contact_person': 'Alice',
            'email': 'beta@supplies.com',
            'phone': '+251911111111',
            'country': 'Ethiopia',
        }
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['legal_name'], 'Beta Supplies')
        self.assertTrue(resp.data['supplier_code'].startswith('SUP-'))

    def test_create_supplier_default_status_active(self):
        self.client.force_authenticate(user=self.proc_officer)
        data = {
            'legal_name': 'Gamma Trading',
            'contact_person': 'Bob',
            'email': 'gamma@trading.com',
            'phone': '+251922222222',
        }
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['status'], 'ACTIVE')

    def test_update_supplier_status(self):
        supplier = make_supplier(legal_name='Patchable Corp', email='patch@corp.com')
        self.client.force_authenticate(user=self.proc_officer)
        url = f'{self.list_url}{supplier.pk}/'
        resp = self.client.patch(url, {'status': 'BLOCKED'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'BLOCKED')

    def test_retrieve_single_supplier(self):
        supplier = make_supplier(legal_name='Retrivable LLC', email='retrive@llc.com')
        self.client.force_authenticate(user=self.proc_officer)
        url = f'{self.list_url}{supplier.pk}/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['legal_name'], 'Retrivable LLC')

    def test_delete_supplier(self):
        supplier = make_supplier(legal_name='Deletable Inc', email='delete@inc.com')
        self.client.force_authenticate(user=self.proc_officer)
        url = f'{self.list_url}{supplier.pk}/'
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Supplier.objects.filter(pk=supplier.pk).exists())
