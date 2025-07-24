// Fichier: src/features/authentication/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Étape 1 : Créer le nouvel utilisateur
      await apiClient.post('/users/', {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password
      });

      // Étape 2 : Connecter automatiquement l'utilisateur après l'inscription
      const loginFormData = new URLSearchParams();
      loginFormData.append('username', formData.username);
      loginFormData.append('password', formData.password);
      
      await apiClient.post('/users/login', loginFormData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      // Étape 3 : Mettre à jour l'état du frontend et rediriger
      await checkAuth(); // Met à jour l'état `isAuthenticated` et `user`
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue lors de l\'inscription.');
      console.error('Failed to register:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Inscription</Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            id="username" 
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
            id="email" 
            label="Adresse Email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
          />
          <TextField 
            margin="normal" 
            fullWidth 
            id="full_name" 
            label="Nom Complet (Optionnel)" 
            name="full_name" 
            value={formData.full_name} 
            onChange={handleChange} 
          />
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            name="password" 
            label="Mot de passe" 
            type="password" 
            id="password" 
            value={formData.password} 
            onChange={handleChange} 
          />
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "S'inscrire"}
          </Button>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" textAlign="center">
              Déjà un compte ? Connectez-vous
            </Typography>
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;