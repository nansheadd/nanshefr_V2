// Fichier: nanshe/frontend/src/features/learning/components/SentenceConstructionComponent.jsx (NOUVEAU)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, Paper, Stack, Alert, CircularProgress } from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const SentenceConstructionComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  // On s'assure que les mots ne sont pas déjà dans le bon ordre au départ
  const initialWords = content_json.scrambled || [];
  
  const [words, setWords] = useState(initialWords);
  const [result, setResult] = useState(submittedAnswer);

  useEffect(() => {
    if (submittedAnswer) {
      // Si l'exercice est déjà fait, on affiche l'ordre que l'utilisateur avait soumis
      setWords(submittedAnswer.user_answer_json?.ordered_items || initialWords);
      setResult(submittedAnswer);
    }
  }, [submittedAnswer, initialWords]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
  });

  const onDragEnd = (dragResult) => {
    if (result || !dragResult.destination) return;

    const reorderedWords = Array.from(words);
    const [removed] = reorderedWords.splice(dragResult.source.index, 1);
    reorderedWords.splice(dragResult.destination.index, 0, removed);
    setWords(reorderedWords);
  };

  const handleSubmit = () => {
    mutation.mutate({
      component_id: component.id,
      // On envoie la liste des mots dans l'ordre choisi par l'utilisateur
      user_answer_json: { "ordered_items": words }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{content_json.instruction}</Typography>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`sentence-${component.id}`} direction="horizontal">
          {(provided) => (
            <Paper
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ 
                mt: 3, 
                p: 2, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                minHeight: '60px',
                backgroundColor: '#f5f5f5'
              }}
            >
              {words.map((word, index) => (
                <Draggable 
                  key={`${word}-${index}`} 
                  draggableId={`${word}-${index}`} 
                  index={index}
                  isDragDisabled={!!result}
                >
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      elevation={3}
                      sx={{ 
                        p: '8px 16px',
                        cursor: result ? 'default' : 'grab',
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    >
                      {word}
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Paper>
          )}
        </Droppable>
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

export default SentenceConstructionComponent;