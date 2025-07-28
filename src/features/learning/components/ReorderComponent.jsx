// Fichier: src/features/learning/components/ReorderComponent.jsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText } from '@mui/material';
// (Tu devras aussi importer la logique de soumission comme dans QcmComponent)

const ReorderComponent = ({ component }) => {
  const [items, setItems] = useState(component.content_json.items);

  // La logique de drag-and-drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    setItems(reorderedItems);
  };

  // La logique de soumission (à compléter avec useMutation)
  const handleSubmit = () => {
    console.log("Ordre soumis :", items);
    // Ici, tu appelleras mutation.mutate avec { component_id, user_answer_json: { "ordered_items": items } }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{component.content_json.instruction}</Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="reorder-list">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      component={Paper}
                      sx={{ mb: 1 }}
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
      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>Valider</Button>
    </Box>
  );
};

export default ReorderComponent;