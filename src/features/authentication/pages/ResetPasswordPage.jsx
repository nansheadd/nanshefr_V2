// src/features/authentication/pages/ResetPasswordPage.jsx
import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from '../api/emailClient';

const logoSrc = '/logo192.png';

export default function ResetPasswordPage() {
  const [sp] = useSearchParams();
  const token = sp.get('token');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [state, setState] = useState({ loading: false, ok: false, error: '' });
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const background = isDark
    ? `radial-gradient(1200px 600px at 10% 10%, ${alpha(theme.palette.primary.main,0.13)}, transparent 60%),
       radial-gradient(1200px 600px at 90% 90%, ${alpha(theme.palette.secondary.main,0.13)}, transparent 60%),
       linear-gradient(135deg, ${theme.palette.background.default} 0%, #151833 100%)`
    : `linear-gradient(135deg, #ffffff 0%, #f0f0f5 100%)`;

  const canSubmit = useMemo(() => {
    return pw1.length >= 8 && pw1 === pw2 && !!token;
  }, [pw1, pw2, token]);

  const inputStyles = {
    '& .MuiInputBase-root': {
      borderRadius: 2,
      backgroundColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04),
      backdropFilter: 'blur(4px)'
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) { setState({ loading: false, ok: false, error: 'Lien invalide (token manquant).' }); return; }
    setState({ loading: true, ok: false, error: '' });
    try {
      await resetPassword(token, pw1);
      setState({ loading: false, ok: true, error: '' });
    } catch (e2) {
      setState({ loading: false, ok: false, error: e2.message || 'Lien invalide ou expiré.' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, background }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 480, p: 4, borderRadius: 3 }}>
        <Stack spacing={3} alignItems="center">
          <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 72, height: 72, borderRadius: '50%' }} />
          <Typography variant="h5" fontWeight={700}>Nouveau mot de passe</Typography>

          {state.ok ? (
            <>
              <Alert severity="success" sx={{ width: '100%' }}>
                Votre mot de passe a été mis à jour avec succès.
              </Alert>
              <Button component={Link} to="/login" variant="contained">Se connecter</Button>
            </>
          ) : (
            <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
              {!token && <Alert severity="error" sx={{ mb: 2 }}>Lien invalide (token manquant).</Alert>}

              <TextField
                fullWidth required label="Nouveau mot de passe"
                type={show ? 'text' : 'password'}
                value={pw1} onChange={(e) => setPw1(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><LockRoundedIcon /></InputAdornment>),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow(s => !s)} edge="end">
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText="Au moins 8 caractères."
                sx={inputStyles}
              />
              <TextField
                fullWidth required label="Confirmer le mot de passe"
                type={show ? 'text' : 'password'}
                value={pw2} onChange={(e) => setPw2(e.target.value)}
                sx={{ mt: 2, ...inputStyles }}
              />

              {state.error && <Alert severity="error" sx={{ mt: 2 }}>{state.error}</Alert>}

              <Button
                type="submit" fullWidth variant="contained" sx={{ mt: 2 }}
                disabled={state.loading || !canSubmit}
              >
                {state.loading ? <CircularProgress size={22} /> : 'Mettre à jour'}
              </Button>
              <Button component={Link} to="/login" sx={{ mt: 1 }}>Annuler</Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
