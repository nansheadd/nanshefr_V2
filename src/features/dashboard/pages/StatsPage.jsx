import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Paper, Typography, Box, CircularProgress, Alert, LinearProgress, Stack, Chip } from '@mui/material';
import apiClient from '../../../api/axiosConfig';

const fetchMyCapsules = async () => {
  const { data } = await apiClient.get('/capsules/me');
  return data;
};

const fetchCapsuleProgress = async () => {
  const { data } = await apiClient.get('/users/me/capsule-progress');
  return data;
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
  const { data: capsules, isLoading: capsLoading, isError: capsError } = useQuery({
    queryKey: ['capsules', 'me'],
    queryFn: fetchMyCapsules,
  });

  const { data: progressEntries, isLoading: progressLoading, isError: progressError } = useQuery({
    queryKey: ['capsule-progress'],
    queryFn: fetchCapsuleProgress,
  });

  const progressMap = React.useMemo(() => {
    const map = new Map();
    progressEntries?.forEach((entry) => {
      map.set(entry.capsule_id, entry);
    });
    return map;
  }, [progressEntries]);

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
          <Chip label={`${capsules?.length ?? 0} capsules`} color="primary" />
        </Box>

        {(capsLoading || progressLoading) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {(capsError || progressError) && (
          <Alert severity="error" sx={{ my: 2 }}>
            Impossible de charger les statistiques pour le moment.
          </Alert>
        )}

        <Stack spacing={2}>
          {capsules?.length ? (
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
