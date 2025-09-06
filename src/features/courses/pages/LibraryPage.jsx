import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import { 
  Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, 
  Container, Skeleton, Stack, Button, CardActions, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';

// --- Icônes (similaires à CapsuleList) ---
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LanguageIcon from '@mui/icons-material/Language';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessIcon from '@mui/icons-material/Business';
import ComputerIcon from '@mui/icons-material/Computer';
import BrushIcon from '@mui/icons-material/Brush';

// --- Configuration des domaines (réutilisée) ---
const domainConfig = {
  'languages': { icon: LanguageIcon, color: '#4CAF50', label: 'Langues' },
  'social_sciences': { icon: AccountBalanceIcon, color: '#2196F3', label: 'Sciences sociales' },
  'natural_sciences': { icon: ScienceIcon, color: '#FF5722', label: 'Sciences naturelles' },
  'mathematics': { icon: CalculateIcon, color: '#9C27B0', label: 'Mathématiques' },
  'economics': { icon: BusinessIcon, color: '#FFC107', label: 'Économie' },
  'personal_development': { icon: PsychologyIcon, color: '#E91E63', label: 'Développement personnel' },
  'programming': { icon: ComputerIcon, color: '#607D8B', label: 'Programmation' },
  'arts': { icon: BrushIcon, color: '#FF9800', label: 'Arts' },
  'others': { icon: SchoolIcon, color: '#9E9E9E', label: 'Autres' }
};

// --- Composants stylisés (similaires à CapsuleList) ---
const CapsuleCard = styled(Card)(({ theme, domaincolor }) => ({
  height: '100%',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  background: theme.palette.background.paper,
  borderTop: `4px solid ${domaincolor}`,
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  }
}));

const LibraryPage = () => {
  const navigate = useNavigate();
  // --- Récupérer les capsules de l'utilisateur inscrit ---
  const { data: enrolledCapsules, isLoading, isError } = useQuery({
    queryKey: ['my-capsules'], // Clé de query unique pour les capsules de l'utilisateur
    queryFn: async () => {
      const { data } = await apiClient.get('/capsules/me'); // Appel au bon endpoint
      return data;
    }
  });

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Impossible de charger votre bibliothèque. Veuillez réessayer.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* --- En-tête de la page --- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          📚 Ma Bibliothèque
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Retrouvez ici toutes les capsules auxquelles vous êtes inscrit.
        </Typography>
      </Box>

      {/* --- Grille des capsules --- */}
      <Grid container spacing={3}>
        {isLoading ? (
          // Squelettes de chargement
          [...Array(3)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 4 }} />
            </Grid>
          ))
        ) : enrolledCapsules?.length > 0 ? (
          // Affichage des capsules
          enrolledCapsules.map((capsule) => {
            const config = domainConfig[capsule.domain] || domainConfig.others;
            const Icon = config.icon;

            return (
              <Grid item xs={12} sm={6} md={4} key={capsule.id}>
                <CapsuleCard domaincolor={config.color}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Icon sx={{ color: config.color, fontSize: 32, mb: 2 }} />
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      component={RouterLink}
                      to={`/capsule/${capsule.id}`}
                      sx={{ 
                        textDecoration: 'none',
                        color: 'text.primary',
                        display: 'block',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      {capsule.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {config.label}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      component={RouterLink}
                      // On utilise "to" et on retire le "onClick"
                      to={`/capsule/${capsule.domain}/${capsule.area}/${capsule.id}`}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Continuer
                    </Button>
                  </CardActions>
                </CapsuleCard>
              </Grid>
            );
          })
        ) : (
          // Cas où l'utilisateur n'a aucune capsule
          <Grid item xs={12}>
            <Box sx={{ p: 6, textAlign: 'center', background: (theme) => alpha(theme.palette.background.default, 0.5), borderRadius: 3 }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Votre bibliothèque est vide
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inscrivez-vous à des capsules pour les retrouver ici.
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 3 }}
                component={RouterLink}
                to="/capsules"
              >
                Découvrir les capsules
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default LibraryPage;