// src/components/Footer.jsx
import * as React from 'react';
import { Container, Box, Stack, Divider, Typography, Link as MuiLink, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { useCookieConsent } from './cookies/CookieConsentProvider';
import { ColorModeContext } from '../theme/ColorModeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function Footer({ compact = false }) {
  const { language, setLanguage, t } = useI18n();
  const colorMode = React.useContext(ColorModeContext);
  const { openSettings } = useCookieConsent();

  const themeIsDark = colorMode?.mode === 'dark';

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
              <MuiLink component={RouterLink} to="/#about" underline="hover">{t('footer.about')}</MuiLink>
              <MuiLink component={RouterLink} to="/#blog" underline="hover">{t('footer.blog')}</MuiLink>
              <MuiLink component={RouterLink} to="/#contact" underline="hover">{t('footer.contact')}</MuiLink>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ my: compact ? 1.5 : 2.5 }} />

        {/* Liens légaux */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <MuiLink component={RouterLink} to="/legal/notice" underline="hover">{t('footer.legal')}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/privacy" underline="hover">{t('footer.privacy')}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/cookies" underline="hover">{t('footer.cookies')}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/terms" underline="hover">{t('footer.terms')}</MuiLink>
          <MuiLink component={RouterLink} to="/legal/report" underline="hover">{t('footer.report')}</MuiLink>
          <MuiLink
            component="button"
            type="button"
            underline="hover"
            onClick={() => openSettings(true)}
            sx={{ ml: { xs: 0, sm: 'auto' } }}
          >
            {t('footer.preferences')}
          </MuiLink>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="flex-end"
          sx={{ mt: compact ? 2 : 3 }}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="footer-language-label">{t('footer.controls.language')}</InputLabel>
            <Select
              labelId="footer-language-label"
              label={t('footer.controls.language')}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              inputProps={{ 'aria-label': t('footer.controls.language') }}
            >
              <MenuItem value="fr">🇫🇷 Français</MenuItem>
              <MenuItem value="en">🇬🇧 English</MenuItem>
              <MenuItem value="nl">🇳🇱 Nederlands</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {t('footer.controls.theme')}
            </Typography>
            <IconButton onClick={colorMode?.toggleColorMode || (() => {})} color="inherit" disabled={!colorMode}>
              {themeIsDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Typography variant="caption" color="text.secondary">
              {themeIsDark ? t('footer.controls.themeDark') : t('footer.controls.themeLight')}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
