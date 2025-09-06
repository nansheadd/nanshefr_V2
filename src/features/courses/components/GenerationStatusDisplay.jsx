// src/features/courses/components/GenerationStatusDisplay.jsx
import React from 'react';
import { Box, Typography, LinearProgress, Alert, Stack } from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const StatusAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(135deg, ${theme.palette.info.main}10, ${theme.palette.info.main}05)`,
  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.info.main, 0.4)}, transparent)`,
    animation: `${shimmer} 2s infinite`,
  }
}));

const GenerationStatusDisplay = ({ 
  status, 
  progress = 0, 
  step = 'Initialisation...', 
  title = 'Génération en cours' 
}) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'generating':
      case 'pending':
        return 'Notre IA travaille sur votre contenu personnalisé...';
      case 'completed':
        return 'Génération terminée avec succès !';
      case 'failed':
        return 'Une erreur est survenue pendant la génération.';
      default:
        return 'Préparation de votre cours...';
    }
  };

  const getSeverity = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <AutoAwesomeIcon />;
      case 'failed':
        return <AutoAwesomeIcon />;
      default:
        return <SmartToyIcon />;
    }
  };

  if (status === 'completed') {
    return (
      <Alert severity="success" sx={{ borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Contenu prêt !
        </Typography>
        <Typography variant="body2">
          Votre cours a été généré avec succès et est maintenant disponible.
        </Typography>
      </Alert>
    );
  }

  if (status === 'failed') {
    return (
      <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Erreur de génération
        </Typography>
        <Typography variant="body2">
          La génération a échoué. Veuillez réessayer ou contacter le support.
        </Typography>
      </Alert>
    );
  }

  return (
    <StatusAlert 
      severity={getSeverity()}
      icon={getIcon()}
      sx={{ mb: 3, p: 3 }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2">
            {getStatusMessage()}
          </Typography>
        </Box>
        
        {progress > 0 && (
          <Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha('#1976d2', 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {Math.round(progress)}% - {step}
            </Typography>
          </Box>
        )}
        
        <Typography variant="caption" color="text.secondary">
          Vous pouvez quitter cette page en toute sécurité. La génération continuera en arrière-plan.
        </Typography>
      </Stack>
    </StatusAlert>
  );
};

export default GenerationStatusDisplay;