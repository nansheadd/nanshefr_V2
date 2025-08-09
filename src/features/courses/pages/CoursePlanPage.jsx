// Fichier: src/features/courses/pages/CoursePlanPage.jsx (VERSION FINALE AVEC ICÔNES)
import React, { useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Container, Typography, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText, Divider, Paper, ListItemIcon } from '@mui/material';
import StairsIcon from '@mui/icons-material/Stairs'; // Icône pour les niveaux
import CourseStats from '../components/CourseStats'; // Importez le composant


const fetchCourseById = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}`);
  return data;
};

const CoursePlanPage = () => {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!isAuthenticated,
  });

  // Polling pour la génération du cours
  useEffect(() => {
    const isGenerating = course?.generation_status === 'generating' || course?.generation_status === 'pending';
    if (isGenerating) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [course, queryClient, courseId]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Alert severity="error">Impossible de charger le plan du cours.</Alert>;
  }

  // Affichage pendant la génération
  if (course?.generation_status !== 'completed') {
    return (
      <Container>
        <Paper sx={{ my: 4, p: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>{course?.title}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" color="text.secondary" paragraph>{course?.description} TESTIO</Typography>
<CourseStats courseId={courseId} /> {/* <-- Ajoutez cette ligne */}
<Divider sx={{ my: 2 }} />
          <Box my={4}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>Génération du plan de cours en cours...</Typography>
            <Typography color="text.secondary">Statut: {course?.generation_status}</Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Affichage normal
  return (
    <Container>
      <Paper sx={{ my: 4, p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>{course?.title}</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>{course?.description}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" component="h2" gutterBottom>Niveaux du Cours</Typography>
        <List>
          {course?.levels?.sort((a, b) => a.level_order - b.level_order).map((level) => (
            <ListItem key={level.id} disablePadding>
              <ListItemButton component={RouterLink} to={`/levels/${level.id}`}>
                <ListItemIcon>
                  <StairsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Niveau ${level.level_order + 1}: ${level.title}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default CoursePlanPage;