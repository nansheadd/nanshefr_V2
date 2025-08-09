// Fichier: src/features/courses/pages/ChapterViewPage.jsx (VERSION FINALE AVEC PROGRESSION)
import React, { useEffect, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Container, Typography, CircularProgress, Alert, Divider, Paper, Button } from '@mui/material';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// --- Fonctions d'API ---
const fetchChapterById = async (chapterId) => {
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return data;
};

// Nouvelle fonction pour récupérer les détails d'un niveau afin de trouver le chapitre suivant
const fetchLevelById = async (levelId) => {
  if (!levelId) return null; // Ne rien faire si on n'a pas encore l'ID du niveau
  const { data } = await apiClient.get(`/levels/${levelId}`);
  return data;
};

const triggerLessonGeneration = async (chapterId) => {
  const { data } = await apiClient.post(`/chapters/${chapterId}/generate-lesson`);
  return data;
};

const triggerExercisesGeneration = async (chapterId) => {
  const { data } = await apiClient.post(`/chapters/${chapterId}/generate-exercises`);
  return data;
};


const ChapterViewPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Requête pour obtenir les données du chapitre actuel
  const { data: chapter, isLoading, isError, error } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => fetchChapterById(chapterId),
    enabled: !!isAuthenticated,
  });

  // Requête pour obtenir les données du niveau parent (pour la navigation)
  const { data: level } = useQuery({
    queryKey: ['level', chapter?.level_id],
    queryFn: () => fetchLevelById(chapter?.level_id),
    enabled: !!chapter?.level_id, // Ne se lance que si on a l'ID du niveau
  });

  // Mutations pour lancer les tâches de fond de génération
  const lessonMutation = useMutation({
      mutationFn: triggerLessonGeneration,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] })
  });

  const exercisesMutation = useMutation({
      mutationFn: triggerExercisesGeneration,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] })
  });
  
  // Polling : rafraîchissement automatique si une génération est en cours
  useEffect(() => {
    if (chapter?.lesson_status === 'generating' || chapter?.exercises_status === 'generating') {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      }, 5000); // Toutes les 5 secondes
      return () => clearInterval(interval);
    }
  }, [chapter, queryClient, chapterId]);

  // --- LOGIQUE DE PROGRESSION ---
  // On utilise useMemo pour ne recalculer ces valeurs que lorsque les données du chapitre ou du niveau changent
  const { isChapterComplete, nextChapterId } = useMemo(() => {
    if (!chapter?.knowledge_components || chapter.knowledge_components.length === 0) {
      // Un chapitre sans exercice est considéré comme "complet" par défaut
      // pour ne pas bloquer l'utilisateur.
      return { isChapterComplete: true, nextChapterId: null }; 
    }

    // 1. On vérifie si tous les exercices ont une réponse et si cette réponse est correcte
    const allCorrect = chapter.knowledge_components.every(
      (comp) => comp.user_answer?.is_correct === true
    );

    // 2. On cherche l'ID du chapitre suivant dans la liste des chapitres du niveau
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


  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Alert severity="error">{error.response?.data?.detail || "Impossible de charger le chapitre."}</Alert>;
  }

  // Fonction pour afficher le contenu de la leçon (avec gestion des états)
  const renderContent = () => {
    if (chapter.lesson_status === 'completed') {
      return (
        <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {chapter.lesson_text}
        </Typography>
      );
    }
    let buttonText = "Générer la leçon";
    let message = "La leçon pour ce chapitre est prête à être créée par l'IA.";
    if (chapter.lesson_status === 'generating') {
      buttonText = "Relancer la génération";
      message = "La génération semble en cours... Cliquez pour forcer une nouvelle tentative si elle est bloquée.";
    } else if (chapter.lesson_status === 'failed') {
      buttonText = "Réessayer de générer la leçon";
      message = "La génération précédente a échoué. Veuillez réessayer.";
    }
    return (
      <Box textAlign="center" my={4}>
        {chapter.lesson_status === 'generating' && <CircularProgress sx={{mb: 2}}/>}
        <Typography>{message}</Typography>
        <Button variant="contained" onClick={() => lessonMutation.mutate(chapterId)} disabled={lessonMutation.isPending} sx={{mt: 2}}>
          {lessonMutation.isPending ? <CircularProgress size={24} /> : buttonText}
        </Button>
      </Box>
    );
  };

  // Fonction pour afficher les exercices (avec gestion des états)
  const renderExercises = () => {
    if (chapter.lesson_status !== 'completed') return null;
    if (chapter.exercises_status === 'completed' && chapter.knowledge_components.length > 0) {
      return chapter.knowledge_components.map((component) => (
        <KnowledgeComponentViewer 
          key={component.id} 
          component={component} 
          submittedAnswer={component.user_answer}
        />
      ));
    }
    let buttonText = "Générer les exercices";
    let message = "Maintenant que vous avez la leçon, générez les exercices pour tester vos connaissances.";
    if (chapter.exercises_status === 'generating') {
      buttonText = "Relancer la génération";
      message = "Génération des exercices en cours... Cliquez pour forcer si besoin.";
    } else if (chapter.exercises_status === 'failed') {
      buttonText = "Réessayer de générer les exercices";
      message = "La génération des exercices a échoué. Veuillez réessayer.";
    }
    return (
      <Box textAlign="center" my={4}>
        {chapter.exercises_status === 'generating' && <CircularProgress sx={{mb: 2}}/>}
        <Typography>{message}</Typography>
        <Button variant="contained" onClick={() => exercisesMutation.mutate(chapterId)} disabled={exercisesMutation.isPending} sx={{mt: 2}}>
          {exercisesMutation.isPending ? <CircularProgress size={24} /> : buttonText}
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
        <Paper sx={{p: 3, mt: 2}}>
            <Typography variant="h4" component="h1" gutterBottom>
              {chapter?.title}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderContent()}
        </Paper>

        <Divider sx={{ my: 4 }}><Typography variant="h6">Exercices</Typography></Divider>
        
        {renderExercises()}

        {/* --- BOUTON DE PROGRESSION --- */}
        {chapter?.exercises_status === 'completed' && chapter.knowledge_components.length > 0 && (
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<NavigateNextIcon />}
              disabled={!isChapterComplete}
              onClick={() => {
                if (nextChapterId) {
                  navigate(`/chapters/${nextChapterId}`);
                } else {
                  navigate(`/levels/${chapter.level_id}`);
                }
              }}
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