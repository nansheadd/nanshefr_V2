import React from 'react';
import { Box, Paper, Typography, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../../../api/axiosConfig'; // Assurez-vous que le chemin est correct

// Chargez Stripe avec votre clé PUBLIABLE (à mettre dans un fichier .env.local)
// VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Le bouton de paiement est un sous-composant
const GoPremiumButton = () => {
  const [isLoading, setIsLoading] = React.useState(false);

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
      {isLoading ? 'Chargement...' : 'Je m\'abonne'}
    </Button>
  );
};

// La page principale
const SubscriptionPage = () => {
  const premiumFeatures = [
    "Accès illimité à toutes les capsules",
    "Support prioritaire par email",
    "Génération de cours sur mesure avec l'IA",
    "Badge exclusif 'Membre Premium'",
  ];

  return (
    <Box sx={{ maxWidth: '600px', mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
        Passez à Nanshe Premium
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Débloquez tout le potentiel de votre apprentissage.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" component="p" gutterBottom>
          10€ <Typography component="span" variant="body1" color="text.secondary">/ mois</Typography>
        </Typography>

        <List sx={{ textAlign: 'left', my: 3 }}>
          {premiumFeatures.map((feature) => (
            <ListItem key={feature} disablePadding>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>
        
        <GoPremiumButton />
        
        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.disabled' }}>
          Annulez à tout moment.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SubscriptionPage;