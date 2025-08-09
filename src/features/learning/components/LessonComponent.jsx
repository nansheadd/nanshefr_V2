// Fichier: src/features/learning/components/LessonComponent.jsx
import React from 'react';
import { Typography } from '@mui/material';

const LessonComponent = ({ content }) => {
  // whiteSpace: 'pre-wrap' permet de respecter les sauts de ligne du texte
  return (
    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
      {content.lesson_text || content.text}
    </Typography>
  );
};

export default LessonComponent;