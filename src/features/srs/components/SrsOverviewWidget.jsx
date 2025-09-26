import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Skeleton,
  Box,
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useI18n } from '../../../i18n/I18nContext';
import { fetchSrsSummary } from '../api/srsApi';

const SummarySkeleton = () => (
  <Stack direction="row" spacing={2}>
    <Skeleton variant="rectangular" height={56} width="100%" sx={{ borderRadius: 2 }} />
  </Stack>
);

const StatCard = ({ icon, label, value }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1.5}
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'primary.light',
        color: 'primary.contrastText',
      }}
    >
      {icon}
    </Box>
    <Stack spacing={0.25}>
      <Typography variant="h6" fontWeight={700}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  </Stack>
);

const formatRelativeTime = (value, language) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const formatter = new Intl.RelativeTimeFormat(language || 'fr-FR', { numeric: 'auto' });
    const diffMs = date.getTime() - Date.now();
    const diffMinutes = Math.round(diffMs / 60000);
    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, 'minute');
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 48) {
      return formatter.format(diffHours, 'hour');
    }
    const diffDays = Math.round(diffHours / 24);
    return formatter.format(diffDays, 'day');
  } catch {
    return '';
  }
};

const SrsOverviewWidget = ({ onStart }) => {
  const { t, language } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['srs', 'summary'],
    queryFn: fetchSrsSummary,
    staleTime: 60_000,
  });

  const due = data?.due_count ?? 0;
  const overdue = data?.overdue_count ?? 0;
  const nextReview = data?.next_review_at ? formatRelativeTime(data.next_review_at, language) : null;
  const dueLabel = t('srs.widget.dueLabel', 'Cartes à revoir aujourd\'hui');
  const overdueLabel = t('srs.widget.overdueLabel', 'Cartes en retard');

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
              }}
            >
              <FlashOnIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {t('srs.widget.title', 'Révisions espacées')}
            </Typography>
          </Stack>
          {onStart && (
            <Button size="small" variant="contained" onClick={onStart}>
              {t('srs.widget.cta', 'Lancer les révisions')}
            </Button>
          )}
        </Stack>

        {isLoading ? (
          <SummarySkeleton />
        ) : isError ? (
          <Typography variant="body2" color="error">
            {t('srs.widget.error', 'Impossible de charger les statistiques de révision.')}
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <StatCard
                icon={<PendingActionsIcon fontSize="small" />}
                label={dueLabel}
                value={due}
              />
              <StatCard
                icon={<ScheduleIcon fontSize="small" />}
                label={overdueLabel}
                value={overdue}
              />
            </Stack>
            {data?.new_count != null && (
              <Chip
                label={t('srs.widget.newCount', { count: data.new_count })}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {nextReview && (
              <Typography variant="caption" color="text.secondary">
                {t('srs.widget.nextReview', { time: nextReview })}
              </Typography>
            )}
            {due === 0 && overdue === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t('srs.widget.empty', 'Aucune carte à réviser pour le moment.')} 
              </Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default SrsOverviewWidget;
