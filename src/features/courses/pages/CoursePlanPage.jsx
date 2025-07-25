import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Container, Typography, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText, Divider, Paper } from '@mui/material';

const fetchCourseById = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}`);
  return data;
};

const CoursePlanPage = () => {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();

  const { data: course, isLoading, isError, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!isAuthenticated,
  });
  
  // ... (le reste du composant est identique)
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (isError) return <Alert severity="error">Erreur : {error.message}</Alert>;
  const learningPlan = course?.learning_plan_json;
  return (
    <Container>
      <Paper sx={{ my: 4, p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>{course?.title}</Typography>
        {learningPlan ? (
          <>
            <Typography variant="body1" color="text.secondary" paragraph>{learningPlan.overview}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>Votre Plan d'Apprentissage</Typography>
            <List>
              {learningPlan.levels?.map((level, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton component={RouterLink} to={`/courses/${course.id}/levels/${index}`}>
                    <ListItemText primary={`${index + 1}. ${level.level_title}`} secondary={`Catégorie : ${level.category}`} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : (<Typography sx={{ mt: 2 }}>Le plan d'apprentissage est en cours de préparation...</Typography>)}
      </Paper>
    </Container>
  );
};
export default CoursePlanPage;