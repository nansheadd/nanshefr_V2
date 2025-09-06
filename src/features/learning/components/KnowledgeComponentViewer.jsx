import React from 'react';
import LessonDisplay from './LessonDisplay';
import VocabularyDisplay from './VocabularyDisplay';
import CharacterDisplay from './CharacterDisplay';
import { Box, Typography } from '@mui/material';

const KnowledgeComponentViewer = ({ component }) => {
  // Le 'component' ici est un 'Atom' de notre backend
  const { type, content } = component;

  switch (type) {
    case 'lesson':
      return <LessonDisplay content={content} />;
    case 'vocabulary':
      return <VocabularyDisplay content={content} />;
    case 'character':
      return <CharacterDisplay content={content} />;
    
    // Ajoutez ici les autres types d'atomes (quiz, exercise, etc.) au fur et à mesure
    
    default:
      return (
        <Box sx={{ my: 2, p: 2, border: '1px dashed grey' }}>
          <Typography color="text.secondary">
            Composant de type '{type}' non encore implémenté.
          </Typography>
        </Box>
      );
  }
};

export default KnowledgeComponentViewer;