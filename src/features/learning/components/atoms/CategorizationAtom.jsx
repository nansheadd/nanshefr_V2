import React, { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const shuffle = (array) => {
  const items = [...array];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const CategorizationAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const prompt = content.prompt || content.instruction || atom?.title;
  const categories = useMemo(() => {
    if (Array.isArray(content.categories)) return content.categories;
    if (Array.isArray(content.category_labels)) {
      return content.category_labels.map((label, idx) => ({ id: String(idx), label }));
    }
    return [];
  }, [content.categories, content.category_labels]);

  const items = useMemo(() => {
    if (Array.isArray(content.items)) return content.items;
    if (Array.isArray(content.entries)) return content.entries;
    return [];
  }, [content.items, content.entries]);

  const buildBoard = useCallback(() => {
    const poolItems = shuffle(items.map((item, index) => ({
      id: item.id || `${index}`,
      label: item.label || item.text || item.term,
      category: item.category || item.correct_category,
    })));
    const boardState = {
      pool: poolItems,
    };
    categories.forEach((category, idx) => {
      const categoryId = category.id || category.name || category.label || `${idx}`;
      boardState[categoryId] = [];
    });
    return boardState;
  }, [items, categories]);

  const [board, setBoard] = useState(() => buildBoard());
  const [result, setResult] = useState(null);

  const categoryIds = categories.map((category, index) => category.id || category.name || category.label || `${index}`);

  const { submitAnswer, resetProgress, logAnswerMutation, resetMutation, isLoading } = useAtomAnswer({
    atom,
    onReward,
    onResult: (data) => setResult(data),
    onReset: () => {
      setBoard(buildBoard());
      setResult(null);
    },
  });

  const completed = atom?.progress_status === 'completed';
  const showReset = completed || Boolean(result?.is_correct);
  const disabled = showReset;

  const moveItem = (sourceId, destinationId, sourceIndex, destinationIndex) => {
    const sourceList = Array.from(board[sourceId]);
    const [moved] = sourceList.splice(sourceIndex, 1);
    const destList = Array.from(board[destinationId] || []);
    destList.splice(destinationIndex, 0, moved);

    setBoard((prev) => ({
      ...prev,
      [sourceId]: sourceList,
      [destinationId]: destList,
    }));
  };

  const onDragEnd = (event) => {
    const { source, destination } = event;
    if (!destination || disabled || isLoading) return;

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;
    if (sourceId === destinationId && source.index === destination.index) return;

    moveItem(sourceId, destinationId, source.index, destination.index);
  };

  const handleSubmit = () => {
    if (logAnswerMutation.isPending) return;
    const answers = {};
    let allCorrect = true;

    categoryIds.forEach((categoryId) => {
      const cards = board[categoryId] || [];
      answers[categoryId] = cards.map((card) => card.id);
      cards.forEach((card) => {
        if (card.category && card.category !== categoryId) {
          allCorrect = false;
        }
      });
    });

    if ((board.pool || []).length > 0) {
      allCorrect = false;
    }

    submitAnswer(allCorrect, { categorization: answers });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {prompt}
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap' }}>
          <Droppable droppableId="pool">
            {(provided) => (
              <Paper ref={provided.innerRef} {...provided.droppableProps} sx={{ p: 2, minWidth: 220, minHeight: 180 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  À classer
                </Typography>
                {board.pool.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={disabled}>
                    {(draggableProvided) => (
                      <Paper
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        sx={{ p: 1, mb: 1, cursor: disabled ? 'default' : 'grab' }}
                      >
                        {item.label}
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Paper>
            )}
          </Droppable>

          {categories.map((category, index) => {
            const categoryId = category.id || category.name || category.label || `${index}`;
            return (
              <Droppable key={categoryId} droppableId={categoryId}>
                {(provided) => (
                  <Paper ref={provided.innerRef} {...provided.droppableProps} sx={{ p: 2, minWidth: 220, minHeight: 180 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {category.label || category.name || category.title || `Catégorie ${index + 1}`}
                    </Typography>
                    {(board[categoryId] || []).map((item, itemIndex) => (
                      <Draggable key={item.id} draggableId={item.id} index={itemIndex} isDragDisabled={disabled}>
                        {(draggableProvided) => (
                          <Paper
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            sx={{ p: 1, mb: 1, cursor: disabled ? 'default' : 'grab' }}
                          >
                            {item.label}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            );
          })}
        </Stack>
      </DragDropContext>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || isLoading}
        >
          Valider la catégorisation
        </Button>
        {showReset && (
          <Button variant="outlined" onClick={resetProgress} disabled={resetMutation.isPending}>
            Réinitialiser
          </Button>
        )}
      </Stack>

      {result && (
        <Alert severity={result.is_correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.feedback || (result.is_correct ? 'Classification réussie !' : 'Certaines associations sont à revoir.')} 
        </Alert>
      )}
    </Box>
  );
};

export default CategorizationAtom;
