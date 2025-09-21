import React, { useState, useEffect, useMemo } from 'react';
import {
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Collapse,
  Stack,
  Chip,
  TextField,
  Button,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';

// --- Définition des appels API ---
const postFeedback = ({ contentType, contentId, rating, reasonCode, comment }) => {
  return apiClient.post('/feedback/', {
    content_type: contentType,
    content_id: contentId,
    rating: rating,
    reason_code: reasonCode,
    comment,
  });
};

const forceCompleteComponent = (componentId) => {
  // On s'assure de ne pas appeler sur un ID invalide
  if (!componentId) return Promise.resolve();
  return apiClient.post(`/progress/component/${componentId}/force-complete`);
};


const DEFAULT_REASON_OPTIONS = {
  atom: [
    { value: 'incorrect', label: 'Contenu incorrect' },
    { value: 'unclear', label: 'Explications confuses' },
    { value: 'too_hard', label: 'Trop difficile' },
    { value: 'too_easy', label: 'Trop facile' },
    { value: 'technical_issue', label: 'Problème technique' },
    { value: 'other', label: 'Autre' },
  ],
  molecule: [
    { value: 'not_relevant', label: 'Pas pertinent' },
    { value: 'missing_prerequisites', label: 'Manque de prérequis' },
    { value: 'too_long', label: 'Trop long' },
    { value: 'too_complex', label: 'Trop complexe' },
    { value: 'other', label: 'Autre' },
  ],
  default: [
    { value: 'not_useful', label: 'Cette ressource ne m’aide pas' },
    { value: 'incorrect', label: 'Contenu incorrect' },
    { value: 'too_difficult', label: 'Trop difficile' },
    { value: 'too_easy', label: 'Trop facile' },
    { value: 'other', label: 'Autre' },
  ],
};

const FeedbackButtons = ({
  contentType,
  contentId,
  initialRating = null,
  initialReason = null,
  initialComment = null,
  reasonOptions,
  onSuccess = () => {},
}) => {
  const [vote, setVote] = useState(initialRating);
  const [showReasonForm, setShowReasonForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState(initialReason || '');
  const [commentInput, setCommentInput] = useState(initialComment || '');
  const [errorMessage, setErrorMessage] = useState(null);
  const queryClient = useQueryClient();

  // Met à jour l'état local si la prop (venant de l'API) change
  useEffect(() => {
    setVote(initialRating);
    setSelectedReason(initialReason || '');
    setCommentInput(initialComment || '');
  }, [initialRating, initialReason, initialComment]);

  const options = useMemo(() => {
    if (Array.isArray(reasonOptions) && reasonOptions.length > 0) {
      return reasonOptions;
    }
    return DEFAULT_REASON_OPTIONS[contentType] || DEFAULT_REASON_OPTIONS.default;
  }, [contentType, reasonOptions]);

  // Mutation pour envoyer le feedback (like/dislike)
  const feedbackMutation = useMutation({
    mutationFn: postFeedback,
    onSuccess: (data, variables) => {
      const nextRating = data?.rating ?? null;
      setVote(nextRating);
      setErrorMessage(null);
      if (nextRating === 'disliked') {
        setSelectedReason(data?.reason_code || variables.reasonCode || '');
        setCommentInput(data?.comment || variables.comment || '');
      } else {
        setSelectedReason('');
        setCommentInput(data?.comment || '');
      }
      setShowReasonForm(false);
      onSuccess(data);
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi du feedback:", error);
      const detail = error?.response?.data?.detail;
      if (detail === 'reason_required') {
        setErrorMessage('Merci de préciser la raison et un commentaire.');
        setShowReasonForm(true);
      }
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

  const handleLikeClick = (event) => {
    event.stopPropagation();
    const newRating = vote === 'liked' ? 'none' : 'liked';
    feedbackMutation.mutate({ contentType, contentId, rating: newRating });
  };

  const handleDislikeClick = (event) => {
    event.stopPropagation();
    if (vote === 'disliked' && !showReasonForm) {
      feedbackMutation.mutate({ contentType, contentId, rating: 'none' });
      return;
    }
    setErrorMessage(null);
    setShowReasonForm((prev) => !prev);
    if (!showReasonForm) {
      setSelectedReason(initialReason || selectedReason || '');
      setCommentInput(initialComment || commentInput || '');
    }
  };

  const handleSubmitDislike = () => {
    if (!selectedReason || !commentInput.trim()) {
      setErrorMessage('Merci de choisir une raison et d’expliquer brièvement.');
      return;
    }
    feedbackMutation.mutate({
      contentType,
      contentId,
      rating: 'disliked',
      reasonCode: selectedReason,
      comment: commentInput.trim(),
    });

    if (contentType === 'knowledge_component') {
      forceCompleteMutation.mutate();
    }
  };

  const handleCancelDislike = () => {
    setShowReasonForm(false);
    setErrorMessage(null);
    if (vote !== 'disliked') {
      setSelectedReason(initialReason || '');
      setCommentInput(initialComment || '');
    }
  };

  const isPending = feedbackMutation.isPending || forceCompleteMutation.isPending;
  const disableDislikeSubmit = isPending || !selectedReason || commentInput.trim().length < 4;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, mt: 1, minHeight: showReasonForm ? 'auto' : '34px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {isPending ? (
        <CircularProgress size={20} />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Ce contenu est-il utile ?
          </Typography>
          <IconButton
            aria-label="like content"
            size="small"
            onClick={handleLikeClick}
            color={vote === 'liked' ? 'primary' : 'default'}
            disabled={isPending}
          >
            {vote === 'liked' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          </IconButton>
          <IconButton
            aria-label="dislike content"
            size="small"
            onClick={handleDislikeClick}
            color={vote === 'disliked' ? 'error' : 'default'}
            disabled={isPending}
          >
            {vote === 'disliked' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
          </IconButton>
        </Box>
      )}
      <Collapse in={showReasonForm} unmountOnExit>
        <PaperReasonForm
          options={options}
          selectedReason={selectedReason}
          onSelectReason={setSelectedReason}
          comment={commentInput}
          onChangeComment={setCommentInput}
          onSubmit={handleSubmitDislike}
          onCancel={handleCancelDislike}
          errorMessage={errorMessage}
          disabled={disableDislikeSubmit}
        />
      </Collapse>
    </Box>
  );
};

export default FeedbackButtons;

const PaperReasonForm = ({ options, selectedReason, onSelectReason, comment, onChangeComment, onSubmit, onCancel, errorMessage, disabled }) => (
  <Box sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, minWidth: 260, bgcolor: 'background.paper' }}>
    <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
      Que devrions-nous améliorer ?
    </Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          color={selectedReason === opt.value ? 'error' : 'default'}
          variant={selectedReason === opt.value ? 'filled' : 'outlined'}
          size="small"
          onClick={() => onSelectReason(opt.value)}
        />
      ))}
    </Stack>
    <TextField
      value={comment}
      onChange={(event) => onChangeComment(event.target.value)}
      label="Explique rapidement"
      fullWidth
      multiline
      minRows={2}
      size="small"
      placeholder="Décris ce qui t'a posé problème"
      sx={{ mb: 1 }}
    />
    {errorMessage && (
      <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
        {errorMessage}
      </Typography>
    )}
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Button size="small" onClick={onCancel}>
        Annuler
      </Button>
      <Button size="small" variant="contained" color="error" onClick={onSubmit} disabled={disabled}>
        Envoyer
      </Button>
    </Stack>
  </Box>
);
