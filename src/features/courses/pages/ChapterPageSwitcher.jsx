// src/features/courses/pages/ChapterPageSwitcher.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Importez les deux pages de chapitre
import ChapterViewPage from './ChapterViewPage';
import LanguageChapterViewPage from './LanguageChapterViewPage';

const LoadingContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}08 100%)`,
  gap: theme.spacing(2),
}));

const ModernAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 16,
  background: `rgba(255, 255, 255, 0.9)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  '& .MuiAlert-message': {
    fontSize: '1.1rem',
    fontWeight: 500
  }
}));

// Fonction optimisée pour récupérer seulement le type de cours
const fetchChapterCourseType = async (chapterId) => {
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return {
    courseType: data.level?.course?.course_type,
    chapterData: data // On garde les données pour éviter un second appel
  };
};

const ChapterPageSwitcher = () => {
  const { chapterId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['chapterCourseType', chapterId],
    queryFn: () => fetchChapterCourseType(chapterId),
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
  });

  if (isLoading) {
    return (
      <LoadingContainer maxWidth={false}>
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ color: 'primary.main' }}
        />
        <Box sx={{ textAlign: 'center' }}>
          <Box component="div" sx={{ 
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'primary.main',
            mb: 0.5
          }}>
            Chargement du chapitre...
          </Box>
          <Box component="div" sx={{ 
            color: 'text.secondary',
            fontSize: '0.95rem'
          }}>
            Préparation de votre contenu d'apprentissage
          </Box>
        </Box>
      </LoadingContainer>
    );
  }

  if (isError) {
    return (
      <LoadingContainer maxWidth="md">
        <ModernAlert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          <Box component="div" sx={{ fontWeight: 600, mb: 1 }}>
            Erreur de chargement
          </Box>
          <Box component="div">
            Impossible de déterminer le type de cours pour ce chapitre. 
            Veuillez rafraîchir la page ou contacter le support.
          </Box>
        </ModernAlert>
      </LoadingContainer>
    );
  }

  const { courseType } = data;

  // Logique d'aiguillage basée sur le type de cours
  switch (courseType) {
    case 'langue':
      return <LanguageChapterViewPage />;
    case 'philosophie':
    case 'standard':
    default:
      return <ChapterViewPage />;
  }
};

export default ChapterPageSwitcher;