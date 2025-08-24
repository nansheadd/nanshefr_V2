import React, { useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
    Box, Container, Typography, CircularProgress, Alert, Divider, Paper, 
    Button, Grid, Accordion, AccordionSummary, AccordionDetails 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';
import LessonComponent from '../../learning/components/LessonComponent';
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

// NOUVELLE FONCTION API POUR RÉCUPÉRER LES VOTES
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


// --- SOUS-COMPOSANTS ---
const VocabularyList = ({ items }) => (
    <Box>
        <Typography variant="h6" gutterBottom>Vocabulaire à Apprendre</Typography>
        <Grid container spacing={2}>
            {items.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" component="p">{item.term} <Typography component="span" color="text.secondary">({item.pronunciation})</Typography></Typography>
                        <Typography variant="body1">{item.translation}</Typography>
                        {item.example_sentence && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>"{item.example_sentence}"</Typography>}
                    </Paper>
                </Grid>
            ))}
        </Grid>
    </Box>
);

const GrammarRules = ({ rules }) => (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Points de Grammaire</Typography>
        {rules.map(rule => (
            <Accordion key={rule.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>{rule.rule_name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>{rule.explanation}</Typography>
                    {rule.example_sentence && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Exemple : "{rule.example_sentence}"</Typography>}
                </AccordionDetails>
            </Accordion>
        ))}
    </Box>
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

  // --- NOUVELLE REQUÊTE POUR LES FEEDBACKS ---
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

  // --- Mutations ---
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

  // --- Logique de progression ---
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
                <Button onClick={() => resetMutation.mutate()} size="small" startIcon={<RefreshIcon />} disabled={resetMutation.isLoading}>
                  Réinitialiser
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />

            {chapter.is_theoretical ? (
                <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{chapter.lesson_text}</Typography>
            ) : (
                <>
                    {chapter.vocabulary_items?.length > 0 && <VocabularyList items={chapter.vocabulary_items} />}
                    {chapter.grammar_rules?.length > 0 && <GrammarRules rules={chapter.grammar_rules} />}
                    <Box sx={{mt: 3}}>
                            <Typography variant="h6" gutterBottom>Dialogue</Typography>
                            {/* On remplace le Paper et LessonComponent par notre composant spécialisé */}
                            <DiscussionComponent content={chapter.lesson_text} />
                        </Box>
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
                  {nextChapterId ? 'Continuer vers la première leçon' : 'Terminer le Niveau'}
              </Button>
          ) : (
             chapter.exercises_status === 'completed' && (
                <>
                  <Button
                    variant="contained" color="primary" size="large"
                    endIcon={<NavigateNextIcon />}
                    disabled={!isChapterComplete}
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