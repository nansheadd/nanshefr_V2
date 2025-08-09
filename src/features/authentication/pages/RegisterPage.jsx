// Fichier: src/features/authentication/pages/RegisterPage.jsx (FINAL)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Stack
} from '@mui/material';

const palette = {
  navy: '#0D0F1E',
  plum: '#6C3FA1',
  orchid: '#9E57C5',
  peach: '#F6B899',
  white: '#FFFFFF'
};

const logoSrc = '/logo192.png';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { registerAndLogin, isLoading } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerAndLogin(formData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: `radial-gradient(1200px 600px at 10% 10%, ${palette.orchid}22, transparent 60%),
                     radial-gradient(1200px 600px at 90% 90%, ${palette.peach}22, transparent 60%),
                     linear-gradient(135deg, ${palette.navy} 0%, #151833 100%)`
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          mx: 'auto',
          p: 4,
          borderRadius: 3,
          backdropFilter: 'blur(8px)',
          background: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))`,
          border: `1px solid ${palette.orchid}33`,
          boxShadow: `0 20px 50px rgba(0,0,0,.35)`
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 72, height: 72, borderRadius: '50%' }} />
          <Box textAlign="center" sx={{ width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: palette.white }}>
              Inscription
            </Typography>
            <Typography variant="body2" sx={{ color: '#C9C9D5', mt: .5 }}>
              Créez votre compte en quelques secondes
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nom d'utilisateur"
              name="username"
              value={formData.username}
              onChange={handleChange}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Adresse Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.3,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                background: `linear-gradient(90deg, ${palette.plum}, ${palette.orchid})`,
                boxShadow: `0 10px 24px ${palette.plum}55, inset 0 0 0 1px ${palette.peach}44`,
                '&:hover': {
                  background: `linear-gradient(90deg, ${palette.orchid}, ${palette.plum})`
                }
              }}
            >
              {isLoading ? <CircularProgress size={22} /> : "S'inscrire"}
            </Button>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#C9C9D5' }}>
                Déjà un compte ?
              </Typography>
              <Link to="/login" style={{ textDecoration: 'none', marginLeft: 6 }}>
                <Typography variant="body2" sx={{ color: palette.peach, fontWeight: 600 }}>
                  Connectez-vous
                </Typography>
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
