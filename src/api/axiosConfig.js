// Fichier: src/api/axiosConfig.js (Version finale pour les cookies)
import axios from 'axios';
import { API_V2_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_V2_URL,
  // Cette ligne est la seule chose nécessaire pour que les cookies fonctionnent
  withCredentials: true,
});

// On a supprimé tout le bloc "apiClient.interceptors.request.use(...)"
// car le navigateur gère maintenant le token pour nous.

export default apiClient;
