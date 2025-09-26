// src/api/axiosConfig.js
import axios from 'axios';
import { API_V2_URL } from '../config/api';
import { getStoredAccessToken } from '../utils/authTokens';
import { getBrowserTimeZone, getTimezoneOffsetMinutes } from '../utils/timezone';

// Client axios unique pour l'API v2
const apiClient = axios.create({
  baseURL: API_V2_URL,
  withCredentials: true, // indispensable pour envoyer le cookie HttpOnly cross-site
});

// Interceptor: ajoute Authorization si un fallback token (localStorage) existe
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  const timezone = getBrowserTimeZone();
  const timezoneOffset = getTimezoneOffsetMinutes();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (timezone) {
    config.headers = config.headers || {};
    if (!config.headers['X-Timezone']) {
      config.headers['X-Timezone'] = timezone;
    }
  }

  if (typeof timezoneOffset === 'number') {
    config.headers = config.headers || {};
    if (!config.headers['X-Timezone-Offset']) {
      config.headers['X-Timezone-Offset'] = timezoneOffset;
    }
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
