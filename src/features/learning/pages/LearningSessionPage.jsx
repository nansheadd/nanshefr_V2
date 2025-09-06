// Fichier: src/features/learning/pages/LearningSessionPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig'; // Assurez-vous que le chemin est correct

import { Box, Typography, CircularProgress, Alert, Breadcrumbs, Link as MuiLink } from '@mui/material';
import AtomViewer from '../components/AtomViewer'; // <-- NOUVEL IMPORT

const LearningSessionPage = () => {
  const { capsuleId, granuleOrder, moleculeOrder } = useParams();
  const navigate = useNavigate();

  const { data: atoms, isLoading, isError, error } = useQuery({
    queryKey: ['learningSession', capsuleId, granuleOrder, moleculeOrder],
    queryFn: async () => {
      // On fait un appel direct au backend pour récupérer les atomes
      const response = await apiClient.get(
        `/capsules/${capsuleId}/granule/${granuleOrder}/molecule/${moleculeOrder}`
      );
      return response.data;
    },
    // On désactive le refetch automatique pour ne pas régénérer la leçon sans raison
    refetchOnWindowFocus: false, 
    retry: 1,
  });

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Préparation de votre leçon...</Typography>
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Impossible de charger la session d'apprentissage : {error.message}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component="button" onClick={() => navigate('/capsules')} underline="hover">
          Capsules
        </MuiLink>
        <MuiLink component="button" onClick={() => navigate(-1)} underline="hover">
          Plan du cours
        </MuiLink>
        <Typography color="text.primary">Leçon en cours</Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Niveau {granuleOrder} - Leçon {moleculeOrder}
      </Typography>

      {/* On boucle sur chaque atome (contenu) à l'intérieur de la molécule */}
      {atoms?.map((atom) => (
        <AtomViewer key={atom.id} atom={atom} />
      ))}
    </Box>
  );
};

export default LearningSessionPage;