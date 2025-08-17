// Fichier: src/features/toolbox/components/Toolbox.jsx (MIS À JOUR)
import React, { useState } from 'react';
import { Box, Fab, Stack, IconButton, Grow, Paper, Tooltip, Slide } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';

import CoachIA from './CoachIA'; // Importer le composant de chat

const Toolbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null); // 'coach' | 'notes' | null
  const theme = useTheme();

  const toggleTool = (toolName) => {
    if (activeTool === toolName) {
      setActiveTool(null); // Ferme l'outil si on reclique dessus
    } else {
      setActiveTool(toolName);
      setIsOpen(false); // Referme la barre d'icônes
    }
  };

  const handleFabClick = () => {
      if (activeTool) {
          setActiveTool(null); // Si un outil est ouvert, le Fab le ferme
      } else {
          setIsOpen(!isOpen); // Sinon, il ouvre/ferme la barre d'icônes
      }
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Fenêtre de l'outil actif */}
      <Slide direction="up" in={activeTool === 'coach'} mountOnEnter unmountOnExit>
        <Box sx={{ mb: 2 }}>
            <CoachIA />
        </Box>
      </Slide>
      
      {/* ... (ici viendra la fenêtre pour les notes) ... */}

      {/* Barre d'outils et bulle principale */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Grow in={isOpen}>
          <Paper elevation={4} sx={{ display: 'flex', p: 1, borderRadius: '28px', bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(8px)' }}>
            <Tooltip title="Coach IA">
              <IconButton onClick={() => toggleTool('coach')}>
                <SmartToyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Prise de Notes">
              <IconButton onClick={() => console.log('Notes cliqué')}>
                <EditNoteIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        </Grow>

        <Fab color="primary" aria-label="toggle toolbox" onClick={handleFabClick} sx={{ boxShadow: theme.shadows[6] }}>
          {isOpen || activeTool ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Stack>
    </Box>
  );
};

export default Toolbox;