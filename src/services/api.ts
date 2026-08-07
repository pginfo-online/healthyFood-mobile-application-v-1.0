import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token before each request
api.interceptors.request.use(async (config) => {
  try {
    const { useAuthStore } = await import('../store/auth.store');
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // No store available yet
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { useAuthStore } = await import('../store/auth.store');
        const { refreshToken, setTokens, logout } = useAuthStore.getState();
        if (!refreshToken) { logout(); return Promise.reject(error); }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        setTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        const { useAuthStore } = await import('../store/auth.store');
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
