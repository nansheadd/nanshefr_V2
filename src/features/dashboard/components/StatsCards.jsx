// src/features/dashboard/components/StatsCards.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig'; // Assurez-vous d'avoir ce fichier
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getCurrentStreakDays, getTotalStudyTimeSeconds } from '../utils/studyStats';

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  borderRadius: 16,
  background: `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].main}25 100%)`,
  border: `1px solid ${theme.palette[color].main}30`,
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 40px ${theme.palette[color].main}30`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
    borderRadius: '16px 16px 0 0',
  }
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  width: 56,
  height: 56,
  borderRadius: 14,
  background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  boxShadow: `0 8px 24px ${theme.palette[color].main}40`,
}));

// Fonction pour formater les secondes en heures/minutes
const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
};

const StatsCards = () => {
  // Query 1: Récupérer les capsules de l'utilisateur
  const { data: enrolledCapsules, isLoading: isLoadingCapsules } = useQuery({
    queryKey: ['my-capsules'],
    queryFn: async () => (await apiClient.get('/capsules/me')).data,
  });

  // Query 2: Récupérer les stats de progression
  const { data: progressStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['my-progress-stats'],
    queryFn: async () => (await apiClient.get('/progress/stats')).data,
  });

  const isLoading = isLoadingCapsules || isLoadingStats;

  const totalStudyTimeSeconds = getTotalStudyTimeSeconds(progressStats);
  const currentStreakDays = getCurrentStreakDays(progressStats);

  const stats = [
    {
      title: 'Capsules Actives',
      value: isLoading ? '...' : enrolledCapsules?.length || 0,
      icon: <SchoolIcon />,
      color: 'primary',
    },
    {
      title: 'Temps d\'apprentissage',
      value: isLoading ? '...' : formatTime(totalStudyTimeSeconds),
      icon: <AccessTimeIcon />,
      color: 'secondary',
    },
    {
      title: 'Streak Actuel',
      value: isLoading
        ? '...'
        : `${currentStreakDays} jour${currentStreakDays > 1 ? 's' : ''}`,
      icon: <TrendingUpIcon />,
      color: 'success',
    },
    {
      title: 'Badges Obtenus',
      value: '8', // Donnée statique pour le moment
      icon: <EmojiEventsIcon />,
      color: 'warning',
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
          ) : (
            <StatCard color={stat.color}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{stat.value}</Typography>
                  </Box>
                  <IconContainer color={stat.color}>{stat.icon}</IconContainer>
                </Box>
              </CardContent>
            </StatCard>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
