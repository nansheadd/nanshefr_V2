// Fichier: src/features/learning/components/FillInTheBlankComponent.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, TextField, Alert, CircularProgress, Stack } from '@mui/material';

// La fonction qui envoie la réponse au backend (elle est générique)
const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const FillInTheBlankComponent = ({ component }) => {
  // On initialise un tableau pour stocker les réponses de l'utilisateur
  const [userAnswers, setUserAnswers] = useState(Array(component.content_json.answers.length).fill(''));
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      setResult({ is_correct: false, feedback: error.message });
    }
  });

  // Gère le changement dans un des champs de texte
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

  const { text_with_blanks, answers } = component.content_json;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
        {text_with_blanks}
      </Typography>
      <Stack spacing={2} sx={{ my: 2 }}>
        {answers.map((_, index) => (
          <TextField
            key={index}
            label={`Mot manquant ${index + 1}`}
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