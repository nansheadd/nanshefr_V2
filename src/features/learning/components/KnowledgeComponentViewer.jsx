// Fichier: src/features/learning/components/KnowledgeComponentViewer.jsx (FINAL)
import React from 'react';
import { Typography, Paper, Divider } from '@mui/material';
import QcmComponent from './QcmComponent';
import FillInTheBlankComponent from './FillInTheBlankComponent';
import ReorderComponent from './ReorderComponent';
import WritingComponent from './WritingComponent';
import QuizComponent from './QuizComponent'; // <-- Nouvel import
import EssayComponent from './EssayComponent'; // <-- Nouvel import
import DiscussionComponent from './DiscussionComponent'; // <-- Nouvel import

const KnowledgeComponentViewer = ({ component, submittedAnswer }) => {

  const renderExercise = () => {
    // On met le type en minuscule pour être insensible à la casse
    const componentType = component.component_type.toLowerCase();

    switch (componentType) {
      case 'qcm':
        return <QcmComponent component={component} submittedAnswer={submittedAnswer} />;
      
      case 'fill_in_the_blank':
        return <FillInTheBlankComponent component={component} submittedAnswer={submittedAnswer}/>;
        
      case 'reorder':
        return <ReorderComponent component={component} submittedAnswer={submittedAnswer} />;

      case 'rédaction':
      case 'writing':
        return <WritingComponent component={component} submittedAnswer={submittedAnswer} />;

      // --- NOUVEAUX CAS GÉRÉS ---
      case 'quiz':
        return <QuizComponent component={component} submittedAnswer={submittedAnswer} />;
      
      case 'essai':
      case 'essay':
        return <EssayComponent component={component} submittedAnswer={submittedAnswer} />;

      case 'discussion':
        return <DiscussionComponent component={component} submittedAnswer={submittedAnswer} />;
      // --------------------------

      case 'lesson':
        return null; 
        
      default:
        return <Typography color="error">Exercice non supporté : {component.component_type}</Typography>;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {component.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Catégorie: {component.category}
      </Typography>
      <Divider sx={{ my: 2 }} />
      {renderExercise()}
    </Paper>
  );
};

export default KnowledgeComponentViewer;