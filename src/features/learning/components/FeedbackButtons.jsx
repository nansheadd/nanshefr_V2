import React, { useState, useEffect } from 'react';
import { IconButton, Box, Typography, CircularProgress } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';

// --- Définition des appels API ---
const postFeedback = ({ contentType, contentId, rating }) => {
  return apiClient.post('/feedback/', {
    content_type: contentType,
    content_id: contentId,
    rating: rating,
  });
};

const forceCompleteComponent = (componentId) => {
  // On s'assure de ne pas appeler sur un ID invalide
  if (!componentId) return Promise.resolve();
  return apiClient.post(`/progress/component/${componentId}/force-complete`);
};


const FeedbackButtons = ({ contentType, contentId, initialVote = null, onSuccess = () => {} }) => {
  const [vote, setVote] = useState(initialVote);
  const queryClient = useQueryClient();

  // Met à jour l'état local si la prop (venant de l'API) change
  useEffect(() => {
    setVote(initialVote);
  }, [initialVote]);

  // Mutation pour envoyer le feedback (like/dislike)
  const feedbackMutation = useMutation({
    mutationFn: postFeedback,
    onSuccess: (data, variables) => {
      setVote(variables.rating); // Met à jour l'UI instantanément
      onSuccess(variables.rating);
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi du feedback:", error);
    },
  });

  // Mutation pour forcer la complétion de l'exercice
  const forceCompleteMutation = useMutation({
    mutationFn: () => forceCompleteComponent(contentId),
    onSuccess: () => {
      // Rafraîchit toutes les données potentiellement impactées
      queryClient.invalidateQueries({ queryKey: ['chapter'] });
      queryClient.invalidateQueries({ queryKey: ['node'] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeGraph'] });
    },
    onError: (error) => {
        console.error("Erreur lors de la complétion forcée:", error);
    }
  });

  const handleVote = (rating) => {
    // Si l'utilisateur clique sur le même bouton, on annule le vote (optionnel)
    const newRating = vote === rating ? null : rating;
    
    feedbackMutation.mutate({ contentType, contentId, rating: newRating });

    // Si le vote est un "dislike" et que c'est un exercice, on le valide pour débloquer l'utilisateur
    if (newRating === 'disliked' && contentType === 'knowledge_component') {
      forceCompleteMutation.mutate();
    }
  };

  const isPending = feedbackMutation.isPending || forceCompleteMutation.isPending;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, justifyContent: 'flex-end', minHeight: '34px' }}>
      {isPending ? (
        <CircularProgress size={20} />
      ) : (
        <>
          <Typography variant="caption" color="text.secondary">
            Ce contenu est-il utile ?
          </Typography>
          <IconButton
            aria-label="like content"
            size="small"
            onClick={() => handleVote('liked')}
            color={vote === 'liked' ? 'primary' : 'default'}
            disabled={isPending}
          >
            {vote === 'liked' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          </IconButton>
          <IconButton
            aria-label="dislike content"
            size="small"
            onClick={() => handleVote('disliked')}
            color={vote === 'disliked' ? 'error' : 'default'}
            disabled={isPending}
          >
            {vote === 'disliked' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default FeedbackButtons;