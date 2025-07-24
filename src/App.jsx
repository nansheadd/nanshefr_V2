// Fichier: src/App.jsx (Version finale et complète)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/authentication/pages/LoginPage';
import RegisterPage from './features/authentication/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import CoursePlanPage from './features/courses/pages/CoursePlanPage';
import useAuthStore from './store/authStore';

// Un composant simple pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Routes protégées */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CoursePlanPage />
          </ProtectedRoute>
        } 
      />

      {/* Route par défaut : redirige vers le dashboard si connecté, sinon vers le login */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;