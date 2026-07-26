import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, makeStore } from '../../test/renderWithProviders';
import { RoleGuard } from './RoleGuard';
import { setCredentials } from '../../store/slices/authSlice';
import { type Role, type User } from '../../types';

const userWithRoles = (...roles: Role[]): User => ({
  id: 'u-1',
  email: 'user@example.com',
  first_name: 'Ada',
  last_name: 'Lovelace',
  roles: roles.map((name, i) => ({ id: `r${i}`, name })),
  is_active: true,
  date_joined: '2026-01-01T00:00:00Z',
});

const renderGuard = (allow: Role[], user: User | null) => {
  const store = makeStore();
  if (user) store.dispatch(setCredentials({ user, token: 'tok' }));

  return renderWithProviders(
    <Routes>
      <Route element={<RoleGuard allow={allow} />}>
        <Route path="/secret" element={<p>Financial totals</p>} />
      </Route>
      <Route path="/login" element={<p>Please sign in</p>} />
    </Routes>,
    { route: '/secret', store },
  );
};

beforeEach(() => localStorage.clear());

describe('RoleGuard', () => {
  it('renders the route when the user holds a permitted role', () => {
    renderGuard(['FINANCIAL_REVIEWER'], userWithRoles('FINANCIAL_REVIEWER'));
    expect(screen.getByText('Financial totals')).toBeInTheDocument();
  });

  it('matches on any one of several held roles', () => {
    renderGuard(['FINANCIAL_REVIEWER'], userWithRoles('REQUESTER', 'FINANCIAL_REVIEWER'));
    expect(screen.getByText('Financial totals')).toBeInTheDocument();
  });

  it('blocks the route when no role matches', () => {
    renderGuard(['FINANCIAL_REVIEWER'], userWithRoles('REQUESTER'));
    expect(screen.queryByText('Financial totals')).toBeNull();
    expect(screen.getByText(/do not have access/i)).toBeInTheDocument();
  });

  it('blocks a user who holds no roles at all', () => {
    renderGuard(['FINANCIAL_REVIEWER'], userWithRoles());
    expect(screen.queryByText('Financial totals')).toBeNull();
  });

  it('redirects to login when unauthenticated', () => {
    renderGuard(['FINANCIAL_REVIEWER'], null);
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
  });
});
