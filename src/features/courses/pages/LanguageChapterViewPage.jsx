// Fichier : nanshe/frontend/src/features/courses/pages/LanguageChapterViewPage.jsx (VERSION FINALE COMPLÈTE)

import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
    Box, Container, Typography, CircularProgress, Alert, Divider, Paper, 
    Button, Grid, Accordion, AccordionSummary, AccordionDetails 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';

// --- Fonctions d'API ---
const fetchChapterById = async (chapterId) => {
  const { data } = await apiClient.get(`/chapters/${chapterId}`);
  return data;
};

const resetChapterAnswers = (chapterId) => {
    return apiClient.post(`/progress/reset/chapter/${chapterId}`);
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
  const queryClient = useQueryClient();

  const { data: chapter, isLoading, isError, error } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => fetchChapterById(chapterId),
    refetchInterval: (query) => {
        const data = query.state.data;
        return data?.lesson_status === 'generating' ? 3000 : false;
    },
  });

  const resetMutation = useMutation({
      mutationFn: resetChapterAnswers,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      }
  });

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
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="h6">Votre tuteur personnel prépare ce chapitre...</Typography>
                  <Typography color="text.secondary">Génération du vocabulaire, de la grammaire et du dialogue en cours.</Typography>
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
                    <Paper variant="outlined" sx={{ p: 3, whiteSpace: 'pre-wrap', lineHeight: 1.8, backgroundColor: 'rgba(0,0,0,0.03)' }}>
                        <Typography>{chapter.lesson_text}</Typography>
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
      </Box>
    </Container>
  );
};

export default LanguageChapterViewPage;