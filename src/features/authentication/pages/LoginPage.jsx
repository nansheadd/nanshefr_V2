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
  Divider
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Palette inspirée du logo
const palette = {
  navy: '#0D0F1E',
  plum: '#6C3FA1',
  orchid: '#9E57C5',
  peach: '#F6B899',
  white: '#FFFFFF'
};

const logoSrc = '/logo192.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
    } catch (err) {
      setError(err.response?.data?.detail || "Nom d'utilisateur ou mot de passe incorrect.");
    }
  };

  return (
    <Box
    sx={{
      width: '100%',
      background: `radial-gradient(1200px 600px at 10% 10%, ${palette.orchid}22, transparent 60%),
                   radial-gradient(1200px 600px at 90% 90%, ${palette.peach}22, transparent 60%),
                   linear-gradient(135deg, ${palette.navy} 0%, #151833 100%)`
    }}
  >
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 420,
        mx: 'auto', // centre horizontal dans AuthShell
        p: 4,
        borderRadius: 3,
        backdropFilter: 'blur(8px)',
        background: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))`,
        border: `1px solid ${palette.orchid}33`,
        boxShadow: `0 20px 50px rgba(0,0,0,.35)`,
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
              boxShadow: `0 6px 18px ${palette.plum}55`
            }}
          />
          <Box textAlign="center" sx={{ width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700, letterSpacing: .3, color: palette.white }}>
              Connexion
            </Typography>
            <Typography variant="body2" sx={{ color: '#C9C9D5', mt: .5 }}>
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
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(4px)',
                  transition: 'background-color .3s'
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.peach },
                '& label': { color: '#C9C9D5' },
                '& label.Mui-focused': { color: palette.peach }
              }}
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
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(4px)',
                  transition: 'background-color .3s'
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.peach },
                '& label': { color: '#C9C9D5' },
                '& label.Mui-focused': { color: palette.peach }
              }}
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
                letterSpacing: .4,
                background: `linear-gradient(90deg, ${palette.plum}, ${palette.orchid})`,
                boxShadow: `0 10px 24px ${palette.plum}55, inset 0 0 0 1px ${palette.peach}44`,
                '&:hover': {
                  background: `linear-gradient(90deg, ${palette.orchid}, ${palette.plum})`,
                  boxShadow: `0 10px 30px ${palette.orchid}66`
                }
              }}
            >
              {isLoading ? <CircularProgress size={22} /> : 'Se connecter'}
            </Button>

            <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#C9C9D5' }}>
                Pas de compte ?
              </Typography>
              <Link to="/register" style={{ textDecoration: 'none', marginLeft: 6 }}>
                <Typography variant="body2" sx={{ color: palette.peach, fontWeight: 600 }}>
                  Inscrivez-vous
                </Typography>
              </Link>
            </Stack>

            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.12)' }} />

            <Typography variant="caption" sx={{ color: '#A8A8BA', display: 'block', textAlign: 'center' }}>
              Conseil : utilisez vos identifiants fournis par l’administrateur.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
