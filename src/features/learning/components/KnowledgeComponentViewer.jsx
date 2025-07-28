// Fichier: src/features/learning/components/KnowledgeComponentViewer.jsx (FINAL)
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

// On importe tous nos types d'exercices
import LessonComponent from './LessonComponent';
import QcmComponent from './QcmComponent';
import FillInTheBlankComponent from './FillInTheBlankComponent';
import ReorderComponent from './ReorderComponent';
// import CategorizationComponent from './CategorizationComponent'; // On le prépare pour plus tard

const KnowledgeComponentViewer = ({ component }) => {
  // Cette fonction est le "cerveau" qui choisit le bon composant à afficher
  const renderComponent = () => {
    switch (component.component_type) {
      case 'lesson':
        return <LessonComponent content={component.content_json} />;
      
      case 'qcm':
        return <QcmComponent component={component} />;
        
      case 'fill_in_the_blank':
        return <FillInTheBlankComponent component={component} />;

      // --- ON AJOUTE NOS NOUVEAUX CAS ICI ---
      case 'reorder':
        return <ReorderComponent component={component} />;

      // case 'categorization':
      //   return <CategorizationComponent component={component} />;
      // ------------------------------------

      default:
        return <Typography>Type de composant non supporté : {component.component_type}</Typography>;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>{component.title}</Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Catégorie: {component.category}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box>
        {renderComponent()}
      </Box>
    </Paper>
  );
};

export default KnowledgeComponentViewer;