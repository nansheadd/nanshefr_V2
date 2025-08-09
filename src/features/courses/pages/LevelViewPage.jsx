// Fichier: src/features/courses/pages/LevelViewPage.jsx (FINAL CORRIGÉ)
import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Container, Typography, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText, Divider, Paper, Button, ListItemIcon } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const fetchLevelById = async (levelId) => {
  const { data } = await apiClient.get(`/levels/${levelId}`);
  return data;
};

const LevelViewPage = () => {
  const { levelId } = useParams();
  const { isAuthenticated } = useAuth();

  const { data: level, isLoading, isError, error } = useQuery({
    queryKey: ['level', levelId],
    queryFn: () => fetchLevelById(levelId),
    enabled: !!isAuthenticated,
  });

  // --- CORRECTION : SUPPRESSION DE LA SIMULATION ---
  // Nous n'avons plus besoin de données fictives.
  // La logique d'accessibilité est maintenant 100% gérée par le backend.
  // const userProgress = { ... }; // Ligne supprimée
  // ----------------------------------------------------

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Alert severity="error">{error.response?.data?.detail || "Impossible de charger les chapitres."}</Alert>;
  }

  return (
    <Container>
      <Paper sx={{ my: 4, p: 3 }}>
        <Button component={RouterLink} to={`/courses/${level?.course_id}`}>
          &larr; Retour au plan du cours
        </Button>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
          {level?.title}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" component="h2" gutterBottom>Chapitres</Typography>
        <List>
          {level?.chapters?.sort((a,b) => a.chapter_order - b.chapter_order).map((chapter) => {
            // --- CORRECTION CLÉ ---
            // On utilise directement la valeur `is_accessible` fournie par l'API.
            // Il n'y a plus de calcul ou de simulation ici.
            const isAccessible = chapter.is_accessible;
            
            return (
              <ListItem key={chapter.id} disablePadding>
                <ListItemButton 
                  component={RouterLink} 
                  to={`/chapters/${chapter.id}`}
                  disabled={!isAccessible}
                >
                  <ListItemIcon>
                    {isAccessible ? <LockOpenIcon color="success" /> : <LockIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Chapitre ${chapter.chapter_order + 1}: ${chapter.title}`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Container>
  );
};

export default LevelViewPage;