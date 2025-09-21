import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CoachIA from '../components/CoachIA';
import NotesPad from '../components/NotesPad';

const ToolboxHubPage = () => {
  const dispatchToolEvent = (tool, expand = false) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('nanshe:toolbox-open', {
        detail: { tool, expand },
      })
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Boîte à outils IA
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Utilise les outils avancés de Nanshe dans un espace dédié. Passe en plein écran, garde tes notes à jour et discute avec ton coach IA.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SmartToyIcon />}
            onClick={() => dispatchToolEvent('coach', true)}
          >
            Ouvrir le coach en modal
          </Button>
          <Button
            variant="contained"
            color="info"
            startIcon={<EditNoteIcon />}
            onClick={() => dispatchToolEvent('notes', true)}
          >
            Ouvrir le bloc-notes en modal
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Box sx={{ flexGrow: 1 }}>
            <CoachIA layout="page" onExpand={() => dispatchToolEvent('coach', true)} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
          <Box sx={{ flexGrow: 1 }}>
            <NotesPad layout="page" onExpand={() => dispatchToolEvent('notes', true)} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ToolboxHubPage;
