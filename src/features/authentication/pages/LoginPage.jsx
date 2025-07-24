// Fichier: src/features/authentication/pages/LoginPage.jsx (CORRIGÉ)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // --- CORRECTION ICI : On sélectionne précisément la fonction dont on a besoin ---
  const checkAuth = useAuthStore((state) => state.checkAuth);
  // --------------------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      // L'appel de login ne renvoie plus de token, il attache juste le cookie
      await apiClient.post('/users/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Maintenant on appelle checkAuth, qui va faire un /users/me pour mettre à jour l'état
      await checkAuth();
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Nom d\'utilisateur ou mot de passe incorrect.');
      console.error('Failed to login:', err);
    }
  };

  // Le JSX ne change pas
  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Connexion</Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="username" label="Nom d'utilisateur" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Mot de passe" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Se Connecter</Button>
           <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" textAlign="center">
                Pas de compte ? Inscrivez-vous
              </Typography>
            </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;