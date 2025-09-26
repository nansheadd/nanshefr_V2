import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useI18n } from '../../../i18n/I18nContext';
import {
  fetchJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
} from '../api/journalApi';

const MAX_PREVIEW_LENGTH = 600;

const truncate = (text, length = MAX_PREVIEW_LENGTH) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
};

const formatDateTime = (value, language) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language || 'fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
};

const JournalPage = () => {
  const { t, language } = useI18n();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ title: '', content: '', mood: '' });
  const [feedback, setFeedback] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['journal', 'entries', 'page'],
    queryFn: () => fetchJournalEntries({ limit: 50 }),
    staleTime: 10_000,
  });

  const entries = useMemo(() => data?.items ?? [], [data]);

  const createMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: (entry) => {
      setForm({ title: '', content: '', mood: '' });
      setFeedback({ severity: 'success', message: t('journal.page.notifications.saved', 'Entrée enregistrée !') });
      queryClient.setQueryData(['journal', 'entries', 'page'], (previous) => {
        if (!previous) {
          return { items: entry ? [entry] : [], total: entry ? 1 : 0 };
        }
        const items = entry ? [entry, ...(previous.items ?? [])] : previous.items ?? [];
        const baseTotal = Number.isFinite(previous.total)
          ? previous.total
          : (previous.items ?? []).length;
        const total = entry ? baseTotal + 1 : baseTotal;
        return { ...previous, items, total };
      });
      queryClient.invalidateQueries({ queryKey: ['journal', 'entries', 'recent'] });
    },
    onError: () => {
      setFeedback({ severity: 'error', message: t('journal.page.notifications.error', 'Impossible de sauvegarder la note.') });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: (_, entryId) => {
      queryClient.setQueryData(['journal', 'entries', 'page'], (previous) => {
        if (!previous) return previous;
        const filtered = (previous.items ?? []).filter((entry) => entry.id !== entryId);
        const baseTotal = Number.isFinite(previous.total)
          ? previous.total
          : (previous.items ?? []).length;
        const total = Math.max(0, baseTotal - 1);
        return { ...previous, items: filtered, total };
      });
      queryClient.invalidateQueries({ queryKey: ['journal', 'entries', 'recent'] });
      setFeedback({ severity: 'info', message: t('journal.page.notifications.deleted', 'Entrée supprimée.') });
    },
    onError: () => {
      setFeedback({ severity: 'error', message: t('journal.page.notifications.deleteError', 'Suppression impossible pour le moment.') });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.content.trim()) {
      setFeedback({ severity: 'warning', message: t('journal.page.notifications.empty', 'Ajoute du contenu avant d\'enregistrer.') });
      return;
    }
    createMutation.mutate({
      title: form.title || null,
      content: form.content,
      mood: form.mood || null,
    });
  };

  const handleDelete = (entryId) => {
    if (!entryId || deleteMutation.isPending) return;
    deleteMutation.mutate(entryId);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {t('journal.page.title', 'Journal d\'apprentissage')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('journal.page.subtitle', 'Note tes réflexions après chaque session pour suivre ta progression.')} 
          </Typography>
        </Box>

        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label={t('journal.page.form.title', 'Titre (optionnel)')}
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <TextField
                  fullWidth
                  label={t('journal.page.form.mood', 'Humeur')}
                  value={form.mood}
                  onChange={(event) => setForm((prev) => ({ ...prev, mood: event.target.value }))}
                />
              </Stack>
              <TextField
                multiline
                minRows={4}
                label={t('journal.page.form.content', 'Qu\'as-tu appris aujourd\'hui ?')}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              />
              <Stack direction="row" justifyContent="flex-end" spacing={2} alignItems="center">
                {createMutation.isPending && <CircularProgress size={24} />}
                <Button type="submit" variant="contained" startIcon={<EditNoteIcon />} disabled={createMutation.isPending}>
                  {t('journal.page.form.submit', 'Enregistrer')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {feedback && (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <Divider sx={{ my: 1 }} />

        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {t('journal.page.list.title', 'Entrées récentes')}
          </Typography>
        </Box>

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        ) : isError ? (
          <Alert severity="error">
            {t('journal.page.error', 'Impossible de charger le journal.')} {error?.message}
          </Alert>
        ) : entries.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {t('journal.page.list.empty', 'Tes notes apparaîtront ici après les avoir enregistrées.')} 
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {entries.map((entry) => {
              const created = formatDateTime(entry.created_at, language);
              const updated = formatDateTime(entry.updated_at, language);
              const preview = truncate(entry.content || entry.summary || '');
              return (
                <Card key={entry.id} variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {entry.title || t('journal.widget.untitled', 'Entrée')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {updated || created}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {entry.mood && (
                            <Chip
                              size="small"
                              color="secondary"
                              icon={<EmojiEmotionsIcon fontSize="inherit" />}
                              label={entry.mood}
                              variant="outlined"
                            />
                          )}
                          <IconButton
                            edge="end"
                            color="error"
                            aria-label={t('journal.page.list.delete', 'Supprimer')}
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Stack>
                      {preview && (
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {preview}
                        </Typography>
                      )}
                      {(entry.capsule_title || entry.molecule_title) && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          {entry.capsule_title && (
                            <Chip
                              size="small"
                              color="primary"
                              variant="outlined"
                              label={t(
                                'journal.page.list.capsule',
                                { capsule: entry.capsule_title },
                                `Capsule : ${entry.capsule_title}`,
                              )}
                            />
                          )}
                          {entry.molecule_title && (
                            <Chip
                              size="small"
                              color="info"
                              variant="outlined"
                              label={t(
                                'journal.page.list.lesson',
                                { lesson: entry.molecule_title },
                                `Leçon : ${entry.molecule_title}`,
                              )}
                            />
                          )}
                        </Stack>
                      )}
                      {entry.tags?.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {entry.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default JournalPage;
