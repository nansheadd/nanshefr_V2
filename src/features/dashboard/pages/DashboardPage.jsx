import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Button, Container, Typography } from '@mui/material';
import CreateCourseForm from '../../courses/components/CreateCourseForm';
import CourseList from '../../courses/components/CourseList';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>Tableau de Bord</Typography>
        {user && <Typography variant="h6">Bienvenue, {user.username} !</Typography>}
        <CreateCourseForm />
        <CourseList />
        <Button variant="contained" color="secondary" onClick={logout} sx={{ mt: 4 }}>
          Déconnexion
        </Button>
      </Box>
    </Container>
  );
};
export default DashboardPage;