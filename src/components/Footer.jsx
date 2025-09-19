// src/components/Footer.jsx
import * as React from 'react';
import { Container, Box, Stack, Divider, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { useCookieConsent } from './cookies/CookieConsentProvider';

export default function Footer({ compact = false }) {
  const { language } = useI18n(); // pour choisir les libellés
  const { openSettings } = useCookieConsent();

  const L = {
    fr: {
      legal: 'Mentions légales',
      privacy: 'Politique de confidentialité',
      cookies: 'Politique cookies',
      terms: 'CGU/CGV',
      report: 'Signaler un contenu',
      prefs: 'Préférences cookies',
      about: 'À propos',
      blog: 'Blog',
      contact: 'Contact'
    },
    en: {
      legal: 'Legal Notice',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      terms: 'Terms',
      report: 'Report content',
      prefs: 'Cookie preferences',
      about: 'About',
      blog: 'Blog',
      contact: 'Contact'
    },
    nl: {
      legal: 'Wettelijke vermeldingen',
      privacy: 'Privacybeleid',
      cookies: 'Cookiebeleid',
      terms: 'Algemene voorwaarden',
      report: 'Onwettige inhoud melden',
      prefs: 'Cookie-voorkeuren',
      about: 'Over ons',
      blog: 'Blog',
      contact: 'Contact'
    }
  }[language || 'fr'];

  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: compact ? 2 : 4 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              component="img"
              src="/logo192.png"
              alt="Nanshe"
              sx={{ width: 28, height: 28, borderRadius: 1 }}
            />
            <Typography variant="body2" fontWeight={700}>
              © {year} Nanshe
            </Typography>
          </Stack>

          {/* Liens “produit” éventuels */}
          {!compact && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <MuiLink component={RouterLink} to="/#about" underline="hover">{L.about}</MuiLink>
              <MuiLink component={RouterLink} to="/#blog" underline="hover">{L.blog}</MuiLink>
              <MuiLink component={RouterLink} to="/#contact" underline="hover">{L.contact}</MuiLink>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ my: compact ? 1.5 : 2.5 }} />

        {/* Liens légaux */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <MuiLink component={RouterLink} to="/legal/notice" underline="hover">{L.legal}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/privacy" underline="hover">{L.privacy}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/cookies" underline="hover">{L.cookies}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/terms" underline="hover">{L.terms}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/report" underline="hover">{L.report}</MuiLink>
          <MuiLink
            component="button"
            type="button"
            underline="hover"
            onClick={() => openSettings(true)}
            sx={{ ml: { xs: 0, sm: 'auto' } }}
          >
            {L.prefs}
          </MuiLink>
        </Stack>
      </Container>
    </Box>
  );
}
