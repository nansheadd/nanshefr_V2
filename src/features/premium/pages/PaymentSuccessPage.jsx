import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  // Minuteur pour la redirection automatique
  useEffect(() => {
    if (countdown === 0) {
      navigate('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          maxWidth: 500,
          animation: `${fadeIn} 0.7s ease-out`,
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Paiement réussi !
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Bienvenue parmi nos membres Premium. Votre apprentissage sans limites commence maintenant.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/dashboard')}
        >
          Accéder à mon tableau de bord
        </Button>
        <Box sx={{ mt: 4, color: 'text.disabled' }}>
          <Typography variant="body2">
            Vous serez redirigé automatiquement dans...
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
            <CircularProgress variant="determinate" value={(countdown / 15) * 100} size={20} />
            <Typography variant="h6" component="span">{countdown}s</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentSuccessPage;