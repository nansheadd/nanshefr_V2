// Fichier: src/api/axiosConfig.js (Version finale pour les cookies)
import axios from 'axios';
import { API_V2_URL } from '../config/api';
import { clearStoredAccessToken, getStoredAccessToken } from '../utils/authTokens';

const maskToken = (token) => {
  if (typeof token !== 'string') {
    return null;
  }

  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= 8) {
    return `${trimmed[0] ?? ''}${'*'.repeat(Math.max(trimmed.length - 2, 0))}${
      trimmed.slice(-1) ?? ''
    } (len:${trimmed.length})`;
  }

  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}…${suffix} (len:${trimmed.length})`;
};

const apiClient = axios.create({
  baseURL: API_V2_URL,
  // Cette ligne est la seule chose nécessaire pour que les cookies fonctionnent
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const rawToken = getStoredAccessToken();
  const normalizedToken = typeof rawToken === 'string' ? rawToken.trim() : '';

  config.headers = config.headers ?? {};

  if (normalizedToken) {
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${normalizedToken}`;
      console.info('[API][request] Authorization header injected from storage.', {
        token: maskToken(normalizedToken),
      });
    } else {
      console.debug('[API][request] Authorization header already present.', {
        token: maskToken(normalizedToken),
      });
    }
  } else {
    console.warn('[API][request] No access token available when preparing request.');
  }

  if (typeof window !== 'undefined') {
    console.debug('[API][request]', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      cookies: typeof document !== 'undefined' ? document.cookie : undefined,
      headers: config.headers,
    });
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      console.debug('[API][response]', {
        url: response.config?.url,
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      console.error('[API][response][error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers,
      });
    }

    if (error.response?.status === 401) {
      clearStoredAccessToken();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
