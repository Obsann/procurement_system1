import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from './authStorage';
import { type User } from '../types';

const user: User = {
  id: '1',
  email: 'buyer@example.com',
  first_name: 'Ada',
  last_name: 'Lovelace',
  roles: [{ id: 'r1', name: 'REQUESTER' }],
  is_active: true,
  date_joined: '2026-01-01T00:00:00Z',
};

describe('authStorage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips the access and refresh tokens', () => {
    setAccessToken('access-1');
    setRefreshToken('refresh-1');
    expect(getAccessToken()).toBe('access-1');
    expect(getRefreshToken()).toBe('refresh-1');
  });

  it('round-trips the stored user', () => {
    setStoredUser(user);
    expect(getStoredUser()).toEqual(user);
  });

  it('returns null and discards a corrupt stored user', () => {
    localStorage.setItem('user', 'not-json');
    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('clearSession removes every session key', () => {
    setAccessToken('access-1');
    setRefreshToken('refresh-1');
    setStoredUser(user);
    clearSession();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
