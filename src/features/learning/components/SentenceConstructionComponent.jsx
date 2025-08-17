// Fichier: nanshe/frontend/src/features/learning/components/SentenceConstructionComponent.jsx (VERSION COMPLÈTE)
import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import apiClient from '../../../api/axiosConfig';
import { 
    Box, 
    Typography, 
    Button, 
    Paper, 
    Alert, 
    CircularProgress,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const SentenceConstructionComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  // Détermine le type d'exercice en fonction des données JSON
  const exerciseType = useMemo(() => {
    if (Array.isArray(content_json.choices) && content_json.choices.length > 0) {
      return 'qcm';
    }
    if (Array.isArray(content_json.scrambled) || Array.isArray(content_json.elements)) {
      return 'drag-drop';
    }
    return 'unsupported';
  }, [content_json]);

  // États pour les deux modes
  const [words, setWords] = useState(content_json.scrambled || content_json.elements || []);
  const [selectedValue, setSelectedValue] = useState('');
  
  const [result, setResult] = useState(submittedAnswer);

  // Restaure la réponse de l'utilisateur au chargement
  useEffect(() => {
    if (submittedAnswer) {
      if (exerciseType === 'qcm') {
        const savedIndex = submittedAnswer.user_answer_json?.selected_option;
        if (typeof savedIndex === 'number' && content_json.choices[savedIndex]) {
            setSelectedValue(content_json.choices[savedIndex]);
        }
      } else if (exerciseType === 'drag-drop') {
        setWords(submittedAnswer.user_answer_json?.ordered_items || words);
      }
      setResult(submittedAnswer);
    }
  }, [submittedAnswer, exerciseType, content_json.choices, words]);

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
    let userAnswerJson;
    if (exerciseType === 'qcm') {
      const selectedIndex = content_json.choices.indexOf(selectedValue);
      userAnswerJson = { "selected_option": selectedIndex };
    } else {
      userAnswerJson = { "ordered_items": words };
    }
    mutation.mutate({ component_id: component.id, user_answer_json: userAnswerJson });
  };

  const renderExercise = () => {
    switch (exerciseType) {
      case 'qcm':
        return (
          <RadioGroup value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} sx={{ my: 2 }}>
            {content_json.choices.map((choice, index) => (
              <FormControlLabel 
                key={index} 
                value={choice} 
                control={<Radio />} 
                label={choice} 
                disabled={!!result} 
              />
            ))}
          </RadioGroup>
        );

      case 'drag-drop':
        return (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`sentence-${component.id}`} direction="horizontal">
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ mt: 3, p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '60px', backgroundColor: '#f5f5f5' }}
                >
                  {words.map((word, index) => (
                    <Draggable key={`${word}-${index}`} draggableId={`${word}-${index}`} index={index} isDragDisabled={!!result}>
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          elevation={3}
                          sx={{ p: '8px 16px', cursor: result ? 'default' : 'grab', backgroundColor: 'primary.light', color: 'primary.contrastText' }}
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
        );

      default:
        return <Alert severity="warning" sx={{ mt: 2 }}>Le format de cet exercice de construction de phrase n'est pas supporté.</Alert>;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {content_json.prompt || content_json.instruction}
      </Typography>
      
      {renderExercise()}

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
