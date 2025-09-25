// src/api/axiosConfig.js
import axios from 'axios';
import { API_V2_URL } from '../config/api';
import { getStoredAccessToken } from '../utils/authTokens';

// Client axios unique pour l'API v2
const apiClient = axios.create({
  baseURL: API_V2_URL,
  withCredentials: true, // indispensable pour envoyer le cookie HttpOnly cross-site
});

// Interceptor: ajoute Authorization si un fallback token (localStorage) existe
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de log d'erreurs (facultatif mais pratique)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[API][response][error]', {
        url: err?.config?.url,
        status: err?.response?.status,
        data: err?.response?.data,
        headers: err?.response?.headers,
      });
    }
    return Promise.reject(err);
  },
);

export default apiClient;
