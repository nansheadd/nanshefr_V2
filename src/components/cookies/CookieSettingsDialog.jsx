// src/consent/CookieSettingsDialog.jsx
import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Switch, FormControlLabel, Typography, Link as MuiLink
} from '@mui/material';
import { useCookieConsent } from './CookieConsentProvider';
import { useI18n } from "../../i18n/I18nContext";
import { Link as RouterLink } from 'react-router-dom';

export default function CookieSettingsDialog() {
  const { consent, settingsOpen, openSettings, save } = useCookieConsent();
  const { language } = useI18n();
  const [analytics, setAnalytics] = React.useState(consent.categories.analytics);

  React.useEffect(() => { setAnalytics(consent.categories.analytics); }, [consent.categories.analytics]);

  const L = {
    fr: {
      title: 'Préférences cookies',
      intro: 'Modifiez vos préférences par catégorie. Les cookies strictement nécessaires sont toujours actifs.',
      necessary: 'Nécessaires',
      necessaryDesc: 'Indispensables au fonctionnement (sécurité, session, langue).',
      analytics: 'Mesure d’audience (Analytics)',
      analyticsDesc: 'Aide à comprendre l’usage pour améliorer le produit.',
      save: 'Enregistrer',
      cancel: 'Annuler',
      policy: 'Politique cookies'
    },
    en: {
      title: 'Cookie preferences',
      intro: 'Adjust preferences by category. Strictly necessary cookies are always on.',
      necessary: 'Necessary',
      necessaryDesc: 'Required for core functions (security, session, language).',
      analytics: 'Analytics',
      analyticsDesc: 'Helps us understand usage to improve the product.',
      save: 'Save',
      cancel: 'Cancel',
      policy: 'Cookie Policy'
    },
    nl: {
      title: 'Cookie-voorkeuren',
      intro: 'Pas uw voorkeuren per categorie aan. Strikt noodzakelijke cookies staan altijd aan.',
      necessary: 'Noodzakelijk',
      necessaryDesc: 'Vereist voor basisfuncties (beveiliging, sessie, taal).',
      analytics: 'Analytics',
      analyticsDesc: 'Helpt ons het gebruik te begrijpen en te verbeteren.',
      save: 'Opslaan',
      cancel: 'Annuleren',
      policy: 'Cookiebeleid'
    }
  }[language || 'fr'];

  return (
    <Dialog open={settingsOpen} onClose={() => openSettings(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{L.title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {L.intro}{' '}
          <MuiLink component={RouterLink} to="/legal/cookies" underline="hover">
            {L.policy}
          </MuiLink>
          .
        </Typography>

        <Stack spacing={1.5}>
          <Stack>
            <FormControlLabel control={<Switch checked disabled />} label={L.necessary} />
            <Typography variant="caption" color="text.secondary" sx={{ pl: 5 }}>{L.necessaryDesc}</Typography>
          </Stack>

          <Stack>
            <FormControlLabel
              control={<Switch checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />}
              label={L.analytics}
            />
            <Typography variant="caption" color="text.secondary" sx={{ pl: 5 }}>{L.analyticsDesc}</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => openSettings(false)}>{L.cancel}</Button>
        <Button variant="contained" onClick={() => save({ analytics })}>{L.save}</Button>
      </DialogActions>
    </Dialog>
  );
}
