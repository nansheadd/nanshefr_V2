// Fichier: src/features/learning/components/LessonComponent.jsx (CORRIGÉ ET ROBUSTE)

import React from 'react';
import { Paper, Typography } from '@mui/material';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LessonComponent = ({ content: initialContent }) => {
  let parsedContent = initialContent;

  // --- LA CORRECTION EST ICI ---
  // Si le contenu reçu est une chaîne de caractères, on essaie de le parser en JSON.
  if (typeof parsedContent === 'string') {
    try {
      parsedContent = JSON.parse(parsedContent);
    } catch (error) {
      console.error("Erreur de parsing du contenu de la leçon:", error);
      parsedContent = null; // En cas d'erreur, on invalide le contenu.
    }
  }
  // -------------------------

  // La validation se fait maintenant sur le contenu potentiellement parsé.
  if (!parsedContent || typeof parsedContent.lesson_text !== 'string') {
    return (
      <Paper elevation={3} sx={{ p: 3, my: 2 }}>
        <Typography color="error">Contenu de leçon invalide.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2, '& h1, & h2, & h3': { mt: 2, mb: 1 } }}>
      <Markdown remarkPlugins={[remarkGfm]}>
        {parsedContent.lesson_text}
      </Markdown>
    </Paper>
  );
};

export default LessonComponent;