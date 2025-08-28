// src/features/dashboard/components/StatsCards.jsx
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

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

const stats = [
  {
    title: 'Cours Terminés',
    value: '12',
    change: '+15%',
    icon: <SchoolIcon />,
    color: 'primary',
    progress: 75
  },
  {
    title: 'Temps d\'étude',
    value: '47h',
    change: '+8h cette semaine',
    icon: <AccessTimeIcon />,
    color: 'secondary',
    progress: 60
  },
  {
    title: 'Streak Actuel',
    value: '5 jours',
    change: 'Record: 12 jours',
    icon: <TrendingUpIcon />,
    color: 'success',
    progress: 42
  },
  {
    title: 'Badges Obtenus',
    value: '8',
    change: '+2 ce mois',
    icon: <EmojiEventsIcon />,
    color: 'warning',
    progress: 80
  },
];

const StatsCards = () => {
  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <StatCard color={stat.color}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color={`${stat.color}.main`} sx={{ fontWeight: 600 }}>
                    {stat.change}
                  </Typography>
                </Box>
                <IconContainer color={stat.color}>
                  {stat.icon}
                </IconContainer>
              </Box>
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={stat.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: `${stat.color}.50`,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${stat.color === 'primary' ? '#1976d2' : stat.color === 'secondary' ? '#9c27b0' : stat.color === 'success' ? '#2e7d32' : '#ed6c02'}, ${stat.color === 'primary' ? '#42a5f5' : stat.color === 'secondary' ? '#ba68c8' : stat.color === 'success' ? '#66bb6a' : '#ffb74d'})`,
                    }
                  }}
                />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;