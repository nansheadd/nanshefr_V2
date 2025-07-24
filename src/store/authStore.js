// Fichier: src/store/authStore.js (MODIFIÉ)
import { create } from 'zustand';
import apiClient from '../api/axiosConfig';

const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,

  // Fonction pour vérifier l'état d'authentification au démarrage
  checkAuth: async () => {
    try {
      const response = await apiClient.get('/users/me');
      set({ isAuthenticated: true, user: response.data });
    } catch (error) {
      set({ isAuthenticated: false, user: null });
    }
  },
  
  // La fonction de login met juste à jour l'état, elle ne stocke plus de token
  loginSuccess: (userData) => {
    set({ isAuthenticated: true, user: userData });
  },
  
  logout: async () => {
    try {
      await apiClient.post('/users/logout');
    } finally {
      set({ isAuthenticated: false, user: null });
    }
  },
}));

// Appelle checkAuth une fois au chargement de l'application
useAuthStore.getState().checkAuth();

export default useAuthStore;