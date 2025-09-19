// src/features/authentication/pages/VerifyEmailPage.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, Button, CircularProgress, Alert
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { verifyEmail } from '../api/emailClient';

const logoSrc = '/logo192.png';

export default function VerifyEmailPage() {
  const [sp] = useSearchParams();
  const token = sp.get('token');
  const [state, setState] = React.useState({ loading: true, ok: false, error: '' });
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const background = isDark
    ? `radial-gradient(1200px 600px at 10% 10%, ${alpha(theme.palette.primary.main,0.13)}, transparent 60%),
       radial-gradient(1200px 600px at 90% 90%, ${alpha(theme.palette.secondary.main,0.13)}, transparent 60%),
       linear-gradient(135deg, ${theme.palette.background.default} 0%, #151833 100%)`
    : `linear-gradient(135deg, #ffffff 0%, #f0f0f5 100%)`;

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setState({ loading: false, ok: false, error: 'Lien invalide (token manquant).' });
        return;
      }
      try {
        await verifyEmail(token);
        if (mounted) setState({ loading: false, ok: true, error: '' });
      } catch (e) {
        if (mounted) setState({ loading: false, ok: false, error: e.message || 'Lien invalide ou expiré.' });
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, background }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 520, p: 4, borderRadius: 3 }}>
        <Stack spacing={3} alignItems="center">
          <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 72, height: 72, borderRadius: '50%' }} />
          {state.loading ? (
            <>
              <Typography variant="h6" fontWeight={700}>Vérification en cours…</Typography>
              <CircularProgress />
            </>
          ) : state.ok ? (
            <>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 52 }} />
              <Typography variant="h6" fontWeight={800}>E-mail vérifié 🎉</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Votre adresse e-mail est confirmée. Vous pouvez maintenant vous connecter.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button component={Link} to="/login" variant="contained">Se connecter</Button>
                <Button component={Link} to="/dashboard">Aller au dashboard</Button>
              </Stack>
            </>
          ) : (
            <>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 52 }} />
              <Typography variant="h6" fontWeight={800}>Échec de vérification</Typography>
              <Alert severity="error" sx={{ width: '100%' }}>{state.error}</Alert>
              <Button component={Link} to="/register" variant="contained" sx={{ mt: 1 }}>
                Créer un compte
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
