// Fichier: src/features/learning/components/ReorderComponent.jsx (VERSION FINALE CORRIGÉE)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Alert, CircularProgress } from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const ReorderComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  const initialItems = content_json.items || content_json.sentence_parts || [];
  
  const [items, setItems] = useState(initialItems);
  const [result, setResult] = useState(submittedAnswer);

  useEffect(() => {
    if (submittedAnswer) {
      setItems(submittedAnswer.user_answer_json?.ordered_items || initialItems);
      setResult(submittedAnswer);
    }
  }, [submittedAnswer, initialItems]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
    onError: (error) => {
      setResult({ is_correct: false, feedback: error.message || "Une erreur est survenue." });
    }
  });

  // --- CORRECTION DE LA LOGIQUE onDragEnd ---
  const onDragEnd = (dragResult) => {
    // Si l'utilisateur a déjà répondu, on ne fait rien.
    if (!!result) return;
    // Si l'élément est déposé en dehors de la liste, on ne fait rien
    if (!dragResult.destination) return;
    
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(dragResult.source.index, 1);
    reorderedItems.splice(dragResult.destination.index, 0, removed);
    setItems(reorderedItems);
  };

  const handleSubmit = () => {
    mutation.mutate({
      component_id: component.id,
      user_answer_json: { "ordered_items": items }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{content_json.instruction || "Mettez les éléments suivants dans le bon ordre."}</Typography>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`reorder-list-${component.id}`}>
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {Array.isArray(items) && items.map((item, index) => (
                <Draggable 
                  key={`${item}-${index}`} 
                  draggableId={`${item}-${index}`} 
                  index={index} 
                  // Le glisser-déposer est désactivé si une réponse a été validée
                  isDragDisabled={!!result}
                >
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      component={Paper}
                      sx={{ mb: 1, backgroundColor: !!result ? '#f5f5f5' : 'inherit', cursor: !!result ? 'default' : 'grab' }}
                    >
                      <ListItemText primary={item} />
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Button 
        variant="contained" 
        onClick={handleSubmit} 
        sx={{ mt: 2 }}
        disabled={mutation.isPending || !!result}
      >
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

export default ReorderComponent;