import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Alert, Box, Button, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const OrderingAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const prompt = content.prompt || content.instruction || atom?.title;
  const correctOrder = useMemo(() => {
    if (Array.isArray(content.items)) return content.items;
    if (Array.isArray(content.steps)) return content.steps;
    if (Array.isArray(content.sequence)) return content.sequence;
    return [];
  }, [content.items, content.steps, content.sequence]);

  const [items, setItems] = useState(() => correctOrder.map((value, index) => ({ id: `${index}-${value}`, value })));
  const [result, setResult] = useState(null);

  const { submitAnswer, resetProgress, logAnswerMutation, resetMutation, isLoading } = useAtomAnswer({
    atom,
    onReward,
    onResult: (data) => setResult(data),
    onReset: () => {
      setItems(correctOrder.map((value, index) => ({ id: `${index}-${value}`, value })));
      setResult(null);
    },
  });

  const completed = atom?.progress_status === 'completed';
  const showReset = completed || Boolean(result?.is_correct);
  const disabled = showReset;

  const onDragEnd = (event) => {
    if (!event.destination || disabled || isLoading) return;
    const updated = Array.from(items);
    const [removed] = updated.splice(event.source.index, 1);
    updated.splice(event.destination.index, 0, removed);
    setItems(updated);
  };

  const handleSubmit = () => {
    if (logAnswerMutation.isPending) return;
    const userOrdered = items.map((item) => item.value);
    const isCorrect = userOrdered.every((value, index) => value === correctOrder[index]);
    submitAnswer(isCorrect, { ordered_items: userOrdered });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {prompt}
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`ordering-${atom?.id}`}>
          {(provided) => (
            <List ref={provided.innerRef} {...provided.droppableProps} sx={{ mt: 2 }}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={disabled}>
                  {(draggableProvided) => (
                    <ListItem
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      component={Paper}
                      sx={{ mb: 1, cursor: disabled ? 'default' : 'grab' }}
                    >
                      <ListItemText primary={item.value} />
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || isLoading}
        >
          Valider l'ordre
        </Button>
        {showReset && (
          <Button variant="outlined" onClick={resetProgress} disabled={resetMutation.isPending}>
            Réinitialiser
          </Button>
        )}
      </Stack>

      {result && (
        <Alert severity={result.is_correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.feedback || (result.is_correct ? 'L’ordre est parfait !' : 'Réessaie en ajustant la séquence.')} 
        </Alert>
      )}
    </Box>
  );
};

export default OrderingAtom;
