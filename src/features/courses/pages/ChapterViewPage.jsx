// Fichier: src/features/courses/pages/ChapterViewPage.jsx (FINAL)
import React, { useEffect, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Container, Typography, CircularProgress, Alert, Divider, Paper, Button } from '@mui/material';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// --- Fonctions d'API ---
const fetchChapterById = async (chapterId) => {
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return data;
};

const fetchLevelById = async (levelId) => {
  if (!levelId) return null;
  const { data } = await apiClient.get(`/levels/${levelId}`);
  return data;
};

const triggerGeneration = (task) => (chapterId) => {
  return apiClient.post(`/chapters/${chapterId}/${task}`);
};

const triggerLessonGeneration = triggerGeneration('generate-lesson');
const triggerExercisesGeneration = triggerGeneration('generate-exercises');


const ChapterViewPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- Requêtes de Données ---
  const { data: chapter, isLoading, isError, error } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => fetchChapterById(chapterId),
    // Polling intégré pour les états de génération
    refetchInterval: (data) => 
      data?.lesson_status === 'generating' || data?.exercises_status === 'generating' ? 5000 : false,
  });

  const { data: level } = useQuery({
    queryKey: ['level', chapter?.level_id],
    queryFn: () => fetchLevelById(chapter?.level_id),
    enabled: !!chapter?.level_id,
  });

  // --- Mutations pour la Génération ---
  const createMutation = (mutationFn, successMessage) => {
    return useMutation({
      mutationFn,
      onSuccess: () => {
        // Invalide les données pour déclencher un re-fetch et mettre à jour l'UI
        queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      },
    });
  };

  const lessonMutation = createMutation(triggerLessonGeneration);
  const exercisesMutation = createMutation(triggerExercisesGeneration);
  
  // --- Logique de Progression ---
  const { isChapterComplete, nextChapterId } = useMemo(() => {
    if (!chapter?.knowledge_components || chapter.knowledge_components.length === 0) {
      // Un chapitre sans exercice est considéré comme "complet" pour ne pas bloquer
      return { isChapterComplete: true, nextChapterId: null }; 
    }

    const allCorrect = chapter.knowledge_components.every(comp => comp.user_answer?.is_correct === true);

    let nextId = null;
    if (level?.chapters) {
      const sortedChapters = [...level.chapters].sort((a, b) => a.chapter_order - b.chapter_order);
      const currentIndex = sortedChapters.findIndex(c => c.id === chapter.id);
      if (currentIndex !== -1 && currentIndex < sortedChapters.length - 1) {
        nextId = sortedChapters[currentIndex + 1].id;
      }
    }
    
    return { isChapterComplete: allCorrect, nextChapterId: nextId };
  }, [chapter, level]);


  // --- Rendu du Composant ---
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Alert severity="error">{error.response?.data?.detail || "Impossible de charger le chapitre."}</Alert>;
  }

  const renderContentSection = (status, content, mutation, buttonText, message) => {
    if (status === 'completed') return content;
    
    const isGenerating = status === 'generating';
    const hasFailed = status === 'failed';

    return (
      <Box textAlign="center" my={4}>
        {isGenerating && <CircularProgress sx={{ mb: 2 }} />}
        <Typography>
          {isGenerating ? "Génération en cours..." : (hasFailed ? "La génération a échoué." : message)}
        </Typography>
        <Button variant="contained" onClick={() => mutation.mutate(chapterId)} disabled={mutation.isLoading} sx={{ mt: 2 }}>
          {mutation.isLoading ? <CircularProgress size={24} /> : (hasFailed ? `Réessayer de ${buttonText}` : buttonText)}
        </Button>
      </Box>
    );
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Button component={RouterLink} to={`/levels/${chapter?.level_id}`}>
          &larr; Retour à la liste des chapitres
        </Button>
        <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {chapter?.title}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderContentSection(
              chapter.lesson_status,
              <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{chapter.lesson_text}</Typography>,
              lessonMutation,
              "Générer la leçon",
              "La leçon pour ce chapitre est prête à être créée par l'IA."
            )}
        </Paper>

        {chapter.lesson_status === 'completed' && (
          <>
            <Divider sx={{ my: 4 }}><Typography variant="h6">Exercices</Typography></Divider>
            {renderContentSection(
              chapter.exercises_status,
              chapter.knowledge_components.map((component) => (
                <KnowledgeComponentViewer 
                  key={component.id} 
                  component={component} 
                  submittedAnswer={component.user_answer}
                />
              )),
              exercisesMutation,
              "Générer les exercices",
              "Générez les exercices pour tester vos connaissances."
            )}
          </>
        )}

        {chapter.exercises_status === 'completed' && chapter.knowledge_components.length > 0 && (
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained" color="primary" size="large"
              endIcon={<NavigateNextIcon />}
              disabled={!isChapterComplete}
              onClick={() => navigate(nextChapterId ? `/chapters/${nextChapterId}` : `/levels/${chapter.level_id}`)}
            >
              {nextChapterId ? 'Chapitre Suivant' : 'Terminer le Niveau'}
            </Button>
            {!isChapterComplete && (
              <Typography variant="caption" display="block" mt={1}>
                Veuillez répondre correctement à tous les exercices pour continuer.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ChapterViewPage;