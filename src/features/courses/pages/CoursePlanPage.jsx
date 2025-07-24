// Fichier: src/features/courses/pages/CoursePlanPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import { Box, Container, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';

// Fonction pour fetcher un cours spécifique par son ID
const fetchCourseById = async ({ courseId, token }) => {
  const { data } = await apiClient.get(`/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const CoursePlanPage = () => {
  const { courseId } = useParams(); // Récupère l'ID depuis l'URL (ex: /courses/1)
  const token = useAuthStore((state) => state.token);

  const { data: course, isLoading, isError, error } = useQuery({
    queryKey: ['course', courseId], // Clé unique pour cette requête
    queryFn: () => fetchCourseById({ courseId, token }),
    enabled: !!token, // La requête ne se lance que si l'utilisateur est connecté
  });

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Alert severity="error">Erreur : {error.message}</Alert>;
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {course?.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {course?.learning_plan_json?.overview}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" component="h2" gutterBottom>
          Votre Plan d'Apprentissage
        </Typography>
        <List>
          {course?.learning_plan_json?.levels?.map((level, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${index + 1}. ${level.level_title}`}
                secondary={`Catégorie : ${level.category}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default CoursePlanPage;