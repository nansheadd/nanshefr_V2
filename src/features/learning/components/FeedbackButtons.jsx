import React, { useState, useEffect } from 'react';
import { IconButton, Box, Typography, CircularProgress } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';

const postFeedback = ({ contentType, contentId, rating }) => {
  return apiClient.post('/feedback/', {
    content_type: contentType,
    content_id: contentId,
    rating: rating,
  });
};

const FeedbackButtons = ({ contentType, contentId, initialVote = null, onSuccess = () => {} }) => {
  // --- LA CORRECTION EST ICI ---
  // 1. L'état local `vote` est initialisé avec la valeur de la prop `initialVote`
  const [vote, setVote] = useState(initialVote);
  const queryClient = useQueryClient();

  // 2. Un `useEffect` est CRUCIAL. Il met à jour l'état local si la prop change.
  //    Cela arrive car le composant s'affiche d'abord, PUIS les données de feedback arrivent de l'API.
  useEffect(() => {
    setVote(initialVote);
  }, [initialVote]);
  // -----------------------------

  const mutation = useMutation({
    mutationFn: postFeedback,
    onSuccess: (data, variables) => {
      // On met à jour l'état local pour un retour visuel immédiat
      setVote(variables.rating);
      onSuccess(); 
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi du feedback:", error);
    },
  });

  const handleFeedback = (rating) => {
    mutation.mutate({ contentType, contentId, rating });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, justifyContent: 'flex-end', minHeight: '34px' }}>
      {mutation.isPending ? (
        <CircularProgress size={20} />
      ) : (
        <>
          <Typography variant="caption" color="text.secondary">
            Ce contenu est-il utile ?
          </Typography>
          <IconButton 
            aria-label="like content"
            size="small" 
            onClick={() => handleFeedback('liked')}
            color={vote === 'liked' ? 'primary' : 'default'}
            disabled={mutation.isPending}
          >
            {vote === 'liked' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          </IconButton>
          <IconButton 
            aria-label="dislike content"
            size="small" 
            onClick={() => handleFeedback('disliked')}
            color={vote === 'disliked' ? 'error' : 'default'}
            disabled={mutation.isPending}
          >
            {vote === 'disliked' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default FeedbackButtons;