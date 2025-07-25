// Fichier: src/features/courses/pages/LevelViewPage.jsx (FINAL)
import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth'; // On utilise notre hook central
import { Box, Container, Typography, CircularProgress, Alert, Paper, Divider, Button } from '@mui/material';

// La fonction de fetch n'a plus besoin du token
const fetchLevelContent = async ({ courseId, levelOrder }) => {
  const { data } = await apiClient.get(`/courses/${courseId}/levels/${levelOrder}`);
  return data;
};

const LevelViewPage = () => {
  const { courseId, levelOrder } = useParams();
  const { isAuthenticated } = useAuth(); // On récupère l'état d'authentification

  const { data: level, isLoading, isError, error } = useQuery({
    queryKey: ['level', courseId, levelOrder],
    queryFn: () => fetchLevelContent({ courseId, levelOrder }),
    enabled: !!isAuthenticated, // La requête ne se lance que si on est authentifié
  });

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Alert severity="error">Erreur lors du chargement du niveau : {error.message}</Alert>;
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Button component={RouterLink} to={`/courses/${courseId}`}>
          &larr; Retour au plan du cours
        </Button>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
          Niveau {parseInt(levelOrder) + 1}: {level?.title}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {level?.knowledge_components.map((component) => (
          <Paper key={component.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{component.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Catégorie: {component.category} | Type: {component.component_type}
            </Typography>
            <Divider sx={{ my: 1 }} />
            {/* On affiche simplement le JSON du contenu pour l'instant */}
            <pre>{JSON.stringify(component.content_json, null, 2)}</pre>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default LevelViewPage;