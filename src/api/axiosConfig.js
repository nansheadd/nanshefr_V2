// Fichier: src/api/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v2', // L'URL de base de notre backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;