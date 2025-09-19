// src/features/authentication/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, TextField, Button, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { forgotPassword } from '../api/emailClient';

const logoSrc = '/logo192.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ loading: false, done: false, error: '' });
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const background = isDark
    ? `radial-gradient(1200px 600px at 10% 10%, ${alpha(theme.palette.primary.main,0.13)}, transparent 60%),
       radial-gradient(1200px 600px at 90% 90%, ${alpha(theme.palette.secondary.main,0.13)}, transparent 60%),
       linear-gradient(135deg, ${theme.palette.background.default} 0%, #151833 100%)`
    : `linear-gradient(135deg, #ffffff 0%, #f0f0f5 100%)`;

  const inputStyles = {
    '& .MuiInputBase-root': {
      borderRadius: 2,
      backgroundColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.04),
      backdropFilter: 'blur(4px)'
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ loading: true, done: false, error: '' });
    try {
      await forgotPassword(email);
      setState({ loading: false, done: true, error: '' });
    } catch (e2) {
      // L’API renvoie 202 même si l’email n’existe pas, donc ici c’est rare
      setState({ loading: false, done: true, error: '' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, background }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 3 }}>
        <Stack spacing={3} alignItems="center">
          <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 72, height: 72, borderRadius: '50%' }} />
          <Typography variant="h5" fontWeight={700}>Mot de passe oublié</Typography>
          {state.done ? (
            <>
              <Alert severity="success" sx={{ width: '100%' }}>
                Si un compte existe pour <b>{email}</b>, un e-mail de réinitialisation a été envoyé.
              </Alert>
              <Button component={Link} to="/login" variant="contained">Retour à la connexion</Button>
            </>
          ) : (
            <Box component="form" onSubmit={onSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth required type="email" label="Adresse e-mail" value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon /></InputAdornment>) }}
                sx={inputStyles}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={state.loading}>
                {state.loading ? <CircularProgress size={22} /> : 'Envoyer le lien'}
              </Button>
              <Button component={Link} to="/login" sx={{ mt: 1 }}>Annuler</Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
