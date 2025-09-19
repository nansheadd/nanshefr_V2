import * as React from 'react';
import { Typography, List, ListItem, Alert } from '@mui/material';
import LegalLayout from './LegalLayout';
import { useAppLanguage } from './_useAppLanguage';

export default function CookiesPolicyPage() {
  const lang = useAppLanguage();
  const title = { fr: 'Politique cookies', en: 'Cookie Policy', nl: 'Cookiebeleid' };

  const blocks = {
    fr: (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          Nous n’installons aucun cookie non nécessaire sans votre consentement. Vous pouvez accepter, refuser ou personnaliser à tout moment.
        </Alert>
        <Typography variant="h4">Que sont les cookies ?</Typography>
        <Typography>Petits fichiers déposés dans votre navigateur. Ils peuvent être nécessaires (techniques) ou optionnels (mesure d’audience, etc.).</Typography>

        <Typography variant="h4">Nos catégories</Typography>
        <List>
          <ListItem><strong>Nécessaires</strong> : pour la sécurité, la session et les préférences (ex. langue, thème).</ListItem>
          <ListItem><strong>Mesure d’audience</strong> (GA4, désactivé par défaut) : uniquement après consentement, avec paramètres respectueux (IP anonymisée, durée courte).</ListItem>
        </List>

        <Typography variant="h4">Votre choix</Typography>
        <Typography>
          Bandeau avec « Tout accepter / Tout refuser / Personnaliser ». Vous pouvez revenir sur votre choix via le lien « Modifier mes préférences cookies » en pied de page.
        </Typography>

        <Typography variant="h4">Durées</Typography>
        <Typography>Les cookies nécessaires expirent vite (session) ou quelques mois. Les cookies d’audience sont limités (ex. 13 mois).</Typography>
      </>
    ),
    en: (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          We do not set any non‑essential cookies without your consent. You can accept, refuse or customise at any time.
        </Alert>
        <Typography variant="h4">What are cookies?</Typography>
        <Typography>Small files placed in your browser. They can be necessary (technical) or optional (analytics, etc.).</Typography>

        <Typography variant="h4">Categories we use</Typography>
        <List>
          <ListItem><strong>Necessary</strong>: security, session and preferences (e.g., language, theme).</ListItem>
          <ListItem><strong>Analytics</strong> (GA4, opt‑in): only after consent, with privacy‑friendly settings (IP anonymised, short retention).</ListItem>
        </List>

        <Typography variant="h4">Your choice</Typography>
        <Typography>
          Banner with “Accept all / Reject all / Customise”. You can change your choice anytime via “Cookie preferences” in the footer.
        </Typography>

        <Typography variant="h4">Retention</Typography>
        <Typography>Necessary cookies expire quickly (session) or after a few months. Analytics are limited (e.g., 13 months).</Typography>
      </>
    ),
    nl: (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          Wij plaatsen geen niet‑essentiële cookies zonder uw toestemming. U kunt op elk moment aanvaarden, weigeren of personaliseren.
        </Alert>
        <Typography variant="h4">Wat zijn cookies?</Typography>
        <Typography>Kleine bestanden in uw browser. Ze kunnen noodzakelijk zijn (technisch) of optioneel (analytics).</Typography>

        <Typography variant="h4">Categorieën</Typography>
        <List>
          <ListItem><strong>Noodzakelijk</strong>: beveiliging, sessie, voorkeuren (taal, thema).</ListItem>
          <ListItem><strong>Analytics</strong> (GA4, opt‑in): enkel na toestemming, met privacyvriendelijke instellingen.</ListItem>
        </List>

        <Typography variant="h4">Uw keuze</Typography>
        <Typography>
          Banner met “Alles accepteren / Alles weigeren / Personaliseren”. U kunt uw keuze steeds wijzigen via “Cookie‑voorkeuren” in de footer.
        </Typography>

        <Typography variant="h4">Bewaartermijnen</Typography>
        <Typography>Noodzakelijke cookies verlopen snel (sessie) of na enkele maanden. Analytics maximaal beperkt (bv. 13 maanden).</Typography>
      </>
    ),
  };

  return (
    <LegalLayout title={title} updatedAt={new Date().toISOString()}>
      {blocks[lang]}
    </LegalLayout>
  );
}