import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';

const fetchCourses = async () => {
  const { data } = await apiClient.get('/courses/');
  return data;
};

const CourseList = () => {
  const { isAuthenticated } = useAuth();
  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    enabled: isAuthenticated,
  });

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Impossible de charger les cours.</Alert>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Mes Cours</Typography>
      <Divider />
      {courses && courses.length > 0 ? (
        <List>
          {courses.map((course) => (
            <ListItem key={course.id} disablePadding>
              <ListItemButton component={RouterLink} to={`/courses/${course.id}`}>
                <ListItemText primary={course.title} secondary={`Type: ${course.course_type}`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography sx={{ mt: 2 }}>Vous n'avez pas encore créé de cours.</Typography>
      )}
    </Box>
  );
};
export default CourseList;