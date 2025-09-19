import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Skeleton,
  Stack,
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import apiClient from '../../../api/axiosConfig';

const fetchBadges = async () => {
  const { data } = await apiClient.get('/badges');
  return data;
};

const BadgeCard = ({ badge, isUnlocked, awardedAt }) => (
  <Paper
    elevation={isUnlocked ? 6 : 1}
    sx={{
      p: 3,
      borderRadius: 3,
      border: isUnlocked ? '2px solid rgba(16,185,129,0.4)' : '1px dashed rgba(148,163,184,0.5)',
      bgcolor: isUnlocked ? 'background.paper' : 'rgba(148,163,184,0.08)',
      position: 'relative',
      transition: 'all 0.3s ease',
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: isUnlocked ? 'success.light' : 'grey.200',
          color: isUnlocked ? 'success.dark' : 'grey.500',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <WorkspacePremiumIcon />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ opacity: isUnlocked ? 1 : 0.6 }}>
          {badge.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ opacity: isUnlocked ? 1 : 0.6 }}>
          {badge.description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label={badge.category} size="small" color={isUnlocked ? 'success' : 'default'} />
          <Chip label={`${badge.points} pts`} size="small" variant="outlined" />
          {isUnlocked && awardedAt && (
            <Chip label={`Débloqué le ${new Date(awardedAt).toLocaleDateString()}`} size="small" variant="outlined" />
          )}
        </Stack>
      </Box>
    </Stack>
  </Paper>
);

const BadgesPage = () => {
  const { data, isLoading, isError } = useQuery({ queryKey: ['badges'], queryFn: fetchBadges });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography color="error">Impossible de charger les badges pour le moment.</Typography>
      </Container>
    );
  }

  const grouped = (data || []).reduce((acc, item) => {
    const category = item.badge.category;
    acc[category] = acc[category] || [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          🎖️ Tableau des badges
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Débloquez des distinctions en explorant la plateforme, en créant des capsules et en maîtrisant vos leçons.
        </Typography>
      </Box>

      {Object.entries(grouped).map(([category, badges]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            {category}
          </Typography>
          <Grid container spacing={3}>
            {badges.map((entry) => (
              <Grid item xs={12} sm={6} md={4} key={entry.badge.id}>
                <BadgeCard
                  badge={entry.badge}
                  isUnlocked={entry.is_unlocked}
                  awardedAt={entry.awarded_at}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default BadgesPage;
