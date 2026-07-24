"""
Tests for accounts module — covers User model, CustomUserManager,
Role model, serializers, permissions, and JWT auth endpoints.
Authored by: Obsan (primary) | Reviewed by: both
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.accounts.models import User, Role, UserRole
from apps.organizations.models import Organization, Department


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_org():
    org = Organization.objects.create(name='Test Org', code='ORG-TEST')
    dept = Department.objects.create(name='Finance', code='FIN-001', organization=org)
    return org, dept


def make_role(name='REQUESTER'):
    role, _ = Role.objects.get_or_create(name=name)
    return role


def make_user(email='user@test.com', password='Pass1234!', **kwargs):
    return User.objects.create_user(email=email, password=password,
                                    first_name='Test', last_name='User', **kwargs)


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------

class RoleModelTest(TestCase):
    def test_role_str(self):
        role = Role.objects.create(name='REQUESTER')
        self.assertEqual(str(role), 'Requester')

    def test_role_choices_are_valid(self):
        valid = [c[0] for c in Role.ROLE_CHOICES]
        self.assertIn('REQUESTER', valid)
        self.assertIn('ADMIN', valid)
        self.assertIn('FINANCIAL_REVIEWER', valid)
        self.assertIn('WAREHOUSE_OFFICER', valid)

    def test_role_unique(self):
        Role.objects.create(name='ADMIN')
        with self.assertRaises(Exception):
            Role.objects.create(name='ADMIN')


class CustomUserManagerTest(TestCase):
    def test_create_user_requires_email(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='pass')

    def test_create_user_normalises_email(self):
        user = make_user(email='USER@EXAMPLE.COM')
        self.assertEqual(user.email, 'user@example.com')

    def test_create_superuser_sets_flags(self):
        su = User.objects.create_superuser(
            email='admin@example.com', password='Admin1234!',
            first_name='Admin', last_name='Super'
        )
        self.assertTrue(su.is_staff)
        self.assertTrue(su.is_superuser)
        self.assertTrue(su.is_active)

    def test_create_superuser_raises_if_is_staff_false(self):
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='bad@example.com', password='Admin1234!',
                first_name='X', last_name='Y', is_staff=False
            )


class UserModelTest(TestCase):
    def test_user_str(self):
        user = make_user()
        self.assertIn('user@test.com', str(user))

    def test_user_uuid_pk(self):
        user = make_user(email='uuid@test.com')
        self.assertIsNotNone(user.pk)
        import uuid
        self.assertIsInstance(user.pk, uuid.UUID)

    def test_user_has_no_role_by_default(self):
        user = make_user(email='norole@test.com')
        self.assertEqual(user.roles.count(), 0)

    def test_user_role_assignment(self):
        user = make_user(email='role@test.com')
        role = make_role('BUDGET_HOLDER')
        UserRole.objects.create(user=user, role=role)
        self.assertEqual(user.roles.count(), 1)
        self.assertEqual(user.roles.first().name, 'BUDGET_HOLDER')

    def test_user_role_unique_together(self):
        user = make_user(email='uniquerole@test.com')
        role = make_role('REQUESTER')
        UserRole.objects.create(user=user, role=role)
        with self.assertRaises(Exception):
            UserRole.objects.create(user=user, role=role)

    def test_user_department_link(self):
        _, dept = make_org()
        user = make_user(email='dept@test.com', department=dept)
        self.assertEqual(user.department, dept)


# ---------------------------------------------------------------------------
# API / endpoint tests
# ---------------------------------------------------------------------------

class AuthEndpointTest(APITestCase):
    def setUp(self):
        self.user = make_user(email='login@test.com', password='TestPass99!')
        self.login_url = '/api/auth/login/'
        self.profile_url = '/api/auth/profile/'

    def test_login_returns_tokens(self):
        resp = self.client.post(self.login_url, {
            'email': 'login@test.com', 'password': 'TestPass99!'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_login_invalid_credentials(self):
        resp = self.client.post(self.login_url, {
            'email': 'login@test.com', 'password': 'WrongPass!'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_requires_auth(self):
        resp = self.client.get(self.profile_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_returns_user_data(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(self.profile_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], 'login@test.com')

    def test_profile_returns_roles(self):
        role = make_role('REQUESTER')
        UserRole.objects.create(user=self.user, role=role)
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(self.profile_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data['roles']), 1)
        self.assertEqual(resp.data['roles'][0]['name'], 'REQUESTER')


class UserViewSetTest(APITestCase):
    def setUp(self):
        self.admin = make_user(email='admin@test.com', password='Admin1234!', is_staff=True)
        self.user = make_user(email='regular@test.com', password='Pass1234!')
        self.list_url = '/api/users/'

    def test_list_users_requires_auth(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_list(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_includes_created_users(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get(self.list_url)
        emails = [u['email'] for u in resp.data['results']]
        self.assertIn('admin@test.com', emails)
        self.assertIn('regular@test.com', emails)
