// Fichier: src/features/learning/components/QcmComponent.jsx (VERSION FINALE CORRIGÉE)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, RadioGroup, FormControlLabel, Radio, Alert, CircularProgress } from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const QcmComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  // --- BLOC DE CORRECTION ---
  // On rend le composant intelligent pour trouver les données, peu importe le nom de la clé.
  const question = content_json.prompt || content_json.question || "Question non trouvée.";
  const options = content_json.options || content_json.choices || [];
  // -------------------------

  const [selectedValue, setSelectedValue] = useState('');
  const [result, setResult] = useState(submittedAnswer);

  useEffect(() => {
    if (submittedAnswer) {
      const userAnswerIndex = submittedAnswer.user_answer_json?.selected_option;
      if (userAnswerIndex !== undefined && options[userAnswerIndex]) {
        const optionText = options[userAnswerIndex];
        setSelectedValue(typeof optionText === 'string' ? optionText : optionText.text);
      }
      setResult(submittedAnswer);
    }
  }, [submittedAnswer, options]);

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

  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleSubmit = () => {
    const selectedOptionIndex = options.findIndex(opt => {
        const optionText = typeof opt === 'string' ? opt : opt.text;
        return optionText === selectedValue;
    });
    mutation.mutate({
      component_id: component.id,
      user_answer_json: { "selected_option": selectedOptionIndex }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{question}</Typography>
      
      <RadioGroup value={selectedValue} onChange={handleRadioChange}>
        {/* On vérifie que `options` est bien un tableau avant de faire .map() */}
        {Array.isArray(options) && options.map((option, index) => {
          const optionLabel = typeof option === 'string' ? option : option.text;
          return (
            <FormControlLabel 
              key={index} 
              value={optionLabel} 
              control={<Radio />} 
              label={optionLabel} 
              disabled={!!result} 
            />
          )
        })}
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

export default QcmComponent;
