// Fichier: src/features/dashboard/pages/DashboardPage.jsx (CORRIGÉ)
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Button, Container, Typography, Stack } from '@mui/material'; // Ajout de Stack
import CreateCourseForm from '../../courses/components/CreateCourseForm';
import CourseList from '../../courses/components/CourseList';
import LogoutIcon from '@mui/icons-material/Logout'; // Import de l'icône

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>Tableau de Bord</Typography>
                {user && <Typography variant="h6">Bienvenue, {user.username} !</Typography>}
            </Box>
            <Button variant="contained" color="secondary" onClick={logout} startIcon={<LogoutIcon />}>
              Déconnexion
            </Button>
        </Stack>
        
        <CreateCourseForm />
        
        <CourseList listType="my-courses" />
        <CourseList listType="public" />
        
      </Box>
    </Container>
  );
};
export default DashboardPage;