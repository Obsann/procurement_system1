import { type User } from '../types';

/**
 * Single source of truth for persisted session keys. These are read by the
 * axios interceptors, the auth slice and the login hook, which previously
 * each used their own spelling.
 */
const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAccessToken = (token: string) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const setRefreshToken = (token: string) =>
  localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const setStoredUser = (user: User) =>
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
