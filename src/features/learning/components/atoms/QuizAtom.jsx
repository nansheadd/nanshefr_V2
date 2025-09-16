import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Collapse,
  Alert,
  Stack,
  Chip,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Lightbulb as LightbulbIcon,
  RadioButtonUnchecked,
  RadioButtonChecked,
} from '@mui/icons-material';
import apiClient from '../../../../api/axiosConfig';

const QuizAtom = ({ atom }) => {
  const queryClient = useQueryClient();
  const [selectedValue, setSelectedValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [info, setInfo] = useState(null);

  if (!atom) {
    return (
      <Alert
        severity="error"
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)',
        }}
      >
        Erreur : L'atome n'a pas pu être chargé.
      </Alert>
    );
  }

  const { content, difficulty } = atom;
  const isLocked = atom.is_locked;
  const progressStatus = atom.progress_status || 'not_started';
  const completed = progressStatus === 'completed';
  const hasFailed = progressStatus === 'failed';

  if (!content || !content.question || !content.options) {
    return (
      <Alert
        severity="warning"
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(251, 191, 36, 0.15)',
        }}
      >
        Le contenu de cet exercice est invalide ou manquant.
      </Alert>
    );
  }

  const invalidateCaches = () => {
    queryClient.invalidateQueries({ queryKey: ['capsule'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['learningSession'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['atoms'], exact: false });
  };

  const logAnswerMutation = useMutation({
    mutationFn: (answerData) => apiClient.post('/progress/log-answer', answerData).then((res) => res.data),
    onSuccess: (data) => {
      invalidateCaches();
      if (data?.is_correct) {
        setInfo({ severity: 'success', message: 'Bonne réponse !' });
      }
    },
    onError: (err) => {
      setInfo({ severity: 'error', message: err?.response?.data?.detail || "Erreur lors de l'enregistrement de la réponse." });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => apiClient.post(`/progress/atom/${atom.id}/reset`).then((res) => res.data),
    onSuccess: () => {
      invalidateCaches();
      setSelectedValue('');
      setIsSubmitted(false);
      setIsCorrect(null);
      setInfo({ severity: 'info', message: 'Quiz réinitialisé. Vous pouvez réessayer.' });
    },
    onError: (err) => {
      setInfo({ severity: 'error', message: err?.response?.data?.detail || "Impossible de réinitialiser le quiz." });
    },
  });

  const { question, options, explanation } = content;
  const correctAnswer = options.find((opt) => opt.is_correct)?.text;

  const handleSubmit = () => {
    if (isLocked || completed || !selectedValue || logAnswerMutation.isLoading) {
      return;
    }
    setIsSubmitted(true);
    const correct = selectedValue === correctAnswer;
    setIsCorrect(correct);

    logAnswerMutation.mutate({
      atom_id: atom.id,
      is_correct: correct,
      answer: { selected: selectedValue },
    });
  };

  const handleReset = () => {
    if (isLocked) return;
    resetMutation.mutate();
  };

  const getDifficultyConfig = (level) => {
    const configs = {
      easy: { label: 'Facile', color: 'success', icon: '🌱' },
      medium: { label: 'Moyen', color: 'warning', icon: '🎯' },
      hard: { label: 'Difficile', color: 'error', icon: '🔥' },
    };
    return configs[level] || configs.medium;
  };

  const difficultyConfig = getDifficultyConfig(difficulty);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            fontSize: 100,
            opacity: 0.1,
            transform: 'rotate(-15deg)',
          }}
        >
          ?
        </Box>

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Question
              </Typography>
            </Box>
            {difficulty && (
              <Chip
                label={`${difficultyConfig.icon} ${difficultyConfig.label}`}
                size="small"
                color={difficultyConfig.color}
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.6,
            }}
          >
            {question}
          </Typography>
        </Stack>
      </Paper>

      {info && (
        <Alert severity={info.severity} sx={{ mb: 2 }} onClose={() => setInfo(null)}>
          {info.message}
        </Alert>
      )}

      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Terminez les questions précédentes pour débloquer ce quiz.
        </Alert>
      )}

      {completed && !isSubmitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Ce quiz a déjà été validé. Vous pouvez le refaire en cliquant sur « Réessayer ».
        </Alert>
      )}

      <FormControl component="fieldset" sx={{ width: '100%' }} disabled={isLocked || completed}>
        <RadioGroup
          name={`quiz-options-${atom.id}`}
          value={selectedValue}
          onChange={(e) => !isSubmitted && setSelectedValue(e.target.value)}
        >
          {options.map((option, index) => {
            const isSelected = selectedValue === option.text;
            const showResult = isSubmitted || completed;
            const isThisCorrect = option.is_correct;
            const isWrongSelection = showResult && isSelected && !isThisCorrect;
            const isCorrectAnswer = showResult && isThisCorrect;

            return (
              <Zoom
                in
                style={{ transitionDelay: `${index * 100}ms` }}
                key={index}
              >
                <Paper
                  elevation={hoveredOption === index && !isSubmitted && !completed && !isLocked ? 3 : 0}
                  onMouseEnter={() => !completed && !isLocked && setHoveredOption(index)}
                  onMouseLeave={() => setHoveredOption(null)}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid',
                    borderColor:
                      isCorrectAnswer
                        ? 'success.main'
                        : isWrongSelection
                        ? 'error.main'
                        : isSelected
                        ? 'primary.main'
                        : 'grey.200',
                    background:
                      isCorrectAnswer
                        ? 'linear-gradient(135deg, #d4f4dd 0%, #bbf0d1 100%)'
                        : isWrongSelection
                        ? 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)'
                        : isSelected
                        ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                        : hoveredOption === index && !completed && !isLocked
                        ? 'grey.50'
                        : 'white',
                    cursor: isSubmitted || completed || isLocked ? 'default' : 'pointer',
                    transform:
                      !isSubmitted && !completed && !isLocked && hoveredOption === index
                        ? 'translateX(8px)'
                        : isSelected && !isSubmitted && !completed
                        ? 'translateX(4px)'
                        : 'none',
                    opacity: showResult && !isSelected && !isThisCorrect ? 0.6 : 1,
                    '&:hover': {
                      borderColor: !isSubmitted && !completed && !isLocked ? 'primary.main' : undefined,
                    },
                  }}
                >
                  <FormControlLabel
                    value={option.text}
                    control={
                      <Radio
                        disabled={isSubmitted || completed || isLocked}
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<RadioButtonChecked />}
                        sx={{
                          color: isSubmitted || completed ? 'grey.400' : 'primary.main',
                          '&.Mui-checked': {
                            color: isCorrectAnswer
                              ? 'success.main'
                              : isWrongSelection
                              ? 'error.main'
                              : 'primary.main',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                        <Typography sx={{ fontWeight: isSelected ? 600 : 400 }}>{option.text}</Typography>
                        {showResult && isThisCorrect && (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        )}
                        {showResult && isWrongSelection && (
                          <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
                        )}
                      </Box>
                    }
                    sx={{ m: 0, width: '100%', px: 2, py: 1 }}
                  />
                </Paper>
              </Zoom>
            );
          })}
        </RadioGroup>
      </FormControl>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLocked || completed || !selectedValue || logAnswerMutation.isLoading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4292 100%)',
            },
          }}
        >
          {completed ? 'Déjà validé' : 'Valider ma réponse'}
        </Button>
        {(isSubmitted || completed || hasFailed) && (
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={resetMutation.isLoading || isLocked}
            startIcon={<SchoolIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            Réessayer
          </Button>
        )}
        {isCorrect && (
          <Chip icon={<TrophyIcon />} label="Excellente réponse !" color="success" sx={{ fontWeight: 600 }} />
        )}
      </Box>

      <Collapse in={isSubmitted}>
        <Fade in={isSubmitted}>
          <Alert
            severity={isCorrect ? 'success' : 'error'}
            icon={isCorrect ? <CheckCircleIcon /> : <LightbulbIcon />}
            sx={{
              mt: 3,
              borderRadius: 3,
              boxShadow: isCorrect ? '0 4px 20px rgba(76, 175, 80, 0.15)' : '0 4px 20px rgba(239, 68, 68, 0.15)',
              '& .MuiAlert-icon': {
                fontSize: 28,
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {isCorrect ? '🎉 Bravo !' : '💡 Pas tout à fait...'}
            </Typography>
            <Typography variant="body2">
              {isCorrect
                ? 'Vous avez trouvé la bonne réponse !'
                : `La bonne réponse était : "${correctAnswer}"`}
            </Typography>
            {explanation && (
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'primary.lighter',
                  border: '1px solid',
                  borderColor: 'primary.light',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Explication
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {explanation}
                </Typography>
              </Paper>
            )}
          </Alert>
        </Fade>
      </Collapse>
    </Box>
  );
};

export default QuizAtom;
