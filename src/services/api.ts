
import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEV_HOST_IP = '10.81.59.79';
const API_PORT = '3001';

const getHostIp = () => {
  // Development
  if (__DEV__) {
    // Expo Go / Metro host
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];

      // Use the detected LAN IP if available
      if (
        ip &&
        ip !== 'localhost' &&
        ip !== '127.0.0.1'
      ) {
        return ip;
      }
    }

    // Your computer's LAN IP
    return DEV_HOST_IP;
  }

  // Production fallback
  return Platform.OS === 'android'
    ? '10.0.2.2'
    : 'localhost';
};

const hostIp = getHostIp();

const API_URL ='http://localhost:3001/api/v1';
  // process.env.EXPO_PUBLIC_API_URL ||
  // `http://${hostIp}:${API_PORT}/api/v1`;

console.log('API URL:', API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach access token before every request
api.interceptors.request.use(
  async (config) => {
    try {
      const { useAuthStore } = await import('../store/auth.store');

      const token = useAuthStore.getState().accessToken;

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Auth store may not be available yet
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically refresh token on 401
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite refresh loop
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { useAuthStore } = await import('../store/auth.store');

        const {
          refreshToken,
          setTokens,
          logout,
        } = useAuthStore.getState();

        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {
            refreshToken,
          }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
        } = refreshResponse.data;

        setTokens(accessToken, newRefreshToken);

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        try {
          const { useAuthStore } =
            await import('../store/auth.store');

          useAuthStore.getState().logout();
        } catch {
          // Ignore logout errors
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;