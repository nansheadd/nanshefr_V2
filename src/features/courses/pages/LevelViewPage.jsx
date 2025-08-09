// Fichier: src/features/courses/pages/LevelViewPage.jsx (VERSION FINALE AVEC CADENAS)
import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Container, Typography, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText, Divider, Paper, Button, ListItemIcon } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock'; // Cadenas fermé
import LockOpenIcon from '@mui/icons-material/LockOpen'; // Cadenas ouvert

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

  // --- SIMULATION DE LA PROGRESSION DE L'UTILISATEUR ---
  // Plus tard, cette information viendra de l'API (ex: /users/me/progress/{courseId})
  const userProgress = {
      current_chapter_order: 1 // L'utilisateur a fini le chapitre 0 (order), il a donc accès au chapitre 1.
  };
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
            // On détermine si le chapitre est accessible
            const isAccessible = chapter.chapter_order <= userProgress.current_chapter_order;
            
            return (
              <ListItem key={chapter.id} disablePadding>
                <ListItemButton 
                  component={RouterLink} 
                  to={`/chapters/${chapter.id}`}
                  disabled={!isAccessible} // On désactive le bouton si non accessible
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