// Fichier: src/api/axiosConfig.js (CORRIGÉ)
import axios from 'axios';

const apiClient = axios.create({
  // --- CORRECTION ICI ---
  baseURL: 'http://localhost:8000/api/v2',
  // --- FIN DE LA CORRECTION ---
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default apiClient;