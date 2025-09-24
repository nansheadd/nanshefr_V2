import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Container, Typography, Grid, Paper, Button, CircularProgress, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import DashboardHeader from '../components/DashboardHeader';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useI18n } from '../../../i18n/I18nContext';
import DashboardCapsuleBoard from '../components/DashboardCapsuleBoard';
import { getCurrentStreakDays, getTotalStudyTimeSeconds } from '../utils/studyStats';
import { fetchMyCapsules } from '../../capsules/api/capsulesApi';

const fetchStats = async () => {
  const { data } = await apiClient.get('/progress/stats');
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

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['progress', 'stats'],
    queryFn: fetchStats,
  });

  const { data: capsuleResponse, isLoading: capsulesLoading } = useQuery({
    queryKey: ['capsules', 'me'],
    queryFn: fetchMyCapsules,
  });

  const capsules = capsuleResponse?.items ?? [];

  const { t } = useI18n();

  const toolboxTiles = React.useMemo(
    () => [
      {
        title: t('dashboard.toolbox.tiles.coach.title'),
        description: t('dashboard.toolbox.tiles.coach.description'),
        icon: SmartToyIcon,
        tool: 'coach',
        color: 'secondary',
      },
      {
        title: t('dashboard.toolbox.tiles.notes.title'),
        description: t('dashboard.toolbox.tiles.notes.description'),
        icon: EditNoteIcon,
        tool: 'notes',
        color: 'info',
      },
    ],
    [t]
  );

  const openTool = (tool, expand = false) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('nanshe:toolbox-open', {
        detail: { tool, expand },
      })
    );
  };

  const totalStudyTimeSeconds = getTotalStudyTimeSeconds(stats);
  const currentStreakDays = getCurrentStreakDays(stats);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('dashboard.welcomeTitle')}
        </Typography>
        <DashboardHeader />
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.welcomeDescription')}
        </Typography>
      </Box>

      {statsLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard
              title={t('dashboard.stats.totalStudy')}
              value={Math.round(totalStudyTimeSeconds / 60)}
              suffix={t('dashboard.stats.minutes')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title={t('dashboard.stats.currentStreak')}
              value={currentStreakDays}
              suffix={
                currentStreakDays > 1
                  ? t('dashboard.stats.dayPlural')
                  : t('dashboard.stats.daySingular')
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('dashboard.stats.catalogTitle')}
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                component={RouterLink}
                to="/capsules"
                sx={{ mt: 2 }}
              >
                {t('dashboard.stats.catalogButton')}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, mt: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {t('dashboard.toolbox.title')}
        </Typography>
        <Button component={RouterLink} to="/toolbox" size="small">
          {t('dashboard.toolbox.viewAll')}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {toolboxTiles.map((tile) => (
          <Grid item xs={12} md={6} key={tile.tool}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (theme) => theme.palette[tile.color].light,
                    color: (theme) => theme.palette[tile.color].contrastText,
                  }}
                >
                  <tile.icon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {tile.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tile.description}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  color={tile.color}
                  onClick={() => openTool(tile.tool, true)}
                >
                  {t('dashboard.toolbox.openModal')}
                </Button>
                <Button
                  variant="outlined"
                  color={tile.color}
                  onClick={() => openTool(tile.tool, false)}
                >
                  {t('dashboard.toolbox.openPopup')}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {t('dashboard.capsules.title')}
        </Typography>
        <Button component={RouterLink} to="/library" size="small">
          {t('dashboard.capsules.viewLibrary')}
        </Button>
      </Box>

      {capsulesLoading ? (
        <Box sx={{ mb: 6 }}>
          <DashboardCapsuleBoard capsules={[]} isLoading />
        </Box>
      ) : capsules.length ? (
        <Box sx={{ mb: 6 }}>
          <DashboardCapsuleBoard capsules={capsules} />
        </Box>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }} variant="outlined">
          <Typography variant="body1" gutterBottom>
            {t('dashboard.capsules.empty')}
          </Typography>
          <Button variant="contained" component={RouterLink} to="/capsules">
            {t('dashboard.capsules.cta')}
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default DashboardPage;
