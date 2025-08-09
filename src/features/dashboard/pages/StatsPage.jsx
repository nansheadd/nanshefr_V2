// Fichier: src/features/dashboard/pages/StatsPage.jsx (NOUVEAU)
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box,Button, Container, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, LinearProgress, Stack, CircularProgress, Alert } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';

// API: Récupérer la liste des cours de l'utilisateur
const fetchUserCourses = async () => {
  const { data } = await apiClient.get('/courses/my-courses');
  return data;
};

// API: Récupérer les stats pour un cours spécifique
const fetchCourseStats = async (courseId) => {
  if (!courseId) return [];
  const { data } = await apiClient.get(`/users/me/performance/${courseId}`);
  return data;
};

// Composant pour afficher les stats d'un seul cours
const CourseStats = ({ course }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['courseStats', course.id],
    queryFn: () => fetchCourseStats(course.id),
  });

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 'bold' }}>{course.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {isLoading && <CircularProgress size={24} />}
        {stats && stats.length > 0 ? (
          <Stack spacing={2}>
            {stats.map((stat) => (
              <Box key={stat.topic_category}>
                <Typography variant="body2">{stat.topic_category}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={stat.mastery_score * 100}
                    sx={{ height: 10, borderRadius: 5, flexGrow: 1 }}
                    color={stat.mastery_score < 0.5 ? 'error' : stat.mastery_score < 0.8 ? 'warning' : 'success'}
                  />
                  <Typography variant="caption" color="text.secondary">{Math.round(stat.mastery_score * 100)}%</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Aucune statistique disponible. Commencez les exercices de ce cours pour voir votre progression !
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// Composant de la page principale des statistiques
const StatsPage = () => {
  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['courses', 'my-courses'],
    queryFn: fetchUserCourses,
  });

  return (
    <Container>
      <Paper sx={{ my: 4, p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mes Statistiques
        </Typography>
        <Typography color="text.secondary" paragraph>
          Suivez votre progression et identifiez vos points forts et les sujets à revoir pour chaque cours.
        </Typography>
        
        {isLoading && <CircularProgress />}
        {isError && <Alert severity="error">Impossible de charger vos cours.</Alert>}
        
        <Box sx={{ mt: 3 }}>
          {courses?.map(course => <CourseStats key={course.id} course={course} />)}
        </Box>

        <Button component={RouterLink} to="/dashboard" sx={{ mt: 3 }}>
            &larr; Retour au tableau de bord
        </Button>
      </Paper>
    </Container>
  );
};

export default StatsPage;