import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuth } from './useAuth';
import api from '../lib/api';
import { baseApi } from '../store/api/baseApi';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { getAccessToken, getRefreshToken, getStoredUser } from '../lib/authStorage';
import { type User } from '../types';

const profile: User = {
  id: '1',
  email: 'buyer@example.com',
  first_name: 'Ada',
  last_name: 'Lovelace',
  roles: [{ id: 'r1', name: 'REQUESTER' }],
  is_active: true,
  date_joined: '2026-01-01T00:00:00Z',
};

function makeWrapper() {
  const store = configureStore({
    reducer: { auth: authReducer, ui: uiReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (gdm) => gdm().concat(baseApi.middleware),
  });
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
}

beforeEach(() => {
  localStorage.clear();
  api.defaults.adapter = (config: AxiosRequestConfig) => {
    const body = config.url?.includes('/auth/login/')
      ? { access: 'access-1', refresh: 'refresh-1' }
      : profile;
    return Promise.resolve({
      data: body, status: 200, statusText: 'OK', headers: {}, config,
    } as AxiosResponse);
  };
});

describe('useAuth', () => {
  it('persists both tokens under the keys the request interceptor reads', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.login({ email: profile.email, password: 'pw' });
    });

    expect(getAccessToken()).toBe('access-1');
    expect(getRefreshToken()).toBe('refresh-1');
    expect(getStoredUser()).toEqual(profile);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logout clears the persisted session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.login({ email: profile.email, password: 'pw' });
    });
    await act(async () => {
      await result.current.logout();
    });

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
