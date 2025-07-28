// Fichier: src/features/learning/components/LessonComponent.jsx (CORRIGÉ)
import React from 'react';
import { Typography } from '@mui/material';

const LessonComponent = ({ content }) => {
  return (
    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
      {content.text}
    </Typography>
  );
};

export default LessonComponent; // <-- LA CORRECTION EST ICI