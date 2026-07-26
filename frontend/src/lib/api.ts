import axios from 'axios';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retried || !getRefreshToken()) {
      return Promise.reject(error);
    }
    original._retried = true;
    refreshPromise ??= axios
      .post(`${api.defaults.baseURL}/auth/refresh/`, { refresh: getRefreshToken() })
      .then(({ data }) => {
        setAccessToken(data.access);
        // The backend rotates refresh tokens, so the old one is now stale.
        if (data.refresh) setRefreshToken(data.refresh);
        return data.access as string;
      })
      .finally(() => {
        refreshPromise = null;
      });

    let token: string;
    try {
      token = await refreshPromise;
    } catch (refreshError) {
      // The session cannot be recovered; drop it rather than leaving the app
      // in a signed-in state that 401s on every request.
      clearSession();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
      return Promise.reject(refreshError);
    }

    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

export default api;
