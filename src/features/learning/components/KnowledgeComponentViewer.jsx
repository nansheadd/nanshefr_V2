// Fichier: src/features/learning/components/KnowledgeComponentViewer.jsx (CORRIGÉ)
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import QcmComponent from './QcmComponent';
// --- AJOUTS ---
import FillInTheBlankComponent from './FillInTheBlankComponent';
import ReorderComponent from './ReorderComponent';
// --------------

const KnowledgeComponentViewer = ({ component, submittedAnswer }) => {

  const renderExercise = () => {
    switch (component.component_type) {
      case 'qcm':
        return <QcmComponent component={component} submittedAnswer={submittedAnswer} />;
      
      // --- LIGNES DÉCOMMENTÉES ET ACTIVÉES ---
      case 'fill_in_the_blank':
        return <FillInTheBlankComponent component={component} />;
      case 'reorder':
        return <ReorderComponent component={component} />;
      // ------------------------------------

      case 'lesson':
        return null; 
      default:
        return <Typography>Exercice non supporté : {component.component_type}</Typography>;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>{component.title}</Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Catégorie: {component.category}
      </Typography>
      <Divider sx={{ my: 2 }} />
      {renderExercise()}
    </Paper>
  );
};

export default KnowledgeComponentViewer;