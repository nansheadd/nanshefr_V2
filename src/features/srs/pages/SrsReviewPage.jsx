import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useI18n } from '../../../i18n/I18nContext';
import { fetchSrsSummary, startSrsSession, submitSrsReview } from '../api/srsApi';

const ratingOptions = (t) => [
  { value: 'again', label: t('srs.page.ratings.again', 'Revoir'), color: 'error', icon: RefreshIcon },
  { value: 'hard', label: t('srs.page.ratings.hard', 'Difficile'), color: 'warning', icon: TaskAltIcon },
  { value: 'good', label: t('srs.page.ratings.good', 'Bien'), color: 'primary', icon: CheckCircleIcon },
  { value: 'easy', label: t('srs.page.ratings.easy', 'Facile'), color: 'success', icon: LightModeIcon },
];

const formatDateTime = (value, language) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language || 'fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
};

const SrsReviewPage = () => {
  const { t, language } = useI18n();
  const queryClient = useQueryClient();

  const [sessionId, setSessionId] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  const { data: summary } = useQuery({
    queryKey: ['srs', 'summary'],
    queryFn: fetchSrsSummary,
    staleTime: 60_000,
  });

  const { mutate: initializeSession, isPending: isStarting, error: startError } = useMutation({
    mutationFn: () => startSrsSession(),
    onSuccess: (payload) => {
      setSessionId(payload.sessionId ?? null);
      setCurrentItem(payload.item ?? null);
      setQueueCount(payload.remaining ?? payload.queue?.length ?? 0);
      setRevealed(false);
      queryClient.invalidateQueries({ queryKey: ['srs', 'summary'] });
    },
  });

  const { mutate: submitReview, isPending: isSubmitting, error: submitError } = useMutation({
    mutationFn: ({ rating }) =>
      submitSrsReview({
        sessionId,
        itemId: currentItem?.id,
        rating,
        metadata: currentItem?.metadata ?? {},
      }),
    onSuccess: (payload) => {
      setSessionId(payload.sessionId ?? sessionId ?? null);
      setCurrentItem(payload.item ?? null);
      setQueueCount(payload.remaining ?? payload.queue?.length ?? 0);
      setRevealed(false);
      queryClient.invalidateQueries({ queryKey: ['srs', 'summary'] });
    },
  });

  useEffect(() => {
    initializeSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasQueue = useMemo(() => (queueCount ?? 0) > 0 || Boolean(currentItem), [queueCount, currentItem]);

  const handleReveal = () => setRevealed(true);
  const handleSubmit = (value) => {
    if (!currentItem || isSubmitting) return;
    submitReview({ rating: value });
  };

  const nextReview = summary?.next_review_at ? formatDateTime(summary.next_review_at, language) : null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t('srs.page.title', 'Session de révision')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('srs.page.subtitle', 'Révise les cartes dues pour renforcer tes apprentissages.')} 
          </Typography>
        </Box>

        {startError && (
          <Alert severity="error">{t('srs.page.errors.start', 'Impossible de préparer la session.')} {startError?.message}</Alert>
        )}
        {submitError && (
          <Alert severity="error">{t('srs.page.errors.submit', 'Enregistrement de la réponse impossible.')} {submitError?.message}</Alert>
        )}

        <Card elevation={4} sx={{ borderRadius: 3, minHeight: 320 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isStarting ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t('srs.page.loading', 'Préparation de tes cartes...')}
                </Typography>
              </Stack>
            ) : !hasQueue ? (
              <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
                <Typography variant="h6" fontWeight={600}>
                  {t('srs.page.completed', 'Bravo ! Aucune carte à réviser pour le moment.')} 
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {t('srs.page.completedHint', 'Continue tes capsules pour générer de nouvelles cartes.')} 
                </Typography>
                <Button variant="outlined" onClick={() => initializeSession()}>
                  {t('srs.page.restart', 'Recharger la session')}
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Chip
                    color="primary"
                    variant="outlined"
                    label={t('srs.page.queueCount', { count: queueCount })}
                  />
                  {currentItem?.due_at && (
                    <Typography variant="caption" color="text.secondary">
                      {t('srs.page.dueAt', { date: formatDateTime(currentItem.due_at, language) })}
                    </Typography>
                  )}
                </Stack>

                {currentItem?.capsule_title && (
                  <Typography variant="overline" color="text.secondary">
                    {t('srs.page.capsule', { capsule: currentItem.capsule_title })}
                  </Typography>
                )}
                {currentItem?.molecule_title && (
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('srs.page.lesson', { lesson: currentItem.molecule_title })}
                  </Typography>
                )}

                <Typography variant="h5" fontWeight={700} sx={{ whiteSpace: 'pre-wrap' }}>
                  {currentItem?.prompt || t('srs.page.emptyPrompt', 'Aucune question disponible.')} 
                </Typography>

                {revealed ? (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.100' }}>
                    <Typography variant="subtitle2" color="success.dark" gutterBottom>
                      {t('srs.page.answer', 'Réponse')}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {currentItem?.answer || t('srs.page.emptyAnswer', 'Pas de réponse fournie.')}
                    </Typography>
                    {currentItem?.hint && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {currentItem.hint}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={handleReveal}
                    disabled={isSubmitting}
                  >
                    {t('srs.page.reveal', 'Voir la réponse')}
                  </Button>
                )}

                {revealed && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    {ratingOptions(t).map((option) => (
                      <Button
                        key={option.value}
                        variant="contained"
                        color={option.color}
                        startIcon={<option.icon />}
                        onClick={() => handleSubmit(option.value)}
                        disabled={isSubmitting}
                        sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Divider />

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('srs.page.sessionSummary', 'Résumé de la session')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Chip
                color="primary"
                label={t('srs.page.summaryDue', { count: summary?.due_count ?? 0 })}
                variant="outlined"
              />
              <Chip
                color="warning"
                label={t('srs.page.summaryOverdue', { count: summary?.overdue_count ?? 0 })}
                variant="outlined"
              />
              {nextReview && (
                <Typography variant="caption" color="text.secondary">
                  {t('srs.page.nextReview', { time: nextReview })}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default SrsReviewPage;
