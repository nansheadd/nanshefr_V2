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
  Stack,
  InputAdornment
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

const logoSrc = '/logo192.png';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { registerAndLogin, isLoading } = useAuth();
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
      backgroundColor: isDark
        ? alpha(theme.palette.common.white, 0.05)
        : alpha(theme.palette.common.black, 0.04),
      backdropFilter: 'blur(4px)',
      transition: 'background-color .3s'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark
        ? alpha(theme.palette.common.white, 0.2)
        : alpha(theme.palette.common.black, 0.2)
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.main
    },
    '& label': {
      color: theme.palette.text.secondary,
      fontWeight: 600,
      fontSize: 14
    },
    '& label.Mui-focused': {
      color: theme.palette.secondary.main
    },
    '& input': {
      color: theme.palette.text.primary,
      fontWeight: 500,
      fontSize: 16
    }
  };

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
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background
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
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 72, height: 72, borderRadius: '50%', boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.55)}` }} />
          <Box textAlign="center" sx={{ width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Inscription
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: .5 }}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon />
                  </InputAdornment>
                )
              }}
              sx={inputStyles}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon />
                  </InputAdornment>
                )
              }}
              sx={inputStyles}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon />
                  </InputAdornment>
                )
              }}
              sx={inputStyles}
            />

            <Button
              type="submit"
              fullWidth
              variant="gradient"
              disabled={isLoading}
              sx={{ mt: 3, py: 1.3, borderRadius: 2 }}
            >
              {isLoading ? <CircularProgress size={22} /> : "S'inscrire"}
            </Button>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Déjà un compte ?
              </Typography>
              <Link to="/login" style={{ textDecoration: 'none', marginLeft: 6 }}>
                <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
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
