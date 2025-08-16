// Fichier: src/features/learning/components/FillInTheBlankComponent.jsx (VERSION FINALE COMPLÈTE)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, TextField, Alert, CircularProgress, Stack } from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const FillInTheBlankComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  // On rend le composant intelligent pour trouver les données dont il a besoin.
  const textToDisplay =
    content_json.prompt || content_json.sentence || content_json.text_with_blanks || '';
  const answerOrAnswers = content_json.answer || content_json.correct_answer || content_json.answers || [];
  const numberOfBlanks = Array.isArray(answerOrAnswers) ? answerOrAnswers.length : (answerOrAnswers ? 1 : 0);

  const [userAnswers, setUserAnswers] = useState(Array(numberOfBlanks).fill(''));
  const [result, setResult] = useState(submittedAnswer);

  // Gère la restauration de la réponse et du feedback au chargement
  useEffect(() => {
    if (submittedAnswer) {
      setUserAnswers(submittedAnswer.user_answer_json?.filled_blanks || Array(numberOfBlanks).fill(''));
      setResult(submittedAnswer);
    }
  }, [submittedAnswer, numberOfBlanks]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
    onError: (error) => {
      setResult({ is_correct: false, feedback: error.message });
    }
  });

  const handleInputChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    mutation.mutate({
      component_id: component.id,
      user_answer_json: { "filled_blanks": userAnswers }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
        {textToDisplay.replace(/_{3,}/g, '______').replace(/\[BLANK\]/g, '______')}
      </Typography>
      
      <Stack spacing={2} sx={{ my: 2 }}>
        {numberOfBlanks > 0 && Array.from({ length: numberOfBlanks }).map((_, index) => (
          <TextField
            key={index}
            label={`Réponse ${index + 1}`}
            variant="outlined"
            value={userAnswers[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
            disabled={!!result}
          />
        ))}
      </Stack>
      
      <Button 
        variant="contained" 
        onClick={handleSubmit} 
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

export default FillInTheBlankComponent;
