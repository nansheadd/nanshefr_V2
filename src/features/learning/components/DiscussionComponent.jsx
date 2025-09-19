// Fichier: src/features/learning/components/DiscussionComponent.jsx

import React from 'react';
import { Paper, Typography, Box, Divider } from '@mui/material';

const DiscussionComponent = ({ content }) => {
  let dialogueData;

  if (typeof content === 'string') {
    try {
      dialogueData = JSON.parse(content);
    } catch (e) {
      return <Typography color="error">Erreur d'affichage du dialogue.</Typography>;
    }
  } else {
    dialogueData = content;
  }

  if (!dialogueData || !dialogueData.turns) {
    return <Typography color="text.secondary">Dialogue non disponible.</Typography>;
  }

  return (
    <Paper elevation={2} sx={{ p: 3, my: 2 }}>
      <Typography variant="h6" gutterBottom>{dialogueData.setting || "Dialogue"}</Typography>
      <Divider sx={{ my: 2 }} />
      {dialogueData.turns.map((turn, index) => (
        <Box key={index} sx={{ my: 2, p: 1, borderRadius: 1, background: index % 2 === 0 ? '#f5f5f5' : 'transparent' }}>
          <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
            {turn.speaker}:
          </Typography>
          <Typography component="span" sx={{ ml: 1 }}>
            {turn.text_tl}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {turn.transliteration}
          </Typography>
          <Typography variant="body2" color="primary.main">
            {turn.translation_fr}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

export default DiscussionComponent;