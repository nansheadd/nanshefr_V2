// Fichier : nanshe/frontend/src/features/courses/pages/LanguageChapterViewPage.jsx (VERSION FINALE COMPLÈTE)

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
    Box, Container, Typography, CircularProgress, Alert, Divider, Paper, 
    Button, Grid, Accordion, AccordionSummary, AccordionDetails, LinearProgress 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';
import LessonComponent from '../../learning/components/LessonComponent';

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

// --- LOGIQUE D'ANIMATION ---
const CHAPTER_PROGRESS_STEPS = [0, 5, 10, 30, 50, 70, 80, 100];

const useAnimatedProgress = (serverProgress, isGenerating) => {
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const animationInterval = useRef(null);

    useEffect(() => {
        if (!isGenerating) {
            if (animationInterval.current) clearInterval(animationInterval.current);
            if (serverProgress > 0) setDisplayedProgress(100);
            return;
        }

        if (animationInterval.current) clearInterval(animationInterval.current);

        animationInterval.current = setInterval(() => {
            setDisplayedProgress(prev => {
                if (prev < serverProgress) {
                    return Math.min(prev + 2, serverProgress);
                }
                const nextStepIndex = CHAPTER_PROGRESS_STEPS.findIndex(step => step > prev);
                const nextStepTarget = nextStepIndex !== -1 ? CHAPTER_PROGRESS_STEPS[nextStepIndex] : 100;
                const animationTarget = nextStepTarget - 1;

                if (prev >= animationTarget) {
                    return prev;
                }
                return prev + 1;
            });
        }, 700);

        return () => clearInterval(animationInterval.current);
    }, [serverProgress, isGenerating]);

    return displayedProgress;
};

// --- SOUS-COMPOSANTS POUR AFFICHER LE CONTENU RICHE ---
const VocabularyList = ({ items }) => (
    <Box>
        <Typography variant="h6" gutterBottom>Vocabulaire à apprendre</Typography>
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
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Points de grammaire</Typography>
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

// --- COMPOSANT PRINCIPAL DE LA PAGE ---
const LanguageChapterViewPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: chapter, isLoading, isError, error } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => fetchChapterById(chapterId),
    refetchInterval: (query) => {
        const data = query.state.data;
        return data?.lesson_status === 'generating' ? 3000 : false;
    },
  });

  const { data: level } = useQuery({
      queryKey: ['level', chapter?.level?.id],
      queryFn: () => fetchLevelById(chapter?.level?.id),
      enabled: !!chapter?.level?.id,
  });

  const resetMutation = useMutation({
      mutationFn: resetChapterAnswers,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      }
  });

  const isGenerating = chapter?.lesson_status === 'generating';
  const serverProgress = chapter?.generation_progress || 0;
  const animatedProgress = useAnimatedProgress(serverProgress, isGenerating);

  const { isChapterComplete, nextChapterId } = useMemo(() => {
    if (!chapter?.knowledge_components || chapter.knowledge_components.length === 0) {
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

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Alert severity="error">{error.response?.data?.detail || "Impossible de charger le chapitre."}</Alert>;
  }
  
  if (chapter.lesson_status === 'generating') {
      return (
          <Container>
              <Paper sx={{ my: 4, p: 4, textAlign: 'center' }}>
                  <Typography variant="h5">Votre tuteur personnel prépare ce chapitre...</Typography>
                  <Box my={3}>
                      <LinearProgress 
                          variant="determinate" 
                          value={animatedProgress}
                          sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {chapter.generation_step || 'Initialisation...'} ({Math.round(animatedProgress)}%)
                      </Typography>
                  </Box>
              </Paper>
          </Container>
      );
  }
  
  if (chapter.lesson_status === 'failed') {
      return (
          <Container>
              <Alert severity="error" sx={{ mt: 4 }}>
                  Une erreur est survenue lors de la préparation de ce chapitre. Veuillez réessayer plus tard ou contacter le support.
                  <Button component={RouterLink} to={`/levels/${chapter?.level?.id}`} sx={{ mt: 1 }}>Retour à la liste des chapitres</Button>
              </Alert>
          </Container>
      )
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Button component={RouterLink} to={`/levels/${chapter?.level.id}`}>&larr; Retour à la liste des chapitres</Button>
        
        <Paper sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" gutterBottom>{chapter?.title}</Typography>
              <Button 
                onClick={() => resetMutation.mutate(chapterId)} 
                size="small" 
                startIcon={<RefreshIcon />} 
                disabled={resetMutation.isLoading}
              >
                Réinitialiser
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {chapter.vocabulary_items?.length > 0 && <VocabularyList items={chapter.vocabulary_items} />}
            {chapter.grammar_rules?.length > 0 && <GrammarRules rules={chapter.grammar_rules} />}
            
            {chapter.lesson_text && (
                <Box sx={{mt: 3}}>
                    <Typography variant="h6" gutterBottom>Dialogue</Typography>
                    <Paper variant="outlined" sx={{ p: 3, backgroundColor: 'rgba(0,0,0,0.03)' }}>
                        <LessonComponent content={{ lesson_text: chapter.lesson_text }} />
                    </Paper>
                </Box>
            )}
        </Paper>

        {chapter.exercises_status === 'completed' && chapter.knowledge_components.length > 0 && (
          <>
            <Divider sx={{ my: 4 }}><Typography variant="h6">Exercices Pratiques</Typography></Divider>
            {chapter.knowledge_components.map((component) => (
              <KnowledgeComponentViewer key={component.id} component={component} submittedAnswer={component.user_answer} />
            ))}
          </>
        )}

        {chapter.exercises_status === 'completed' && (
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained" color="primary" size="large"
              endIcon={<NavigateNextIcon />}
              disabled={!isChapterComplete}
              onClick={() => navigate(nextChapterId ? `/chapters/${nextChapterId}` : `/levels/${chapter.level.id}`)}
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

export default LanguageChapterViewPage;
