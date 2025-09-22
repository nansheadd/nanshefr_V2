import React from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Link as RouterLink } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../../../api/axiosConfig'; // Assurez-vous que le chemin est correct
import { useI18n } from '../../../i18n/I18nContext';

// Chargez Stripe avec votre clé PUBLIABLE (à mettre dans un fichier .env.local)
// VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Le bouton de paiement est un sous-composant
const GoPremiumButton = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useI18n();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // 1. Appelle votre backend pour créer une session de paiement
      const { data } = await apiClient.post('/stripe/create-checkout-session');
      const { sessionId } = data;

      // 2. Redirige l'utilisateur vers la page de paiement hébergée par Stripe
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error("Erreur de redirection Stripe :", error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erreur lors de la création de la session de paiement :", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={handleCheckout}
      disabled={isLoading}
      sx={{ mt: 2, py: 1.5, textTransform: 'none', fontSize: '1.1rem' }}
    >
      {isLoading ? t('premium.actions.loading') : t('premium.actions.goPremium')}
    </Button>
  );
};

// La page principale
const SubscriptionPage = () => {
  const { t } = useI18n();
  const translatedFeatures = t('premium.features');
  const featureMatrix = Array.isArray(translatedFeatures) ? translatedFeatures : [];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
          {t('premium.hero.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth="720px" mx="auto">
          {t('premium.hero.subtitle')}
        </Typography>
        <Typography variant="body2" color="primary.main" sx={{ mt: 2 }}>
          {`${t('premium.comingSoon.pdf')} (${t('common.soon')})`}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button component={RouterLink} to="/capsules" variant="outlined" size="large" startIcon={<BoltIcon />}>
            {t('premium.hero.ctaFree')}
          </Button>
          <Button component={RouterLink} to="/capsules" variant="contained" color="primary" size="large" startIcon={<StarIcon />} sx={{ textTransform: 'none' }}>
            {t('premium.hero.ctaCreate')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 4, height: '100%', borderRadius: 4 }}>
            <Typography variant="overline" color="text.secondary">{t('premium.pricing.free.title')}</Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>{t('premium.pricing.free.price')}</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t('premium.pricing.free.description')}
            </Typography>
            <List dense sx={{ textAlign: 'left' }}>
              {featureMatrix.filter((f) => f.free).map((feature) => (
                <ListItem key={feature.label} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={feature.label} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
            <Button
              fullWidth
              component={RouterLink}
              to="/capsules"
              variant="outlined"
              sx={{ mt: 3, textTransform: 'none' }}
            >
              {t('premium.pricing.free.button')}
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              height: '100%',
              borderRadius: 4,
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(96,80,220,0.1), rgba(96,80,220,0.6))',
              border: '1px solid rgba(96,80,220,0.3)',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <WorkspacePremiumIcon color="primary" />
              <Typography variant="overline" color="primary">{t('premium.pricing.premium.title')}</Typography>
            </Stack>
            <Typography variant="h4" fontWeight={800}>
              {t('premium.pricing.premium.price')} <Typography component="span" variant="h6">{t('premium.pricing.premium.perMonth')}</Typography>
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {t('premium.pricing.premium.description')}
            </Typography>
            <List dense sx={{ textAlign: 'left' }}>
              {featureMatrix.filter((f) => f.premium).map((feature) => (
                <ListItem key={feature.label} disablePadding sx={{ mb: 1.2 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={feature.label} primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }} />
                </ListItem>
              ))}
            </List>
            <Typography variant="body2" color="primary.main" sx={{ mt: 1.5 }}>
              {`${t('premium.comingSoon.pdf')} (${t('common.soon')})`}
            </Typography>
            <GoPremiumButton />
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              {t('premium.pricing.premium.note')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ mt: 6, borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', bgcolor: 'background.paper', p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
            {t('premium.table.headerFeatures')}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} textAlign="center" sx={{ flex: 1 }}>
            {t('premium.table.freeColumn')}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} textAlign="center" sx={{ flex: 1 }}>
            {t('premium.table.premiumColumn')}
          </Typography>
        </Box>
        <Divider />
        {featureMatrix.map((feature) => (
          <Box key={feature.label} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
            <Typography sx={{ flex: 1 }}>{feature.label}</Typography>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              {feature.free ? <CheckCircleIcon color="success" fontSize="small" /> : <RemoveCircleOutlineIcon color="disabled" fontSize="small" />}
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              {feature.comingSoon ? (
                <Chip label={t('common.soon')} size="small" color="warning" variant="outlined" />
              ) : feature.premium ? (
                <CheckCircleIcon color="primary" fontSize="small" />
              ) : (
                <RemoveCircleOutlineIcon color="disabled" fontSize="small" />
              )}
            </Box>
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default SubscriptionPage;
