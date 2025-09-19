import React from 'react';
import { Button } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../../api/axiosConfig'; // Votre client API

// Chargez Stripe avec votre clé PUBLIABLE (mettez-la dans vos variables d'environnement)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const GoPremiumButton = () => {
  const handleCheckout = async () => {
    try {
      // 1. Appelez votre backend pour créer une session de paiement
      const { data } = await apiClient.post('/stripe/create-checkout-session');
      const { sessionId } = data;

      // 2. Redirigez l'utilisateur vers la page de paiement Stripe
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Erreur lors du lancement du paiement :", error);
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={handleCheckout}>
      Passer à Premium
    </Button>
  );
};

export default GoPremiumButton;