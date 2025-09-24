// Fichier: src/api/axiosConfig.js (Version finale pour les cookies)
import axios from 'axios';
import { API_V2_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_V2_URL,
  // Cette ligne est la seule chose nécessaire pour que les cookies fonctionnent
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    console.debug('[API][request]', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      cookies: document.cookie,
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

    return Promise.reject(error);
  }
);

export default apiClient;
