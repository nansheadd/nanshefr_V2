// Fichier: src/api/axiosConfig.js (Version finale pour les cookies)
import axios from 'axios';
import { API_V2_URL } from '../config/api';
import { clearStoredAccessToken, getStoredAccessToken } from '../utils/authTokens';

const apiClient = axios.create({
  baseURL: API_V2_URL,
  // Cette ligne est la seule chose nécessaire pour que les cookies fonctionnent
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
