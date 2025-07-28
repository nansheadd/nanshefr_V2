// Fichier: src/features/learning/components/QcmComponent.jsx (CORRIGÉ)
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Alert, CircularProgress } from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const QcmComponent = ({ component }) => {
  const [selectedValue, setSelectedValue] = useState('');
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

  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleSubmit = () => {
    const selectedOptionIndex = component.content_json.options.indexOf(selectedValue);
    mutation.mutate({
      component_id: component.id,
      user_answer_json: { "selected_option": selectedOptionIndex }
    });
  };

  const { question, options } = component.content_json;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{question}</Typography>
      <RadioGroup value={selectedValue} onChange={handleRadioChange}>
        {options.map((option, index) => (
          <FormControlLabel key={index} value={option} control={<Radio />} label={option} disabled={!!result} />
        ))}
      </RadioGroup>
      <Button 
        variant="contained" 
        onClick={handleSubmit} 
        sx={{ mt: 2 }} 
        disabled={!selectedValue || mutation.isPending || !!result}
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

export default QcmComponent; // <-- LA CORRECTION EST ICI