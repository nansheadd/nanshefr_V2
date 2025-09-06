// Fichier: src/features/learning/components/AtomViewer.jsx
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';

import { Paper, Typography, Box, Button, Divider, List, ListItem, ListItemText } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Composant pour l'atome de type Leçon
const LessonAtom = ({ content }) => (
  <Box sx={{ typography: 'body1', '& p': { my: 1.5 } }}>
    <ReactMarkdown>{content.text}</ReactMarkdown>
  </Box>
);

// Composant pour l'atome de type Vocabulaire
const VocabularyAtom = ({ content }) => (
  <List dense>
    {content.items?.map((item, index) => (
      <React.Fragment key={index}>
        <ListItem>
          <ListItemText 
            primary={<Typography variant="h6" component="span">{item.word} ({item.reading})</Typography>} 
            secondary={item.meaning} 
          />
        </ListItem>
        {index < content.items.length - 1 && <Divider component="li" />}
      </React.Fragment>
    ))}
  </List>
);

// Composant principal qui choisit le bon afficheur
const AtomViewer = ({ atom }) => {
  const queryClient = useQueryClient();

  // Mutation pour marquer l'atome comme complété
  const completeAtomMutation = useMutation({
    mutationFn: (atomId) => apiClient.post(`/capsules/atom/${atomId}/complete`),
    onSuccess: () => {
      // On pourrait invalider des requêtes ici si on affiche la progression
      queryClient.invalidateQueries(['atomProgress', atom.id]);
      console.log(`Atome ${atom.id} marqué comme complété !`);
    },
    onError: (error) => {
      console.error("Erreur lors de la complétion de l'atome", error);
    }
  });

  const renderAtomContent = () => {
    switch (atom.content_type) {
      case 'lesson':
        return <LessonAtom content={atom.content} />;
      case 'vocabulary':
        return <VocabularyAtom content={atom.content} />;
      // Ajoutez des 'case' ici pour les autres types d'atomes (QUIZ, DIALOGUE, etc.)
      default:
        return <Typography color="error">Type d'atome inconnu: {atom.content_type}</Typography>;
    }
  };

  return (
    <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden' }}>
      <Box sx={{ p: 3, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" component="h2">
          {atom.title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {renderAtomContent()}
      </Box>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'right', bgcolor: 'background.paper' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircleIcon />}
          onClick={() => completeAtomMutation.mutate(atom.id)}
          disabled={completeAtomMutation.isPending}
        >
          J'ai terminé
        </Button>
      </Box>
    </Paper>
  );
};

export default AtomViewer;