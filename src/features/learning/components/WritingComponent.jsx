// Fichier: src/features/learning/components/WritingComponent.jsx (Nouveau composant)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material';

// La fonction submitAnswer peut être partagée entre les composants d'exercice
const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const WritingComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  const [userText, setUserText] = useState('');
  const [result, setResult] = useState(submittedAnswer);

  useEffect(() => {
    if (submittedAnswer) {
      setUserText(submittedAnswer.user_answer_json?.text || '');
      setResult(submittedAnswer);
    }
  }, [submittedAnswer]);

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
  });

  const handleSubmit = () => {
    // Pour un exercice de rédaction, on ne peut pas auto-corriger.
    // On considère la réponse comme "correcte" pour la progression,
    // mais on pourrait imaginer une correction par l'IA plus tard.
    mutation.mutate({
      component_id: component.id,
      user_answer_json: { "text": userText, "auto_corrected": false }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{content_json.prompt || "Veuillez répondre à la question suivante :"}</Typography>
      
      <TextField
        fullWidth
        multiline
        rows={6}
        variant="outlined"
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        disabled={!!result}
        placeholder="Rédigez votre réponse ici..."
        sx={{ my: 2 }}
      />
      
      <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending || !!result}>
        {mutation.isPending ? <CircularProgress size={24} /> : 'Valider'}
      </Button>

      {result && (
        <Alert severity={result.is_correct ? 'success' : 'info'} sx={{ mt: 2 }}>
          {result.feedback || "Votre réponse a été enregistrée."}
        </Alert>
      )}
    </Box>
  );
};

export default WritingComponent;