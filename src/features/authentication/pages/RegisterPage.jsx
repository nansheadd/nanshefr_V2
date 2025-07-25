// Fichier: src/features/authentication/pages/RegisterPage.jsx (FINAL)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

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
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Inscription</Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Nom d'utilisateur" name="username" value={formData.username} onChange={handleChange} autoFocus />
          <TextField margin="normal" required fullWidth label="Adresse Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <TextField margin="normal" required fullWidth label="Mot de passe" name="password" type="password" value={formData.password} onChange={handleChange} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "S'inscrire"}
          </Button>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" textAlign="center">Déjà un compte ? Connectez-vous</Typography>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};
export default RegisterPage;