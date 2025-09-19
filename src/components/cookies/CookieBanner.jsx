// src/consent/CookieBanner.jsx
import * as React from 'react';
import { Paper, Container, Stack, Button, Typography } from '@mui/material';
import { useCookieConsent } from './CookieConsentProvider';
import { useI18n } from '../../i18n/I18nContext';

export default function CookieBanner() {
  const { consent, acceptAll, rejectAll, openSettings } = useCookieConsent();
  const { language } = useI18n();

  if (consent.decided) return null;

  const L = {
    fr: {
      title: 'Gestion des cookies',
      text: 'Nous utilisons des cookies nécessaires pour faire fonctionner le site, et des cookies de mesure (analytics) facultatifs. Vous pouvez choisir librement.',
      accept: 'Tout accepter',
      reject: 'Tout refuser',
      customize: 'Personnaliser'
    },
    en: {
      title: 'Cookie management',
      text: 'We use necessary cookies to run the site, and optional analytics cookies. You can choose freely.',
      accept: 'Accept all',
      reject: 'Reject all',
      customize: 'Customise'
    },
    nl: {
      title: 'Cookiebeheer',
      text: 'Wij gebruiken noodzakelijke cookies voor de werking en optionele analytische cookies. U kiest vrij.',
      accept: 'Alles accepteren',
      reject: 'Alles weigeren',
      customize: 'Personaliseren'
    }
  }[language || 'fr'];

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 2000,
        py: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={800}>{L.title}</Typography>
            <Typography variant="body2" color="text.secondary">{L.text}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" onClick={rejectAll}>{L.reject}</Button>
            <Button variant="outlined" onClick={() => openSettings(true)}>{L.customize}</Button>
            <Button variant="contained" onClick={acceptAll}>{L.accept}</Button>
          </Stack>
        </Stack>
      </Container>
    </Paper>
  );
}
