// Fichier: nanshe/frontend/src/features/learning/components/AssociationDragDropComponent.jsx (NOUVEAU)
import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, Paper, Stack, Alert, CircularProgress, Grid } from '@mui/material';

// Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const AssociationDragDropComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  // --- LOGIQUE DE NORMALISATION DES DONNÉES ---
  // On rend le composant capable de comprendre plusieurs formats de JSON
  const initialPairs = useMemo(() => {
    if (Array.isArray(content_json.pairs)) {
        return content_json.pairs; // Format standard {prompt, answer}
    }
    if (Array.isArray(content_json.items_left) && Array.isArray(content_json.items_right)) {
        // Format avec deux listes séparées
        return content_json.items_left.map((prompt, index) => ({
            prompt,
            answer: content_json.items_right[index]
        }));
    }
    // Fallback pour les anciens formats ou les formats inattendus
    if (typeof content_json.pairs === 'object' && content_json.pairs !== null) {
        return Object.entries(content_json.pairs).map(([prompt, answer]) => ({ prompt, answer }));
    }
    return []; // Retourne un tableau vide si le format est inconnu
  }, [content_json]);

  const prompts = initialPairs.map((p) => p.prompt);
  const initialAnswers = shuffleArray(initialPairs.map((p) => p.answer));

  const [answers, setAnswers] = useState(initialAnswers);
  const [associations, setAssociations] = useState({});
  const [result, setResult] = useState(submittedAnswer);

  useEffect(() => {
    if (submittedAnswer) {
      setAssociations(submittedAnswer.user_answer_json?.associations || {});
      // On désactive les interactions en retirant les réponses disponibles
      setAnswers([]);
    }
  }, [submittedAnswer]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
  });

  const onDragEnd = (event) => {
    const { source, destination } = event;

    // Si on lâche en dehors d'une zone valide
    if (!destination) return;

    // Si on lâche sur la même colonne d'où l'on vient
    if (source.droppableId === destination.droppableId) return;

    const answer = answers[source.index];
    const promptId = destination.droppableId; // ex: "prompt-0"

    // Mettre à jour les associations
    setAssociations(prev => ({ ...prev, [promptId]: answer }));

    // Retirer la réponse de la liste des options disponibles
    const newAnswers = [...answers];
    newAnswers.splice(source.index, 1);
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    mutation.mutate({
      component_id: component.id,
      user_answer_json: { associations }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {content_json.prompt || content_json.instruction}
      </Typography>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Colonne des Prompts (Mots à traduire) */}
          <Grid item xs={6}>
            <Paper sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>Mots</Typography>
              <Stack spacing={1}>
                {prompts.map((prompt, index) => (
                  <Droppable key={`prompt-${index}`} droppableId={`prompt-${index}`} isDropDisabled={!!result}>
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Typography>{prompt}</Typography>
                        {associations[`prompt-${index}`] && (
                          <Paper elevation={3} sx={{ px: 1.5, py: 0.5, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                            {associations[`prompt-${index}`]}
                          </Paper>
                        )}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Colonne des Réponses (Traductions à glisser) */}
          <Grid item xs={6}>
            <Paper sx={{ p: 1, backgroundColor: '#f5f5f5', minHeight: '100%' }}>
              <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>Traductions</Typography>
              <Droppable droppableId="answers" isDropDisabled={!!result}>
                {(provided) => (
                  <Stack 
                    spacing={1}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {answers.map((answer, index) => (
                      <Draggable key={answer} draggableId={answer} index={index}>
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ p: 2, textAlign: 'center', cursor: 'grab' }}
                          >
                            {answer}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </Paper>
          </Grid>
        </Grid>
      </DragDropContext>

      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 3 }} disabled={!!result || mutation.isPending}>
        {mutation.isPending ? <CircularProgress size={24} /> : 'Valider'}
      </Button>

      {result && (
        <Alert severity={result.is_correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.feedback}
        </Alert>
      )}
    </Box>
  );
};

export default AssociationDragDropComponent;
