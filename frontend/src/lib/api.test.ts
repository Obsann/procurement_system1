import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import api from './api';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from './authStorage';

type Handler = (config: AxiosRequestConfig) => Promise<AxiosResponse> | AxiosResponse;

function ok(config: AxiosRequestConfig, data: unknown): AxiosResponse {
  return { data, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse;
}

function httpError(config: AxiosRequestConfig, status: number) {
  const error = new Error(`Request failed with status ${status}`) as Error & {
    config: AxiosRequestConfig;
    response: unknown;
    isAxiosError: boolean;
  };
  error.config = config;
  error.response = { status, data: {}, statusText: '', headers: {}, config };
  error.isAxiosError = true;
  return error;
}

let handler: Handler;
const originalLocation = window.location;

beforeEach(() => {
  localStorage.clear();
  const adapter = (config: AxiosRequestConfig) => Promise.resolve(handler(config));
  api.defaults.adapter = adapter;
  axios.defaults.adapter = adapter;
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { pathname: '/dashboard', assign: vi.fn() },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
});

describe('api auth interceptors', () => {
  it('attaches the stored access token', async () => {
    setAccessToken('access-1');
    let seen: string | undefined;
    handler = (config) => {
      seen = config.headers?.Authorization as string;
      return ok(config, { ok: true });
    };
    await api.get('/requisitions/');
    expect(seen).toBe('Bearer access-1');
  });

  it('refreshes an expired token and replays the original request', async () => {
    setAccessToken('expired');
    setRefreshToken('refresh-1');
    let attempts = 0;
    handler = (config) => {
      if (config.url?.includes('/auth/refresh/')) {
        return ok(config, { access: 'access-2', refresh: 'refresh-2' });
      }
      attempts += 1;
      if (attempts === 1) throw httpError(config, 401);
      return ok(config, { replayed: true });
    };

    const response = await api.get('/requisitions/');

    expect(response.data).toEqual({ replayed: true });
    expect(attempts).toBe(2);
    expect(getAccessToken()).toBe('access-2');
    // The backend rotates refresh tokens; the stale one must not be kept.
    expect(getRefreshToken()).toBe('refresh-2');
  });

  it('clears the session and redirects when the refresh itself fails', async () => {
    setAccessToken('expired');
    setRefreshToken('stale');
    handler = (config) => {
      throw httpError(config, 401);
    };

    await expect(api.get('/requisitions/')).rejects.toThrow();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith('/login');
  });

  it('does not attempt a refresh when no refresh token is stored', async () => {
    setAccessToken('expired');
    let calls = 0;
    handler = (config) => {
      calls += 1;
      throw httpError(config, 401);
    };

    await expect(api.get('/requisitions/')).rejects.toThrow();
    expect(calls).toBe(1);
  });
});
