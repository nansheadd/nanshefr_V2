import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import DashboardHeader from '../components/DashboardHeader';

const fetchStats = async () => {
  const { data } = await apiClient.get('/progress/stats');
  return data;
};

const fetchMyCapsules = async () => {
  const { data } = await apiClient.get('/capsules/me');
  return data;
};

const StatCard = ({ title, value, suffix }) => (
  <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h4" fontWeight="bold">
      {value}
      {suffix && (
        <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
          {suffix}
        </Typography>
      )}
    </Typography>
  </Paper>
);

const CapsuleCard = ({ capsule }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}
  >
    <Typography variant="h6" fontWeight="bold">
      {capsule.title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Domaine : {capsule.domain} — Aire : {capsule.area}
    </Typography>
    <Chip label={capsule.main_skill} color="primary" size="small" sx={{ alignSelf: 'flex-start' }} />
    <Button
      variant="contained"
      component={RouterLink}
      to={`/capsule/${capsule.domain}/${capsule.area}/${capsule.id}/plan`}
      sx={{ alignSelf: 'flex-start', mt: 1 }}
    >
      Continuer
    </Button>
  </Paper>
);

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: fetchStats,
  });

  const { data: capsules, isLoading: capsulesLoading } = useQuery({
    queryKey: ['capsules', 'me'],
    queryFn: fetchMyCapsules,
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Bienvenue dans Nanshe
        </Typography>
        <DashboardHeader />
        <Typography variant="body1" color="text.secondary">
          Retrouve ici un aperçu rapide de ta progression et de tes capsules en cours.
        </Typography>
      </Box>

      {statsLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Temps d'étude total"
              value={Math.round((stats?.total_study_time_seconds ?? 0) / 60)}
              suffix="min"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Streak actuel"
              value={stats?.current_streak_days ?? 0}
              suffix={stats?.current_streak_days > 1 ? 'jours' : 'jour'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Besoin d'une nouvelle capsule ?
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/capsules"
                sx={{ mt: 2 }}
              >
                Explorer le catalogue
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Mes capsules
        </Typography>
        <Button component={RouterLink} to="/library" size="small">
          Voir la bibliothèque
        </Button>
      </Box>

      {capsulesLoading ? (
        <CircularProgress />
      ) : capsules?.length ? (
        <Grid container spacing={3}>
          {capsules.map((capsule) => (
            <Grid item xs={12} md={6} lg={4} key={capsule.id}>
              <CapsuleCard capsule={capsule} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }} variant="outlined">
          <Typography variant="body1" gutterBottom>
            Aucune capsule active pour le moment.
          </Typography>
          <Button variant="contained" component={RouterLink} to="/capsules">
            Découvrir les capsules
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default DashboardPage;
