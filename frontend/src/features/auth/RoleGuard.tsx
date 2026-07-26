import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { roleNames } from '../../lib/user';
import { EmptyState } from '../../components/ui';
import { type Role } from '../../types';

interface RoleGuardProps {
  allow: Role[];
}

/**
 * Client-side gating is a navigation aid only; the API remains the authority on
 * what a user may actually do.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ allow }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // The profile request may still be in flight after a reload.
  if (!user) return null;

  const permitted = roleNames(user).some((role) => allow.includes(role));
  if (!permitted) {
    return (
      <EmptyState
        icon={<ShieldOff className="h-8 w-8" />}
        title="You do not have access to this page"
        description="Your account does not hold a role that can view this section. Contact an administrator if you believe this is a mistake."
      />
    );
  }

  return <Outlet />;
};
