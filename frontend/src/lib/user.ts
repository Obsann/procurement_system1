import { type Role, type User } from '../types';

/** The API exposes names as separate fields; fall back to the email. */
export const displayName = (user?: User | null): string => {
  if (!user) return 'User';
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.email;
};

export const initials = (user?: User | null): string =>
  displayName(user).charAt(0).toUpperCase();

/** Users may hold several roles; the first is used for display purposes. */
export const primaryRole = (user?: User | null): Role | null =>
  user?.roles?.[0]?.name ?? null;

export const formatRole = (role?: Role | null): string =>
  role ? role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'Role';

export const hasRole = (user: User | null | undefined, ...roles: Role[]): boolean =>
  !!user?.roles?.some((assigned) => roles.includes(assigned.name));
