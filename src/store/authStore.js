// Fichier: src/store/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('authToken') || null,
  isAuthenticated: !!localStorage.getItem('authToken'),

  login: (token) => {
    localStorage.setItem('authToken', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;