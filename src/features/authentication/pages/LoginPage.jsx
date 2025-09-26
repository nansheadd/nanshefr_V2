// Fichier: src/features/authentication/pages/LoginPage.jsx (FINAL)
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
  InputAdornment,
  IconButton,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const logoSrc = '/logo192.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, isLoading } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password, rememberMe });
    } catch (err) {
      setError(err.response?.data?.detail || "Nom d'utilisateur ou mot de passe incorrect.");
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background,
        display: 'grid',
        placeItems: 'center'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 'auto',
          p: 4,
          borderRadius: 3,
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box
            component="img"
            src={logoSrc}
            alt="Logo"
            sx={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.55)}`
            }}
          />
          <Box textAlign="center" sx={{ width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, letterSpacing: .3, color: theme.palette.text.primary }}>
              Connexion
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: .5 }}>
              Heureux de vous revoir ✨
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              required
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
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
              fullWidth
              required
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
              {isLoading ? <CircularProgress size={22} /> : 'Se connecter'}
            </Button>

            <FormControlLabel
              control={(
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="secondary"
                />
              )}
              label="Rester connecté"
              sx={{ mt: 1, color: theme.palette.text.secondary }}
            />

            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Pas de compte ?
              </Typography>
              <Link to="/register" style={{ textDecoration: 'none', marginLeft: 6 }}>
                <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                  Inscrivez-vous
                </Typography>
              </Link>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              
              <Link to="/forgot-password" style={{ textDecoration: 'none', marginLeft: 6 }}>
                <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                  pswword forgot
                </Typography>
              </Link>
            </Stack>

            <Divider sx={{ my: 3, borderColor: alpha(theme.palette.text.primary, 0.12) }} />

            <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6), display: 'block', textAlign: 'center' }}>
              Conseil : utilisez vos identifiants fournis par l’administrateur.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
