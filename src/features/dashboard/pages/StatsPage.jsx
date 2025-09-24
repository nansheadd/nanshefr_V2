import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Paper, Typography, Box, CircularProgress, Alert, LinearProgress, Stack, Chip, Grid, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TimelineIcon from '@mui/icons-material/Timeline';
import apiClient from '../../../api/axiosConfig';
import { fetchMyCapsules } from '../../capsules/api/capsulesApi';
import {
  getBreakdownEntries,
  getCurrentStreakDays,
  getEntryDurationSeconds,
  getTotalSessions,
  getTotalStudyTimeSeconds,
} from '../utils/studyStats';

const fetchCapsuleProgress = async () => {
  const { data } = await apiClient.get('/users/me/capsule-progress');
  return data;
};

const fetchStudyStats = async () => {
  const { data } = await apiClient.get('/progress/stats');
  return data;
};

const formatDuration = (seconds = 0) => {
  const totalSeconds = Number.isFinite(seconds) ? seconds : 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);
  const parts = [];
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  if (!hours && !minutes) parts.push(`${remainingSeconds} s`);
  return parts.join(' ');
};

const pickFirstString = (entry, keys) => {
  for (const key of keys) {
    const value = entry?.[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return null;
};

const CapsuleProgressCard = ({ capsule, progress }) => {
  const xp = progress?.xp ?? 0;
  const strength = progress?.strength ?? 0;

  return (
    <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }} elevation={2}>
      <Typography variant="h6" fontWeight="bold">
        {capsule.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Domaine : {capsule.domain} — Aire : {capsule.area}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" gutterBottom>Progression XP</Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, (xp / 60000) * 100)}
          sx={{ height: 10, borderRadius: 5 }}
          color="primary"
        />
        <Typography variant="caption" color="text.secondary">
          {xp} XP cumulés
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2" gutterBottom>Indice de maîtrise</Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, strength * 100)}
          sx={{ height: 10, borderRadius: 5 }}
          color={strength > 0.7 ? 'success' : strength > 0.4 ? 'warning' : 'error'}
        />
        <Typography variant="caption" color="text.secondary">
          {Math.round(strength * 100)}%
        </Typography>
      </Box>
    </Paper>
  );
};

const StatsPage = () => {
  const { data: capsuleResponse, isLoading: capsLoading, isError: capsError } = useQuery({
    queryKey: ['capsules', 'me'],
    queryFn: fetchMyCapsules,
  });

  const capsules = capsuleResponse?.items ?? [];

  const { data: progressEntries, isLoading: progressLoading, isError: progressError } = useQuery({
    queryKey: ['capsule-progress'],
    queryFn: fetchCapsuleProgress,
  });

  const { data: studyStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: fetchStudyStats,
  });

  const progressMap = React.useMemo(() => {
    const map = new Map();
    progressEntries?.forEach((entry) => {
      map.set(entry.capsule_id, entry);
    });
    return map;
  }, [progressEntries]);

  const domainBreakdown = React.useMemo(
    () => getBreakdownEntries(studyStats, 'domain'),
    [studyStats]
  );
  const areaBreakdown = React.useMemo(
    () => getBreakdownEntries(studyStats, 'area'),
    [studyStats]
  );
  const capsuleBreakdown = React.useMemo(
    () => getBreakdownEntries(studyStats, 'capsule'),
    [studyStats]
  );
  const totalStudyTime = getTotalStudyTimeSeconds(studyStats);
  const currentStreak = getCurrentStreakDays(studyStats);
  const totalSessions = getTotalSessions(studyStats);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Mes statistiques
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualisez la progression globale sur vos capsules actives.
            </Typography>
          </Box>
          <Chip label={`${capsules.length} capsules`} color="primary" />
        </Box>

        {(capsLoading || progressLoading || statsLoading) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {(capsError || progressError || statsError) && (
          <Alert severity="error" sx={{ my: 2 }}>
            Impossible de charger les statistiques pour le moment.
          </Alert>
        )}

        {studyStats && !statsLoading && !statsError && (
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }} elevation={1}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Habitudes d'apprentissage
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AccessTimeIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Temps d'étude total</Typography>
                    <Typography variant="h6" fontWeight={700}>{formatDuration(totalStudyTime)}</Typography>
                    <Typography variant="caption" color="text.secondary">{totalSessions} session(s)</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalFireDepartmentIcon color="warning" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Streak actuel</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {currentStreak} jour{currentStreak > 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Activité consécutive</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TimelineIcon color="secondary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Temps par domaine</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {domainBreakdown.length
                        ? formatDuration(getEntryDurationSeconds(domainBreakdown[0]))
                        : '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {domainBreakdown.length
                        ? pickFirstString(domainBreakdown[0], ['domain', 'label', 'name']) ??
                          'Aucun suivi pour le moment'
                        : 'Aucun suivi pour le moment'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {(domainBreakdown.length || areaBreakdown.length || capsuleBreakdown.length) && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Domaine</Typography>
                    <Stack spacing={1}>
                      {domainBreakdown.slice(0, 5).map((entry, index) => {
                        const label = pickFirstString(entry, ['domain', 'label', 'name']) ?? `Domaine ${index + 1}`;
                        return (
                          <Paper key={`${label}-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600}>{label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDuration(getEntryDurationSeconds(entry))}
                            </Typography>
                          </Paper>
                        );
                      })}
                      {!domainBreakdown.length && (
                        <Typography variant="caption" color="text.secondary">Aucun temps suivi pour le moment.</Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Zone</Typography>
                    <Stack spacing={1}>
                      {areaBreakdown.slice(0, 5).map((entry, index) => {
                        const areaLabel = pickFirstString(entry, ['area', 'label', 'name']) ?? `Zone ${index + 1}`;
                        const domainLabel = pickFirstString(entry, ['domain', 'parent', 'group']);
                        return (
                          <Paper
                            key={`${areaLabel}-${domainLabel ?? index}`}
                            variant="outlined"
                            sx={{ p: 1.5, borderRadius: 2 }}
                          >
                            <Typography variant="body2" fontWeight={600}>{areaLabel}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {domainLabel ?? 'Domaine non renseigné'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDuration(getEntryDurationSeconds(entry))}
                            </Typography>
                          </Paper>
                        );
                      })}
                      {!areaBreakdown.length && (
                        <Typography variant="caption" color="text.secondary">Commencez une capsule pour analyser vos habitudes.</Typography>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Capsule</Typography>
                    <Stack spacing={1}>
                      {capsuleBreakdown.slice(0, 5).map((entry, index) => {
                        const capsuleLabel =
                          pickFirstString(entry, ['title', 'capsule', 'name']) ?? `Capsule ${index + 1}`;
                        const capsuleContext = pickFirstString(entry, ['domain']);
                        const capsuleArea = pickFirstString(entry, ['area']);
                        return (
                          <Paper key={`${capsuleLabel}-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600}>{capsuleLabel}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[capsuleContext, capsuleArea].filter(Boolean).join(' • ') || 'Contexte non renseigné'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDuration(getEntryDurationSeconds(entry))}
                            </Typography>
                          </Paper>
                        );
                      })}
                      {!capsuleBreakdown.length && (
                        <Typography variant="caption" color="text.secondary">Aucune capsule encore chronométrée.</Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        )}

        <Stack spacing={2}>
          {capsules.length ? (
            capsules.map((capsule) => (
              <CapsuleProgressCard
                key={capsule.id}
                capsule={capsule}
                progress={progressMap.get(capsule.id)}
              />
            ))
          ) : (
            <Alert severity="info">
              Aucune capsule active. Inscrivez-vous à une capsule pour suivre vos statistiques.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default StatsPage;
