// Fichier: src/features/learning/components/QuizComponent.jsx (CORRIGÉ ET FONCTIONNEL)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Stack, Alert, CircularProgress } from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const QuizComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();
  
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(submittedAnswer);

  useEffect(() => {
    if (submittedAnswer) {
      setAnswers(submittedAnswer.user_answer_json?.answers || {});
      setResult(submittedAnswer);
    }
  }, [submittedAnswer]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
  });

  const handleInputChange = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };
  
  const renderQuestion = (question, index) => {
    const questionType = question.options ? 'choix multiple' : 'réponse courte';

    switch (questionType) {
      case 'choix multiple':
        return (
          <FormControl component="fieldset" key={index} sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">{index + 1}. {question.question}</FormLabel>
            <RadioGroup
              value={answers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              disabled={!!result}
            >
              {question.options.map((opt, i) => (
                <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
          </FormControl>
        );
      // Ajoutez d'autres types de questions ici si nécessaire
      default:
        return <Typography key={index} color="error">Type de question non supporté.</Typography>;
    }
  };

  const handleSubmit = () => {
    mutation.mutate({
      component_id: component.id,
      user_answer_json: { "answers": answers }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{content_json.title || component.title}</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {Array.isArray(content_json.questions) ? (
          content_json.questions.map(renderQuestion)
        ) : (
          <Typography color="error">Format du quiz invalide.</Typography>
        )}
      </Stack>
      <Button 
        variant="contained" 
        sx={{ mt: 2 }} 
        onClick={handleSubmit} 
        disabled={mutation.isPending || !!result}
      >
        {mutation.isPending ? <CircularProgress size={24} /> : 'Valider le Quiz'}
      </Button>
      {result && (
        <Alert severity={result.is_correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.feedback}
        </Alert>
      )}
    </Box>
  );
};

export default QuizComponent;