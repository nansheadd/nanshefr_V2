// Fichier: src/features/authentication/pages/LoginPage.jsx (FINAL)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
      // La redirection est maintenant gérée automatiquement par App.jsx
    } catch (err) {
      setError(err.response?.data?.detail || 'Nom d\'utilisateur ou mot de passe incorrect.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Connexion</Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Se Connecter'}
          </Button>
           <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" textAlign="center">Pas de compte ? Inscrivez-vous</Typography>
            </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;