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
import Toolbox from './features/toolbox/components/Toolbox';
import LibraryPage from './features/capsules/pages/LibraryPage';
import NansheHomepage from './pages/NansheHomepage';
import CapsuleList from './features/capsules/components/CapsuleList'; // Mettez le bon chemin
import LearningSessionPage from './features/learning/pages/LearningSessionPage';
import LessonComponent from './features/learning/components/LessonComponent';
import CapsuleDetail from './features/capsules/components/CapsuleDetail';
import MoleculePage from './features/learning/pages/MoleculePage';
import ToolboxHubPage from './features/toolbox/pages/ToolboxHubPage';



import LegalNoticePage from './pages/legal/LegalNoticePage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import CookiesPolicyPage from './pages/legal/CookiesPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import ReportContentPage from './pages/legal/ReportContentPage';

import StatsPage from './features/dashboard/pages/StatsPage';
import CapsulePlanPage from './features/capsules/pages/CapsulePlanPage';
import BadgesPage from './features/badges/pages/BadgesPage';
import SubscriptionPage from './features/premium/pages/SubscriptionPage';
import PaymentSuccessPage from './features/premium/pages/PaymentSuccessPage';
import AchievementToast from './features/notifications/components/AchievementToast';

import VerifyEmailPage from './features/authentication/pages/VerifyEmailPage';
import ForgotPasswordPage from './features/authentication/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/authentication/pages/ResetPasswordPage';


// === Layouts ===
function AppShell() {
  // Shell pour les pages protégées de l'application
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Container component="main" sx={{ py: { xs: 2, md: 3 }, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <Footer />
      <Toolbox />
      {/* Toast global pour les badges débloqués */}
      <AchievementToast />
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

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
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
      {/* ==== Pages légales publiques (accès libre) ==== */}
      <Route path="/legal/notice" element={<LegalNoticePage />} />
      <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/legal/cookies" element={<CookiesPolicyPage />} />
      <Route path="/legal/terms" element={<TermsPage />} />
      <Route path="/legal/report" element={<ReportContentPage />} />

      <Route element={<AuthShell />}>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ==== Groupe PUBLIC (homepage + auth) ==== */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<NansheHomepage />} />
        <Route element={<AuthShell />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* ==== Groupe PRIVÉ ==== */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/library" element={<LibraryPage />} />

          <Route path="/capsules" element={<CapsuleList />} />
          <Route path="/capsule/:domain/:area/:capsuleId" element={<CapsuleDetail />} />
          <Route path="/capsule/:domain/:area/:capsuleId/plan" element={<CapsulePlanPage />} />

          <Route
            path="/capsule/:capsuleId/granule/:granuleOrder/molecule/:moleculeOrder"
            element={<LearningSessionPage />}
          />
          <Route
            path="/capsule/:capsuleId/level/:levelOrder/chapter/:chapterIndex"
            element={<LessonComponent />}
          />

          <Route path="/session/molecule/:moleculeId" element={<MoleculePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/premium" element={<SubscriptionPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/toolbox" element={<ToolboxHubPage />} />
        </Route>
      </Route>

      {/* ==== Divers ==== */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
