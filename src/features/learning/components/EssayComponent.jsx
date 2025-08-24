// Fichier: src/features/learning/components/EssayComponent.jsx (FINAL)

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
    Paper 
} from '@mui/material';

// Fonction partagée pour soumettre une réponse à l'API
const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const EssayComponent = ({ component, submittedAnswer }) => {
  // queryClient est utilisé pour invalider les données et forcer un rechargement
  const queryClient = useQueryClient();
  
  // State pour stocker le texte de l'utilisateur
  const [essayText, setEssayText] = useState('');
  // State pour stocker le résultat de la soumission (feedback, statut)
  const [result, setResult] = useState(null);

  // useEffect se déclenche quand le composant se charge ou que `submittedAnswer` change
  // Il permet de restaurer l'état si l'utilisateur a déjà répondu.
  useEffect(() => {
    if (submittedAnswer) {
      setEssayText(submittedAnswer.user_answer_json?.text || '');
      setResult(submittedAnswer);
    }
  }, [submittedAnswer]);

  // useMutation gère l'appel à l'API pour nous (états de chargement, erreur, succès)
  const mutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      // Quand l'API répond avec succès, on met à jour notre état local
      setResult(data);
      // On dit à l'application de rafraîchir les données du chapitre pour refléter la nouvelle réponse
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
      // On pourrait aussi invalider les données du nœud si nécessaire
      queryClient.invalidateQueries({ queryKey: ['knowledgeNode', component.node_id] });
    },
  });

  // Fonction pour afficher le feedback de l'IA
  const renderFeedback = () => {
    if (!result) return null;

    // Cas 1 : La correction par l'IA est terminée et validée
    if (result.status === 'correct') {
      const feedback = result.ai_feedback;
      return (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="h6">Retour de l'IA ({feedback?.grade || "Validé"})</Typography>
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{feedback?.evaluation}</Typography>
        </Alert>
      );
    }
    // Cas 2 : La correction par l'IA est terminée mais incorrecte
     if (result.status === 'incorrect') {
      const feedback = result.ai_feedback;
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6">Retour de l'IA ({feedback?.grade || "Points à revoir"})</Typography>
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{feedback?.evaluation}</Typography>
        </Alert>
      );
    }
    // Cas 3 : En attente de l'analyse par l'IA
    if (result.status === 'pending_review') {
      return (
        <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mt: 2 }}>
          Votre réponse est en cours d'analyse par notre IA. Le retour apparaîtra ici d'ici quelques instants.
        </Alert>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
        {component.content_json?.prompt}
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={8}
        variant="outlined"
        value={essayText}
        onChange={(e) => setEssayText(e.target.value)}
        disabled={mutation.isPending || !!result} // Désactivé pendant le chargement ou si déjà répondu
        placeholder="Rédigez votre essai ici..."
      />

      <Button 
        variant="contained" 
        sx={{ mt: 2 }}
        onClick={() => mutation.mutate({ 
            component_id: component.id, 
            user_answer_json: { "text": essayText } 
        })}
        disabled={!essayText || mutation.isPending || !!result}
      >
        {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : "Soumettre l'essai"}
      </Button>

      {renderFeedback()}
    </Box>
  );
};

export default EssayComponent;
