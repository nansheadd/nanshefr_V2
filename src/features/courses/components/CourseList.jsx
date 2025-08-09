// Fichier: src/features/courses/components/CourseList.jsx (FORTEMENT MODIFIÉ)
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText, Divider, Stack, Button, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// On passe le type de liste en paramètre ('my-courses' ou 'public')
const fetchCourses = async (listType) => {
  const { data } = await apiClient.get(`/courses/${listType}`);
  return data;
};

const enroll = async (courseId) => {
  return apiClient.post(`/courses/${courseId}/enroll`);
};

const unenroll = async (courseId) => {
  return apiClient.post(`/courses/${courseId}/unenroll`);
};

const CourseList = ({ listType }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // La clé de la query dépend maintenant du type de liste
  const queryKey = ['courses', listType];
  const { data: courses, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchCourses(listType),
    enabled: isAuthenticated,
  });

  const mutation = useMutation({
    // La fonction de mutation dépend du type de liste
    mutationFn: listType === 'public' ? enroll : unenroll,
    onSuccess: () => {
      // On rafraîchit les DEUX listes pour que le cours passe de l'une à l'autre
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'public'] });
    },
  });

  // ... (le useEffect de polling reste utile)

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Impossible de charger la liste des cours.</Alert>;

  const listTitle = listType === 'my-courses' ? "Mes Cours" : "Cours Publics Disponibles";
  const emptyMessage = listType === 'my-courses' 
    ? "Vous n'êtes inscrit à aucun cours. Explorez les cours publics pour commencer !"
    : "Tous les cours publics sont dans votre liste 'Mes Cours'.";

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>{listTitle}</Typography>
      <Divider />
      {courses && courses.length > 0 ? (
        <List>
          {courses.map((course) => (
            <ListItem 
              key={course.id} 
              secondaryAction={
                <IconButton edge="end" onClick={() => mutation.mutate(course.id)} disabled={mutation.isPending}>
                  {listType === 'public' ? <AddCircleOutlineIcon color="primary" /> : <RemoveCircleOutlineIcon color="error" />}
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton component={RouterLink} to={`/courses/${course.id}`} disabled={course.generation_status !== 'completed'}>
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  <ListItemText 
                    primary={course.title} 
                    secondary={course.generation_status !== 'completed' ? `Statut: ${course.generation_status}...` : `Type: ${course.course_type}`} 
                  />
                  {(course.generation_status === 'generating' || course.generation_status === 'pending') && <CircularProgress size={20} />}
                </Stack>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography sx={{ mt: 2, fontStyle: 'italic' }}>{emptyMessage}</Typography>
      )}
    </Box>
  );
};
export default CourseList;