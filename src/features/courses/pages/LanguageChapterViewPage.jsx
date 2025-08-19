// Fichier : nanshe/frontend/src/features/courses/pages/LanguageChapterViewPage.jsx (VERSION MISE À JOUR)

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
import LessonComponent from '../../learning/components/LessonComponent'; // Gardé pour les dialogues

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

// NOUVELLE FONCTION D'API POUR LE BOUTON
const completeChapter = (chapterId) => {
    return apiClient.post(`/progress/chapter/${chapterId}/complete`);
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
        return data?.lesson_status === 'generating' ? 3000 : false;
    },
  });

  const { data: level } = useQuery({
      queryKey: ['level', chapter?.level?.id],
      queryFn: () => fetchLevelById(chapter?.level?.id),
      enabled: !!chapter?.level?.id,
  });

  // --- Mutations ---
  const resetMutation = useMutation({
      mutationFn: resetChapterAnswers,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] })
  });

  const completeChapterMutation = useMutation({
      mutationFn: completeChapter,
      onSuccess: () => {
          // On invalide le chapitre et le niveau pour mettre à jour l'accès
          queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
          queryClient.invalidateQueries({ queryKey: ['level', chapter?.level.id] });
          // On navigue vers le chapitre suivant
          if(nextChapterId) navigate(`/chapters/${nextChapterId}`);
      }
  });

  // --- Logique de progression ---
  const { isChapterComplete, nextChapterId } = useMemo(() => {
    if (!chapter) return { isChapterComplete: false, nextChapterId: null };
    
    // Un chapitre théorique est toujours "complet" pour la progression
    if (chapter.is_theoretical) {
        // On cherche quand même le chapitre suivant
        let nextId = null;
        if (level?.chapters) {
          const sortedChapters = [...level.chapters].sort((a, b) => a.chapter_order - b.chapter_order);
          const currentIndex = sortedChapters.findIndex(c => c.id === chapter.id);
          if (currentIndex !== -1 && currentIndex < sortedChapters.length - 1) {
            nextId = sortedChapters[currentIndex + 1].id;
          }
        }
        return { isChapterComplete: true, nextChapterId: nextId };
    }

    // Pour les chapitres pratiques, on vérifie les exercices
    const allCorrect = chapter.knowledge_components?.every(comp => comp.user_answer?.is_correct === true);
    
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


  // --- RENDU ---
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (isError) return <Alert severity="error">{error.response?.data?.detail || "Impossible de charger le chapitre."}</Alert>;

  // Affiche un écran de chargement si le contenu est en cours de génération
  if (chapter.lesson_status === 'generating') {
      // (Vous pouvez réutiliser votre composant de chargement avec la barre de progression animée ici si vous le souhaitez)
      return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /><Typography>Préparation de votre leçon...</Typography></Box>;
  }
  
  // Affiche une erreur si la génération a échoué
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
                <Button onClick={() => resetMutation.mutate(chapterId)} size="small" startIcon={<RefreshIcon />} disabled={resetMutation.isLoading}>
                  Réinitialiser
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Aiguillage du contenu : théorique vs pratique */}
            {chapter.is_theoretical ? (
                // Affiche la leçon théorique (texte long)
                <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{chapter.lesson_text}</Typography>
            ) : (
                // Affiche la structure pratique (Vocab, Grammaire, Dialogue)
                <>
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
                </>
            )}
        </Paper>

        {/* Affiche les exercices uniquement si le chapitre est pratique */}
        {!chapter.is_theoretical && chapter.exercises_status === 'completed' && chapter.knowledge_components.length > 0 && (
          <>
            <Divider sx={{ my: 4 }}><Typography variant="h6">Exercices Pratiques</Typography></Divider>
            {chapter.knowledge_components.map((component) => (
              <KnowledgeComponentViewer key={component.id} component={component} submittedAnswer={component.user_answer} />
            ))}
          </>
        )}

        {/* Logique du bouton de fin de chapitre */}
        <Box textAlign="center" mt={4}>
          {chapter.is_theoretical ? (
              <Button
                  variant="contained" color="primary" size="large"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => completeChapterMutation.mutate(chapterId)}
                  disabled={completeChapterMutation.isPending}
              >
                  {nextChapterId ? 'Continuer vers le premier chapitre' : 'Terminer le Niveau'}
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
                    {nextChapterId ? 'Chapitre Suivant' : 'Terminer le Niveau'}
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