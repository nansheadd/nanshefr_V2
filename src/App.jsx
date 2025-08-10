// Fichier: src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Container, Box, CircularProgress } from '@mui/material';
import Footer from './components/Footer';
import { useAuth } from './hooks/useAuth';

// --- Pages ---
import LoginPage from './features/authentication/pages/LoginPage';
import RegisterPage from './features/authentication/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import CoursePlanPage from './features/courses/pages/CoursePlanPage';
import LevelViewPage from './features/courses/pages/LevelViewPage';
import ChapterViewPage from './features/courses/pages/ChapterViewPage';
import StatsPage from './features/dashboard/pages/StatsPage';

// === Layouts ===
function AppShell() {
  // Shell pour les pages protégées de l'application
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Container component="main" sx={{ py: { xs: 2, md: 3 }, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
}

function AuthShell() {
  // Shell pour les pages publiques (login/register)
  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: (t) => t.vars?.palette?.background?.default || t.palette.background.default
      }}
    >
      {/* zone centrale qui centre Login/Register */}
      <Box sx={{ flexGrow: 1, display: 'grid', placeItems: 'center', px: 2 }}>
        <Outlet />
      </Box>

      {/* footer compact */}
      <Footer compact />
    </Box>
  );
}

// === Routes protégées ===
function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// === 404 ===
function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box
        component="img"
        src="/logo192.png"
        alt="logo"
        sx={{ width: 72, height: 72, mb: 2, borderRadius: '50%' }}
      />
      <h2>Page introuvable</h2>
      <p>Vérifie l’URL ou retourne à l’accueil.</p>
    </Box>
  );
}

// === App ===
export default function App() {
  return (
    <Routes>
      {/* Groupe PUBLIC */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthShell />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Groupe PRIVÉ */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses/:courseId" element={<CoursePlanPage />} />
          <Route path="/levels/:levelId" element={<LevelViewPage />} />
          <Route path="/chapters/:chapterId" element={<ChapterViewPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Route>

      {/* Divers */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
