// Fichier: src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/authentication/pages/LoginPage';
import RegisterPage from './features/authentication/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import useAuthStore from './store/authStore';



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
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage /> {/* <--- ON UTILISE LA NOUVELLE PAGE */}
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}


export default App;