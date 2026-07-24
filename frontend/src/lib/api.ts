import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retried || !localStorage.getItem('refreshToken')) {
      return Promise.reject(error);
    }
    original._retried = true;
    refreshPromise ??= axios.post(`${api.defaults.baseURL}/auth/refresh/`, {
      refresh: localStorage.getItem('refreshToken'),
    }).then(({ data }) => {
      localStorage.setItem('token', data.access);
      return data.access as string;
    }).finally(() => { refreshPromise = null; });
    const token = await refreshPromise;
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);

export default api;
