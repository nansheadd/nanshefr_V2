// Fichier: src/features/courses/pages/LevelViewPage.jsx (FINAL)
import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Container, Typography, CircularProgress, Alert, Divider, Button } from '@mui/material';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer'; // NOUVEL IMPORT

const fetchLevelContent = async ({ courseId, levelOrder }) => {
  const { data } = await apiClient.get(`/courses/${courseId}/levels/${levelOrder}`);
  return data;
};

const LevelViewPage = () => {
  const { courseId, levelOrder } = useParams();
  const { isAuthenticated } = useAuth();

  const { data: level, isLoading, isError, error } = useQuery({
    queryKey: ['level', courseId, levelOrder],
    queryFn: () => fetchLevelContent({ courseId, levelOrder }),
    enabled: !!isAuthenticated,
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
        <Divider sx={{ mb: 3 }} />

        {/* ON UTILISE NOTRE NOUVEAU SYSTÈME ICI */}
        {level?.knowledge_components.map((component) => (
          <KnowledgeComponentViewer key={component.id} component={component} />
        ))}
      </Box>
    </Container>
  );
};

export default LevelViewPage;