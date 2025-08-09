// Fichier: src/App.jsx (REFONTE)
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

import LoginPage from './features/authentication/pages/LoginPage';
import RegisterPage from './features/authentication/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import CoursePlanPage from './features/courses/pages/CoursePlanPage';
import LevelViewPage from './features/courses/pages/LevelViewPage';
import ChapterViewPage from './features/courses/pages/ChapterViewPage';
import StatsPage from './features/dashboard/pages/StatsPage';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses/:courseId" element={<CoursePlanPage />} />
        <Route path="/levels/:levelId" element={<LevelViewPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/chapters/:chapterId" element={<ChapterViewPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;