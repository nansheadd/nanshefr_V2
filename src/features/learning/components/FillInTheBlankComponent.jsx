// Fichier: src/features/learning/components/FillInTheBlankComponent.jsx (VERSION AMÉLIORÉE)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
    Box, 
    Typography, 
    Button, 
    TextField, 
    Alert, 
    CircularProgress, 
    Stack, 
    RadioGroup, 
    FormControlLabel, 
    Radio 
} from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const FillInTheBlankComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  // Détermine si l'exercice est un QCM déguisé ou un vrai texte à trous
  const hasChoices = Array.isArray(content_json.choices) && content_json.choices.length > 0;
  
  // Adapte la logique pour trouver le nombre de trous
  const answerOrAnswers = content_json.answer || content_json.correct_answer || content_json.answers || [];
  const numberOfBlanks = hasChoices ? 1 : (Array.isArray(answerOrAnswers) ? answerOrAnswers.length : (answerOrAnswers ? 1 : 0));

  // États pour les deux modes d'affichage
  const [userAnswers, setUserAnswers] = useState(Array(numberOfBlanks).fill(''));
  const [selectedValue, setSelectedValue] = useState('');
  const [result, setResult] = useState(submittedAnswer);

  // Restaure la réponse de l'utilisateur au chargement
  useEffect(() => {
    if (submittedAnswer) {
      const savedAnswers = submittedAnswer.user_answer_json?.filled_blanks || [];
      if (hasChoices) {
        setSelectedValue(savedAnswers[0] || '');
      } else {
        setUserAnswers(savedAnswers.length ? savedAnswers : Array(numberOfBlanks).fill(''));
      }
      setResult(submittedAnswer);
    }
  }, [submittedAnswer, hasChoices, numberOfBlanks]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
    onError: (error) => {
      setResult({ is_correct: false, feedback: error.message || "Une erreur est survenue." });
    }
  });

  const handleInputChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // Prépare le payload en fonction du type d'exercice affiché
    const answerPayload = hasChoices 
      ? { "filled_blanks": [selectedValue] } 
      : { "filled_blanks": userAnswers };
      
    mutation.mutate({
      component_id: component.id,
      user_answer_json: answerPayload
    });
  };

  const textToDisplay = content_json.prompt || content_json.sentence || content_json.text_with_blanks || '';

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
        {textToDisplay.replace(/_{3,}/g, '______')}
      </Typography>
      
      {hasChoices ? (
        // Affiche des boutons radio si des choix sont disponibles
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
      ) : (
        // Affiche des champs de texte sinon
        <Stack spacing={2} sx={{ my: 2 }}>
          {Array.from({ length: numberOfBlanks }).map((_, index) => (
            <TextField
              key={index}
              label={`Réponse ${index + 1}`}
              variant="outlined"
              value={userAnswers[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              disabled={!!result}
            />
          ))}
        </Stack>
      )}
      
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
