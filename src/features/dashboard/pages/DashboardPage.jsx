// src/features/dashboard/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Fade,
  Dialog
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardHeader from '../components/DashboardHeader';
import QuickActions from '../components/QuickActions';
import StatsCards from '../components/StatsCards';
import NavigationTabs from '../components/NavigationTabs';
import CreateCourseForm from '../../courses/components/CreateCourseForm';
import CourseList from '../../courses/components/CourseList';
import LibraryPage from '../../courses/pages/LibraryPage';

// Styled components
const GradientContainer = styled(Container)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}20`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  }
}));

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // états pour les modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openLibrary, setOpenLibrary] = useState(false);

  const renderTabContent = () => {
    switch(activeTab) {
      case 0: // Vue d'ensemble
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StatsCards />
              </Grid>
              <Grid item xs={12} lg={8}>
                <ModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Mes Cours Récents
                    </Typography>
                    <CourseList listType="my-courses" compact />
                  </CardContent>
                </ModernCard>
              </Grid>
              <Grid item xs={12} lg={4}>
                <QuickActions 
                  onCreateCourse={() => setOpenCreate(true)}
                  onOpenLibrary={() => setOpenLibrary(true)}
                />
              </Grid>
            </Grid>
          </Fade>
        );
      case 1: // Coach IA
        return (
          <Fade in={true} timeout={500}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  🤖 Coach IA
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Votre assistant personnel pour l'apprentissage
                </Typography>
                <Box sx={{ 
                  height: 400, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Interface Coach IA à intégrer
                  </Typography>
                </Box>
              </CardContent>
            </ModernCard>
          </Fade>
        );
      case 2: // Mes Cours
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      📚 Ma Bibliothèque
                    </Typography>
                    <CourseList listType="my-courses" />
                  </CardContent>
                </ModernCard>
              </Grid>
            </Grid>
          </Fade>
        );
      case 3: // Cours Publics
        return (
          <Fade in={true} timeout={500}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  🌍 Cours Publics
                </Typography>
                <CourseList listType="public" />
              </CardContent>
            </ModernCard>
          </Fade>
        );
      case 4: // Créer un Cours
        return (
          <Fade in={true} timeout={500}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  ✨ Créer un Nouveau Cours
                </Typography>
                <CreateCourseForm />
              </CardContent>
            </ModernCard>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <GradientContainer maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <DashboardHeader user={user} />
      </Box>
      
      <NavigationTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <Box sx={{ mt: 3 }}>
        {renderTabContent()}
      </Box>

      {/* Modal création de cours */}
      <Dialog 
        open={openCreate} 
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="md"
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            ✨ Créer un Nouveau Cours
          </Typography>
          <CreateCourseForm onClose={() => setOpenCreate(false)} />
        </Box>
      </Dialog>

      {/* Modal bibliothèque */}
      <Dialog 
        open={openLibrary} 
        onClose={() => setOpenLibrary(false)}
        fullWidth
        maxWidth="lg"
      >
        <LibraryPage onClose={() => setOpenLibrary(false)} />
      </Dialog>
    </GradientContainer>
  );
};

export default DashboardPage;
