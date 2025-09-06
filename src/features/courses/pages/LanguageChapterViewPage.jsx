// Fichier: frontend/src/features/courses/pages/LanguageChapterViewPage.jsx (VERSION MISE À JOUR)
import React, { useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import {
    Box, Container, Typography, CircularProgress, Alert, Divider, Paper,
    Button, Grid, List, ListItem, ListItemText, LinearProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';
import DiscussionComponent from '../../learning/components/DiscussionComponent';

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

const resetChapterAnswers = (chapterId) => {
    return apiClient.post(`/progress/reset/chapter/${chapterId}`);
};

const completeChapter = (chapterId) => {
    return apiClient.post(`/progress/chapter/${chapterId}/complete`);
};

const fetchFeedbackStatuses = async ({ contentType, contentIds }) => {
    if (!contentIds || contentIds.length === 0) {
        return { statuses: {} };
    }
    const { data } = await apiClient.post('/feedback/status', {
        content_type: contentType,
        content_ids: contentIds,
    });
    return data;
};


// --- SOUS-COMPOSANTS POUR AFFICHER LA MAÎTRISE ---

const CharacterList = ({ items }) => (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Caractères</Typography>
        <List>
            {items.map((char, index) => (
                <React.Fragment key={char.id}>
                    <ListItem disableGutters>
                        <ListItemText
                            primary={<Typography variant="h6" component="span" sx={{ fontFamily: 'monospace' }}>{char.character}</Typography>}
                            secondary={`${char.pinyin} - ${char.meaning}`}
                        />
                        <Box sx={{ width: '30%', ml: 2 }}>
                            <LinearProgress variant="determinate" value={char.strength * 100} />
                            <Typography variant="caption" align="right" component="div" color="text.secondary">
                                {`${Math.round(char.strength * 100)}%`}
                            </Typography>
                        </Box>
                    </ListItem>
                    {index < items.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
    </Paper>
);

const VocabularyList = ({ items }) => (
    <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Vocabulaire</Typography>
        <List>
            {items.map((item, index) => (
                <React.Fragment key={item.id}>
                    <ListItem disableGutters>
                        <ListItemText
                            primary={<Typography variant="h6" component="span">{item.word}</Typography>}
                            secondary={`${item.pinyin} - ${item.translation}`}
                        />
                        <Box sx={{ width: '30%', ml: 2 }}>
                            <LinearProgress variant="determinate" value={item.strength * 100} />
                            <Typography variant="caption" align="right" component="div" color="text.secondary">
                                {`${Math.round(item.strength * 100)}%`}
                            </Typography>
                        </Box>
                    </ListItem>
                    {index < items.length - 1 && <Divider component="li" />}
                </React.Fragment>
            ))}
        </List>
    </Paper>
);


// --- COMPOSANT PRINCIPAL ---
const LanguageChapterViewPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: chapter, isLoading, isError, error } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => fetchChapterById(chapterId),
    refetchInterval: (query) => {
        const data = query.state.data;
        return ['generating', 'pending'].includes(data?.lesson_status) ? 3000 : false;
    },
  });

  const { data: level } = useQuery({
      queryKey: ['level', chapter?.level?.id],
      queryFn: () => fetchLevelById(chapter?.level?.id),
      enabled: !!chapter?.level?.id,
  });

  const componentIds = useMemo(() =>
      chapter?.knowledge_components?.map(c => c.id) || [],
      [chapter]
  );

  const { data: feedbackData } = useQuery({
      queryKey: ['feedbackStatus', 'knowledge_component', componentIds],
      queryFn: () => fetchFeedbackStatuses({
          contentType: 'knowledge_component',
          contentIds: componentIds
      }),
      enabled: !!chapter && componentIds.length > 0,
  });

  const resetMutation = useMutation({
      mutationFn: () => resetChapterAnswers(chapterId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] })
  });

  const completeChapterMutation = useMutation({
      mutationFn: () => completeChapter(chapterId),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
          queryClient.invalidateQueries({ queryKey: ['level', chapter?.level.id] });
          if(nextChapterId) navigate(`/chapters/${nextChapterId}`);
      }
  });

  const { isChapterComplete, nextChapterId } = useMemo(() => {
    if (!chapter || !level) return { isChapterComplete: false, nextChapterId: null };
    const sortedChapters = [...level.chapters].sort((a, b) => a.order - b.order);
    const currentIndex = sortedChapters.findIndex(c => c.id === parseInt(chapterId, 10));
    const nextChapter = currentIndex !== -1 && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

    if (chapter.is_theoretical) {
        return { isChapterComplete: true, nextChapterId: nextChapter?.id };
    }

    const allCorrect = chapter.knowledge_components?.length > 0 && chapter.knowledge_components.every(comp => comp.user_answer?.is_correct === true);
    return { isChapterComplete: allCorrect, nextChapterId: nextChapter?.id };
  }, [chapter, level, chapterId]);


  // --- RENDU ---
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (isError) return <Alert severity="error">{error.response?.data?.detail || "Impossible de charger le chapitre."}</Alert>;

  if (['generating', 'pending'].includes(chapter.lesson_status)) {
      return (
          <Container sx={{ textAlign: 'center', mt: 5 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                  Préparation de votre leçon par notre IA...
              </Typography>
              <Typography color="text.secondary">
                  {chapter.generation_step || "Initialisation..."} ({chapter.generation_progress || 0}%)
              </Typography>
          </Container>
      );
  }

  if (chapter.lesson_status === 'failed') {
      return <Alert severity="error">La génération de ce chapitre a échoué.</Alert>;
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Button component={RouterLink} to={`/levels/${chapter?.level.id}`}>&larr; Retour à la liste des chapitres</Button>

        <Paper sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" gutterBottom>{chapter?.title}</Typography>
              {!chapter.is_theoretical && (
                <Button onClick={() => resetMutation.mutate()} size="small" startIcon={<RefreshIcon />} disabled={resetMutation.isPending}>
                  Réinitialiser
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />

            {chapter.is_theoretical ? (
                <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{chapter.lesson_content}</Typography>
            ) : (
                <>
                    {/* NOUVELLE LOGIQUE D'AFFICHAGE */}
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            {chapter.characters?.length > 0 && <CharacterList items={chapter.characters} />}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {chapter.vocabulary?.length > 0 && <VocabularyList items={chapter.vocabulary} />}
                        </Grid>
                    </Grid>
                    
                    {chapter.lesson_content && (
                        <Box sx={{mt: 4}}>
                            <Typography variant="h5" gutterBottom>Dialogue</Typography>
                            <DiscussionComponent content={chapter.lesson_content} />
                        </Box>
                    )}
                </>
            )}
        </Paper>

        {!chapter.is_theoretical && chapter.exercises_status === 'completed' && chapter.knowledge_components.length > 0 && (
          <>
            <Divider sx={{ my: 4 }}><Typography variant="h6">Exercices Pratiques</Typography></Divider>
            {chapter.knowledge_components.map((component) => (
              <KnowledgeComponentViewer
                key={component.id}
                component={component}
                submittedAnswer={component.user_answer}
                initialVote={feedbackData?.statuses?.[component.id]}
              />
            ))}
          </>
        )}

        <Box textAlign="center" mt={4}>
          {chapter.is_theoretical ? (
              <Button
                  variant="contained" color="primary" size="large"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => completeChapterMutation.mutate()}
                  disabled={completeChapterMutation.isPending}
              >
                  {nextChapterId ? 'Continuer' : 'Terminer le Niveau'}
              </Button>
          ) : (
             chapter.exercises_status === 'completed' && (
                <>
                  <Button
                    variant="contained" color="primary" size="large"
                    endIcon={<NavigateNextIcon />}
                    disabled={!isChapterComplete || completeChapterMutation.isPending}
                    onClick={() => navigate(nextChapterId ? `/chapters/${nextChapterId}` : `/levels/${chapter.level.id}`)}
                  >
                    {nextChapterId ? 'Chapitre Suivant' : 'Retour au Niveau'}
                  </Button>
                  {!isChapterComplete && (
                    <Typography variant="caption" display="block" mt={1}>
                      Veuillez répondre correctement à tous les exercices pour continuer.
                    </Typography>
                  )}
                </>
             )
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default LanguageChapterViewPage;