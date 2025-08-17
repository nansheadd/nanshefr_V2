// Fichier: src/features/learning/components/KnowledgeComponentViewer.jsx (FINAL CORRIGÉ ET MIS À JOUR)
import React from 'react';
import { Typography, Paper, Divider } from '@mui/material';

// Imports des composants d'exercices existants
import QcmComponent from './QcmComponent';
import FillInTheBlankComponent from './FillInTheBlankComponent';
import ReorderComponent from './ReorderComponent';
import WritingComponent from './WritingComponent';
import QuizComponent from './QuizComponent';
import EssayComponent from './EssayComponent';
import DiscussionComponent from './DiscussionComponent';

// --- IMPORTS DES NOUVEAUX COMPOSANTS DE LANGUE ---
import CharacterRecognitionComponent from './CharacterRecognitionComponent';
import AssociationDragDropComponent from './AssociationDragDropComponent';
import SentenceConstructionComponent from './SentenceConstructionComponent';

const KnowledgeComponentViewer = ({ component, submittedAnswer }) => {

  const renderExercise = () => {
    // On met le type en minuscule pour être insensible à la casse, c'est une bonne pratique
    const componentType = component.component_type.toLowerCase();

    switch (componentType) {
      // --- Composants de base ---
      case 'qcm':
        return <QcmComponent component={component} submittedAnswer={submittedAnswer} />;
      
      case 'fill_in_the_blank':
        return <FillInTheBlankComponent component={component} submittedAnswer={submittedAnswer} />;
        
      case 'reorder':
        return <ReorderComponent component={component} submittedAnswer={submittedAnswer} />;

      case 'quiz':
        return <QuizComponent component={component} submittedAnswer={submittedAnswer} />;

      // --- Composants de rédaction / analyse ---
      case 'rédaction': // Alias français
      case 'writing':
        return <WritingComponent component={component} submittedAnswer={submittedAnswer} />;
      
      case 'essai': // Alias français
      case 'essay':
        return <EssayComponent component={component} submittedAnswer={submittedAnswer} />;

      case 'discussion':
        return <DiscussionComponent component={component} submittedAnswer={submittedAnswer} />;

      // --- NOUVEAUX COMPOSANTS SPÉCIFIQUES AUX LANGUES ---
      case 'character_recognition':
        return <CharacterRecognitionComponent component={component} submittedAnswer={submittedAnswer} />;
      
      case 'association_drag_drop':
      case 'drag_drop': // <-- On ajoute un alias pour ce cas
        return <AssociationDragDropComponent component={component} submittedAnswer={submittedAnswer} />;

      case 'sentence_construction':
        return <SentenceConstructionComponent component={component} submittedAnswer={submittedAnswer} />;
      // ----------------------------------------------------

      case 'lesson': // Leçon n'est pas un exercice, on ne rend rien
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