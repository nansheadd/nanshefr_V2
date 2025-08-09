// Fichier: src/features/learning/components/EssayComponent.jsx (FINAL)
import React, { useState, useEffect } from 'react';
// ... (imports)
import { Box, Typography, Button, TextField, Alert, CircularProgress, Paper } from '@mui/material';

// ... (submitAnswer)

const EssayComponent = ({ component, submittedAnswer }) => {
  // ... (hooks: queryClient, etc.)
  
  const [essayText, setEssayText] = useState(submittedAnswer?.user_answer_json?.text || '');
  const [result, setResult] = useState(submittedAnswer);

  // ... (useEffect pour restaurer la réponse)

  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      // Le statut est maintenant un objet plus riche
      setResult({ status: data.status, ai_feedback: null }); // On met à jour l'état local immédiatement
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
  });

  const renderFeedback = () => {
    if (!result) return null;

    // Cas 1 : La correction par l'IA est terminée
    if (result.status === 'correct' || result.status === 'incorrect') {
      const feedback = result.ai_feedback;
      return (
        <Alert severity={result.status === 'correct' ? 'success' : 'error'} sx={{ mt: 2 }}>
          <Typography variant="h6">Retour de l'IA ({feedback?.grade})</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{feedback?.evaluation}</Typography>
          {/* Affichez les points forts/faibles ici si vous le souhaitez */}
        </Alert>
      );
    }
    // Cas 2 : En attente de l'analyse
    if (result.status === 'pending_review') {
      return (
        <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mt: 2 }}>
          Votre réponse est en cours d'analyse par l'IA. Le retour apparaîtra ici bientôt.
        </Alert>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* ... (Titre, consignes, TextField) ... */}
      <Button 
        variant="contained" 
        onClick={() => mutation.mutate({ component_id: component.id, user_answer_json: { "text": essayText } })}
        disabled={!essayText || mutation.isPending || !!result}
      >
        {mutation.isPending ? <CircularProgress size={24} /> : "Soumettre l'essai"}
      </Button>

      {renderFeedback()}
    </Box>
  );
};

export default EssayComponent;