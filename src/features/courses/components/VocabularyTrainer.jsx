// Fichier: src/features/courses/components/VocabularyTrainer.jsx (NOUVEAU)
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Button, Typography, Paper, CircularProgress, Alert, Card, CardContent, CardActions } from '@mui/material';

// Récupère tout le vocabulaire du cours
const fetchCourseVocabulary = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}/vocabulary`);
  return data;
};

// Simple composant de Flashcard pour commencer
const Flashcard = ({ word, onAnswer }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        if (!isFlipped) {
            setIsFlipped(true);
        }
    };
    
    // Une fois retournée, on passe au mot suivant après un délai
    if (isFlipped) {
        setTimeout(() => {
            setIsFlipped(false);
            onAnswer(); // Passe au mot suivant
        }, 2000); // Délai de 2 secondes pour lire la réponse
    }

    return (
        <Card sx={{ minWidth: 275, cursor: 'pointer' }} onClick={handleFlip}>
            <CardContent sx={{ textAlign: 'center', minHeight: 150, display: 'grid', placeItems: 'center' }}>
                <Typography variant="h4">
                    {isFlipped ? word.translation : word.term}
                </Typography>
                <Typography color="text.secondary">
                    {isFlipped ? word.pronunciation : ''}
                </Typography>
            </CardContent>
        </Card>
    );
};


const VocabularyTrainer = ({ courseId }) => {
  const { data: vocabulary, isLoading, isError } = useQuery({
    queryKey: ['courseVocabulary', courseId],
    queryFn: () => fetchCourseVocabulary(courseId),
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) return <CircularProgress />;
  if (isError) return <Alert severity="error">Impossible de charger le vocabulaire.</Alert>;
  if (!vocabulary || vocabulary.length === 0) return null;

  const handleNextWord = () => {
      setCurrentIndex(prev => (prev + 1) % vocabulary.length);
  }

  const currentWord = vocabulary[currentIndex];

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Entraînement de Vocabulaire</Typography>
        <Flashcard word={currentWord} onAnswer={handleNextWord} />
        <Typography sx={{textAlign: 'center', mt: 1}}>
            {currentIndex + 1} / {vocabulary.length}
        </Typography>
    </Paper>
  );
};

export default VocabularyTrainer;