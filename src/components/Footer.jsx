// src/components/Footer.jsx
import React from 'react';
import {
  Box, Container, Stack, Typography, Link as MLink,
  IconButton, Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ColorModeContext } from '../theme/ColorModeContext';

export default function Footer({ compact = false }) {
  const year = new Date().getFullYear();
  const { mode, toggleColorMode } = React.useContext(ColorModeContext);
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        backdropFilter: 'blur(6px)',
        background: 'transparent',
        py: compact ? 2 : 3
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box component="img" src="/logo192.png" alt="logo" sx={{ width: 28, height: 28, borderRadius: '50%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>nanshe</Typography>
          </Stack>

          {!compact && (
            <Stack direction="row" spacing={{ xs: 2, sm: 3 }} flexWrap="wrap">
              <MLink component={RouterLink} to="/about" underline="none" color="text.secondary">À propos</MLink>
              <MLink component={RouterLink} to="/legal" underline="none" color="text.secondary">Mentions légales</MLink>
              <MLink component={RouterLink} to="/privacy" underline="none" color="text.secondary">Confidentialité</MLink>
              <MLink component={RouterLink} to="/contact" underline="none" color="text.secondary">Contact</MLink>
            </Stack>
          )}

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" color="inherit" onClick={toggleColorMode} aria-label="toggle theme">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <IconButton size="small" color="inherit" aria-label="GitHub"><GitHubIcon /></IconButton>
            <IconButton size="small" color="inherit" aria-label="LinkedIn"><LinkedInIcon /></IconButton>
            <IconButton size="small" color="inherit" aria-label="Email"><MailOutlineIcon /></IconButton>
          </Stack>
        </Stack>

        <Divider sx={{ my: compact ? 1.5 : 2, opacity: 0.2 }} />
        <Typography variant="caption" color="text.secondary">© {year} Nanshe — Tous droits réservés.</Typography>
      </Container>
    </Box>
  );
}
