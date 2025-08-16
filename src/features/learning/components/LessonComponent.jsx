// Fichier: src/features/learning/components/LessonComponent.jsx (VERSION CORRIGÉE)
import React from 'react';
import { Box, Typography } from '@mui/material';

// Affiche une leçon de langue à partir d'un JSON éventuellement sérialisé.
const LessonComponent = ({ content }) => {
  let lesson;
  try {
    // Certains backend renvoient un JSON sous forme de chaîne
    lesson =
      typeof content.lesson_text === 'string'
        ? JSON.parse(content.lesson_text)
        : content.lesson_text || content.text || {};
  } catch {
    return <Typography variant="body1">Contenu de leçon invalide.</Typography>;
  }

  const turns = lesson?.turns || [];

  if (!Array.isArray(turns) || turns.length === 0) {
    return (
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        {content.lesson_text || content.text}
      </Typography>
    );
  }

  return (
    <Box sx={{ lineHeight: 1.7 }}>
      {lesson?.setting && (
        <Typography variant="subtitle1" gutterBottom>
          {lesson.setting}
        </Typography>
      )}

      {turns.map((turn, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="subtitle2">{turn.speaker}</Typography>
          <Typography variant="body1">{turn.text_tl}</Typography>

          {turn.transliteration && (
            <Typography variant="body2" color="text.secondary">
              {turn.transliteration}
            </Typography>
          )}

          {turn.translation_fr && (
            <Typography variant="body2" color="text.secondary">
              {turn.translation_fr}
            </Typography>
          )}

          {/* --- BLOC SUPPRIMÉ ---
              Le code qui affichait les vocab_refs et grammar_refs a été retiré d'ici.
              On garde l'affichage des notes culturelles car elles sont utiles.
          --- FIN DE LA MODIFICATION --- */}
          {turn.notes_fr && (
            <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" display="block">
                  {turn.notes_fr}
                </Typography>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default LessonComponent;