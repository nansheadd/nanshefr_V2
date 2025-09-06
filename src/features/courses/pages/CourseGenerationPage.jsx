// src/features/courses/pages/CourseGenerationPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  Paper,
  Stack,
  Button,
  Card,
  CardContent,
  Fade,
  Grow,
  CircularProgress
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import apiClient from '../../../api/axiosConfig';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SchoolIcon from '@mui/icons-material/School';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const GenerationContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%)`
  }
}));

const MainCard = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.15)}`,
  padding: theme.spacing(6),
  maxWidth: 600,
  width: '90vw',
  textAlign: 'center',
  position: 'relative',
  zIndex: 1
}));

const IAIcon = styled(Box)(({ theme, isActive }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '2.5rem',
  margin: '0 auto 24px',
  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  animation: isActive ? `${float} 3s ease-in-out infinite, ${spin} 8s linear infinite` : `${float} 3s ease-in-out infinite`,
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.4)}, transparent)`,
    animation: `${shimmer} 2s infinite`,
  }
}));

const StepIndicator = styled(Box)(({ theme, active }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: 12,
  background: active 
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : alpha(theme.palette.grey[300], 0.7),
  color: active ? 'white' : theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 600,
  animation: active ? `${pulse} 2s infinite` : 'none',
  transition: 'all 0.3s ease-in-out'
}));

const CourseGenerationPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initialisation...');
  const [isComplete, setIsComplete] = useState(false);
  const [courseData, setCourseData] = useState(null);

  const steps = [
    { min: 0, max: 10, label: 'Initialisation' },
    { min: 10, max: 30, label: 'Génération du plan' },
    { min: 30, max: 60, label: 'Création des leçons' },
    { min: 60, max: 80, label: 'Génération des exercices' },
    { min: 80, max: 95, label: 'Finalisation' },
    { min: 95, max: 100, label: 'Terminé' }
  ];

  const getCurrentStepInfo = (currentProgress = progress) => {
    return steps.find(step => currentProgress >= step.min && currentProgress < step.max) || steps[steps.length - 1];
  };

  // Fonction pour récupérer les données du cours
  const fetchCourseData = async () => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      const data = response.data;
      setCourseData(data);

      // LOGIQUE CORRIGÉE : vérifier plusieurs critères de complétion
      const hasLevels = data.levels && data.levels.length > 0;
      const hasCharacterSets = data.character_sets && data.character_sets.length > 0;
      const generationComplete = data.generation_status === 'completed';
      
      // Le cours est considéré comme terminé si :
      const courseIsReady = generationComplete || hasLevels || hasCharacterSets;
      
      if (courseIsReady) {
        setProgress(100);
        setCurrentStep('Cours généré avec succès !');
        setIsComplete(true);
      } else {
        // Simuler le progrès si pas d'info précise du backend
        setProgress(prev => {
          const increment = Math.random() * 10;
          const newProgress = Math.min(prev + increment, 90);
          const currentStepInfo = getCurrentStepInfo(newProgress);
          setCurrentStep(currentStepInfo?.label || 'En cours...');
          return newProgress;
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du cours:', error);
      // En cas d'erreur, on continue le polling
    }
  };

  // Polling pour suivre le progrès avec intervalle adaptatif
  useEffect(() => {
    fetchCourseData();
    
    const interval = setInterval(() => {
      if (!isComplete) {
        fetchCourseData();
      }
    }, progress > 80 ? 2000 : 4000); // Polling plus fréquent quand proche de la fin

    return () => clearInterval(interval);
  }, [courseId, isComplete, progress]);

  // Redirection automatique vers le cours une fois terminé
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, courseId, navigate]);

  const handleLeavePage = () => {
    navigate('/dashboard');
  };

  const handleGoToCourse = () => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <GenerationContainer maxWidth={false}>
      <Fade in={true} timeout={800}>
        <MainCard elevation={12}>
          <IAIcon isActive={!isComplete}>
            {isComplete ? <CheckCircleIcon sx={{ fontSize: '3rem' }} /> : <SmartToyIcon sx={{ fontSize: '3rem' }} />}
          </IAIcon>

          <Typography variant="h3" sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, #1976d2, #42a5f5)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            {isComplete ? 'Cours Généré !' : 'Génération en Cours'}
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {courseData?.title || 'Votre cours de langue'}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {isComplete 
              ? 'Votre cours est maintenant prêt ! Vous allez être redirigé automatiquement.'
              : 'Notre IA travaille sur votre cours personnalisé. Cela peut prendre quelques minutes.'
            }
          </Typography>

          {!isComplete && (
            <ProgressContainer>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: alpha('#1976d2', 0.2),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                  }
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                {Math.round(progress)}% - {currentStep}
              </Typography>
            </ProgressContainer>
          )}

          {/* Étapes de progression */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3, mb: 4, flexWrap: 'wrap', gap: 1 }}>
            {steps.slice(0, -1).map((step, index) => (
              <Grow in={true} timeout={600 + index * 100} key={index}>
                <StepIndicator active={progress >= step.min}>
                  {step.label}
                </StepIndicator>
              </Grow>
            ))}
          </Stack>

          {/* Informations utiles */}
          <Card sx={{ 
            mt: 3, 
            backgroundColor: alpha('#1976d2', 0.05),
            border: `1px solid ${alpha('#1976d2', 0.2)}`
          }}>
            <CardContent sx={{ py: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {isComplete 
                    ? 'Redirection automatique dans 3 secondes...'
                    : 'Vous pouvez quitter cette page en toute sécurité. La génération continuera en arrière-plan.'
                  }
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="center">
            {isComplete ? (
              <Button
                variant="contained"
                onClick={handleGoToCourse}
                startIcon={<SchoolIcon />}
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                  }
                }}
              >
                Accéder au Cours
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={handleLeavePage}
                startIcon={<ExitToAppIcon />}
                sx={{
                  borderRadius: 3,
                  px: 3
                }}
              >
                Revenir au Dashboard
              </Button>
            )}
          </Stack>
        </MainCard>
      </Fade>

      {/* Animation de particules en arrière-plan */}
      {!isComplete && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                opacity: 0.3,
                animation: `${float} ${3 + i * 0.5}s ease-in-out infinite`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </Box>
      )}
    </GenerationContainer>
  );
};

export default CourseGenerationPage;