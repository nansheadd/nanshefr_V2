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
  Divider,
  Box,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useI18n } from '../../../i18n/I18nContext';
import { fetchJournalEntries } from '../api/journalApi';

const formatDate = (value, language) => {
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

const EntrySkeleton = () => (
  <Stack spacing={1}>
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
  </Stack>
);

const JournalWidget = ({ onOpen }) => {
  const { t, language } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['journal', 'entries', 'recent'],
    queryFn: () => fetchJournalEntries({ limit: 3 }),
    staleTime: 60_000,
  });

  const entries = data?.items ?? [];

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <MenuBookIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {t('journal.widget.title', 'Journal')}
            </Typography>
          </Stack>
          {onOpen && (
            <Button size="small" variant="outlined" onClick={onOpen}>
              {t('journal.widget.cta', 'Ouvrir')}
            </Button>
          )}
        </Stack>

        <Divider />

        {isLoading ? (
          <Stack spacing={2}>
            <EntrySkeleton />
            <EntrySkeleton />
          </Stack>
        ) : isError ? (
          <Typography variant="body2" color="error">
            {t('journal.widget.error', 'Impossible de charger le journal.')}
          </Typography>
        ) : entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('journal.widget.empty', 'Ajoute ta première note pour garder une trace de ta progression.')} 
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ flex: 1 }}>
            {entries.map((entry) => {
              const preview = entry.summary || entry.content;
              const date = formatDate(entry.updated_at ?? entry.created_at, language);
              return (
                <Box key={entry.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {entry.title || t('journal.widget.untitled', 'Entrée')}
                    </Typography>
                    {entry.mood && (
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<EmojiEmotionsIcon fontSize="inherit" />}
                        label={entry.mood}
                      />
                    )}
                    {entry.tags?.slice(0, 2).map((tag) => (
                      <Chip key={tag} size="small" label={tag} variant="outlined" />
                    ))}
                  </Stack>
                  {(entry.capsule_title || entry.molecule_title) && (
                    <Typography variant="caption" color="text.secondary">
                      {entry.capsule_title &&
                        t('journal.widget.capsule', { capsule: entry.capsule_title }, `Capsule : ${entry.capsule_title}`)}
                      {entry.capsule_title && entry.molecule_title ? ' · ' : ''}
                      {entry.molecule_title &&
                        t('journal.widget.lesson', { lesson: entry.molecule_title }, `Leçon : ${entry.molecule_title}`)}
                    </Typography>
                  )}
                  {preview && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {preview}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled">
                    {date}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalWidget;
