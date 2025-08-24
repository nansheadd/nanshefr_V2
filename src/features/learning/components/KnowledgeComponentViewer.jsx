// Fichier: src/features/learning/components/KnowledgeComponentViewer.jsx (FINAL)
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
import FeedbackButtons from './FeedbackButtons';

// --- IMPORTS DES NOUVEAUX COMPOSANTS DE LANGUE ---
import CharacterRecognitionComponent from './CharacterRecognitionComponent';
import AssociationDragDropComponent from './AssociationDragDropComponent';
import SentenceConstructionComponent from './SentenceConstructionComponent';

const KnowledgeComponentViewer = ({ component, submittedAnswer, initialVote, onFeedbackSuccess }) => {

  const renderExercise = () => {
    // On met le type en minuscule pour être insensible à la casse
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

      // --- NOUVEAUX TYPES PHILOSOPHIQUES MAPPÉS SUR DES COMPOSANTS EXISTANTS ---
      case 'argument_analysis': // <- Nouveau type
      case 'rédaction':
      case 'writing':
        return <WritingComponent component={component} submittedAnswer={submittedAnswer} />;
      
      case 'essai':
      case 'essay':
        return <EssayComponent component={component} submittedAnswer={submittedAnswer} />;

      case 'discussion':
        return <DiscussionComponent component={component} submittedAnswer={submittedAnswer} />;
      
      // --- COMPOSANTS SPÉCIFIQUES AUX LANGUES ---
      case 'character_recognition':
        return <CharacterRecognitionComponent component={component} submittedAnswer={submittedAnswer} />;
      
      case 'association_drag_drop':
      case 'drag_drop':
        return <AssociationDragDropComponent component={component} submittedAnswer={submittedAnswer} />;

      case 'sentence_construction':
        return <SentenceConstructionComponent component={component} submittedAnswer={submittedAnswer} />;
      
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
      <FeedbackButtons 
                contentType="knowledge_component" 
                contentId={component.id} 
                initialVote={initialVote}
                onSuccess={onFeedbackSuccess}
            />
      <Typography variant="caption" color="text.secondary" display="block">
        Catégorie: {component.category}
      </Typography>
      <Divider sx={{ my: 2 }} />
      {renderExercise()}
    </Paper>
  );
};

export default KnowledgeComponentViewer;