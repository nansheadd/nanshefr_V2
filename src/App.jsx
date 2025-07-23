// Fichier: src/App.jsx (MIS À JOUR)
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom'; // Ajoute Link
import LoginPage from './features/authentication/pages/LoginPage';
import RegisterPage from './features/authentication/pages/RegisterPage'; // <--- AJOUTE CET IMPORT
import useAuthStore from './store/authStore';

// Page d'accueil simple pour les utilisateurs non connectés
const HomePage = () => (
  <div>
    <h1>Bienvenue sur Nanshe</h1>
    <Link to="/login">Se connecter</Link> | <Link to="/register">S'inscrire</Link>
  </div>
);

// Un composant simple pour le tableau de bord
const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  return (
    <div>
      <h1>Bienvenue sur votre Dashboard !</h1>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};

// Un composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};


function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* <--- AJOUTE CETTE LIGNE */}

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      {/* Si l'utilisateur est connecté, la page par défaut est le dashboard, sinon c'est la page de login */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;