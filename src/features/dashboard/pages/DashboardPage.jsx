// Fichier: src/features/dashboard/pages/DashboardPage.jsx (CORRIGÉ)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../../store/authStore';
import apiClient from '../../../api/axiosConfig';
import CreateCourseForm from '../../courses/components/CreateCourseForm';
import { Box, Button, Container, Typography, CircularProgress, Alert } from '@mui/material';

// La fonction qui va chercher les données de l'utilisateur reste la même
const fetchCurrentUser = async (token) => {
  // On s'assure qu'on ne fait pas d'appel sans token
  if (!token) return null;

  const { data } = await apiClient.get('/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const DashboardPage = () => {
  // --- CORRECTION N°1 : On sélectionne chaque valeur du store séparément ---
  // Cela évite les re-renders inutiles.
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  // ----------------------------------------------------------------------

  // --- CORRECTION N°2 : On rend la clé de la requête dépendante du token ---
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['currentUser', token], // La clé inclut le token
    queryFn: () => fetchCurrentUser(token),
    enabled: !!token, // La requête ne se lance que si le token existe
  });
  // ----------------------------------------------------------------------

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Alert severity="error">Erreur lors du chargement des informations : {error.message}</Alert>;
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de Bord
        </Typography>
        {user ? ( // On vérifie que 'user' existe avant de l'afficher
          <Typography variant="h6">
            Bienvenue, {user.username} !
          </Typography>
        ) : (
          <Typography variant="h6">
            Chargement des informations utilisateur...
          </Typography>

          
        )}

        {/* --- AJOUT DU FORMULAIRE --- */}
            <CreateCourseForm />
        {/* --------------------------- */}
        <Button variant="contained" onClick={logout} sx={{ mt: 2 }}>
          Déconnexion
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardPage;