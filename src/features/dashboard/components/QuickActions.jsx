// src/features/dashboard/components/QuickActions.jsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Stack, 
  Box,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ActionCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}30`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 2),
  justifyContent: 'flex-start',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  }
}));

const TrendingSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
  borderRadius: 12,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const QuickActions = ({ onCreateCourse, onOpenLibrary }) => {
  const quickActions = [
    { label: 'Créer un cours', icon: <AddIcon />, color: 'primary', variant: 'contained', onClick: onCreateCourse },
    { label: 'Explorer les cours', icon: <SearchIcon />, color: 'secondary', variant: 'outlined', onClick: onOpenLibrary },
    { label: 'Mes favoris', icon: <BookmarkIcon />, color: 'info', variant: 'outlined' },
    { label: 'Reprendre l\'étude', icon: <PlayArrowIcon />, color: 'success', variant: 'contained' },
  ];

  const trendingTopics = [
    'JavaScript Avancé',
    'Machine Learning',
    'Design UI/UX',
    'React Native'
  ];

  return (
    <ActionCard>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          🚀 Actions Rapides
        </Typography>
        
        <Stack spacing={2}>
          {quickActions.map((action, index) => (
            <ActionButton
              key={index}
              variant={action.variant}
              color={action.color}
              startIcon={action.icon}
              fullWidth
              size="large"
              onClick={action.onClick}
            >
              {action.label}
            </ActionButton>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <TrendingSection>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Tendances du moment
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {trendingTopics.map((topic, index) => (
              <Chip
                key={index}
                label={topic}
                size="small"
                variant="outlined"
                clickable
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            ))}
          </Stack>
        </TrendingSection>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
          <Typography variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
            💡 Conseil du jour
          </Typography>
          <Typography variant="caption" color="success.dark">
            Étudiez 25 minutes puis prenez une pause de 5 minutes pour maximiser votre concentration !
          </Typography>
        </Box>
      </CardContent>
    </ActionCard>
  );
};

export default QuickActions;