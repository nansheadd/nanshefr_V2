import React, { useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Divider,
    Paper,
    Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';
import LessonComponent from '../../learning/components/LessonComponent';

// --- Fonctions d'API ---

// Récupère les détails du chapitre
const fetchChapterById = async (chapterId) => {
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return data;
};

// Récupère les détails du niveau (pour la navigation)
const fetchLevelById = async (levelId) => {
    if (!levelId) return null;
    const { data } = await apiClient.get(`/levels/${levelId}`);
    return data;
};

// Réinitialise les réponses du chapitre
const resetChapterAnswers = (chapterId) => {
    return apiClient.post(`/progress/reset/chapter/${chapterId}`);
};

// Marque un chapitre comme terminé (pour les chapitres théoriques)
const completeChapter = (chapterId) => {
    return apiClient.post(`/progress/chapter/${chapterId}/complete`);
};

// NOUVELLE FONCTION : Récupère les statuts de feedback pour plusieurs exercices
const fetchFeedbackStatuses = async ({ contentType, contentIds }) => {
    if (!contentIds || contentIds.length === 0) {
        return { statuses: {} }; // Retourne un objet vide si pas d'IDs
    }
    const { data } = await apiClient.post('/feedback/status', {
        content_type: contentType,
        content_ids: contentIds,
    });
    return data;
};

// --- COMPOSANT PRINCIPAL ---

const ChapterViewPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Requête pour récupérer les données du chapitre
const { data: chapter, isLoading, isError, error } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => fetchChapterById(chapterId),
    refetchInterval: (query) => {
        const data = query.state.data;
        // Si un exercice est en attente d'analyse, on rafraîchit toutes les 3 secondes
        const isPending = data?.knowledge_components?.some(c => c.user_answer?.status === 'pending_review');
        return isPending ? 3000 : false;
    },
});

  // Requête pour récupérer les données du niveau (activée seulement quand on a l'ID du niveau)
  const { data: level } = useQuery({
      queryKey: ['level', chapter?.level?.id],
      queryFn: () => fetchLevelById(chapter?.level?.id),
      enabled: !!chapter?.level?.id,
  });

  // --- NOUVELLE REQUÊTE POUR LES FEEDBACKS ---
  // 1. On extrait la liste des IDs des exercices du chapitre
  const componentIds = useMemo(() => 
      chapter?.knowledge_components?.map(c => c.id) || [],
      [chapter]
  );

  // 2. On lance une requête pour récupérer les votes de l'utilisateur pour ces exercices
  const { data: feedbackData } = useQuery({
      queryKey: ['feedbackStatus', 'knowledge_component', componentIds],
      queryFn: () => fetchFeedbackStatuses({ 
          contentType: 'knowledge_component', 
          contentIds: componentIds 
      }),
      // La requête ne se lance que si on a bien les IDs des composants
      enabled: !!chapter && componentIds.length > 0,
  });
  // ---------------------------------------------

  // Mutation pour réinitialiser les réponses
  const resetMutation = useMutation({
      mutationFn: () => resetChapterAnswers(chapterId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] })
  });

  // Mutation pour marquer un chapitre comme complété
  const completeChapterMutation = useMutation({
      mutationFn: () => completeChapter(chapterId),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
          queryClient.invalidateQueries({ queryKey: ['level', chapter?.level.id] });
          if(nextChapterId) navigate(`/chapters/${nextChapterId}`);
      }
  });

  const handleFeedbackSuccess = () => {
        // Cette fonction invalidera la requête avec la bonne clé
        queryClient.invalidateQueries({ queryKey: ['feedbackStatus', 'knowledge_component', componentIds] });
    };

  // Calcule si le chapitre est terminé et trouve l'ID du chapitre suivant
  const { isChapterComplete, nextChapterId } = useMemo(() => {
    if (!chapter || !level) return { isChapterComplete: false, nextChapterId: null };

    const sortedChapters = [...level.chapters].sort((a, b) => a.chapter_order - b.chapter_order);
    const currentIndex = sortedChapters.findIndex(c => c.id === chapter.id);
    const nextChapter = currentIndex !== -1 && currentIndex < sortedChapters.length - 1 
      ? sortedChapters[currentIndex + 1] 
      : null;
      
    if (chapter.is_theoretical) {
      return { isChapterComplete: true, nextChapterId: nextChapter?.id };
    }

    const allCorrect = chapter.knowledge_components?.length > 0 && chapter.knowledge_components.every(comp => comp.user_answer?.is_correct === true);
    
    return { isChapterComplete: allCorrect, nextChapterId: nextChapter?.id };
  }, [chapter, level]);


  // --- AFFICHAGE ---

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Alert severity="error">{error.response?.data?.detail || "Impossible de charger le chapitre."}</Alert>;
  }

  if (['pending', 'generating'].includes(chapter.lesson_status)) {
    return (
        <Container sx={{ textAlign: 'center', mt: 5 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Votre leçon est en cours de préparation par notre IA...
            </Typography>
            <Typography color="text.secondary">
                {chapter.generation_step || "Initialisation..."} ({chapter.generation_progress || 0}%)
            </Typography>
        </Container>
    );
  }
  
  if (chapter.lesson_status === 'failed') {
      return <Alert severity="error">La génération de ce chapitre a échoué. Veuillez réessayer plus tard.</Alert>;
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Button component={RouterLink} to={`/levels/${chapter?.level.id}`}>&larr; Retour à la liste des chapitres</Button>
        
        <Paper sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">{chapter.title}</Typography>
            {!chapter.is_theoretical && (
              <Button onClick={() => resetMutation.mutate()} size="small" startIcon={<RefreshIcon />} disabled={resetMutation.isPending}>
                Réinitialiser
              </Button>
            )}
          </Box>
          <Divider sx={{ my: 2 }} />
          
          <LessonComponent content={{ lesson_text: chapter.lesson_text }} />
        </Paper>

        {!chapter.is_theoretical && chapter.knowledge_components?.map((component) => (
                    <KnowledgeComponentViewer
                        key={component.id}
                        component={component}
                        submittedAnswer={component.user_answer}
                        initialVote={feedbackData?.statuses?.[component.id]}
                        // On passe la fonction de rafraîchissement
                        onFeedbackSuccess={handleFeedbackSuccess}
                    />
                ))}
        
        <Box textAlign="center" mt={4}>
          {chapter.is_theoretical ? (
              <Button
                  variant="contained" color="primary" size="large"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => completeChapterMutation.mutate()}
                  disabled={completeChapterMutation.isPending}
              >
                  {nextChapterId ? 'Commencer la première leçon' : 'Terminer le Niveau'}
              </Button>
          ) : (
            isChapterComplete && (
              <Button
                variant="contained" color="primary" size="large"
                endIcon={<NavigateNextIcon />}
                onClick={() => navigate(nextChapterId ? `/chapters/${nextChapterId}` : `/levels/${chapter.level.id}`)}
              >
                {nextChapterId ? 'Chapitre Suivant' : 'Retour au Niveau'}
              </Button>
            )
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ChapterViewPage;