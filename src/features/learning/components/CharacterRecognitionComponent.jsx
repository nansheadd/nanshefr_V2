// Fichier: nanshe/frontend/src/features/learning/components/CharacterRecognitionComponent.jsx (NOUVEAU)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, TextField, Alert, CircularProgress, Paper, LinearProgress } from '@mui/material';

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const CharacterRecognitionComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  const characters = content_json.characters || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null); // null | true | false
  const [isFinished, setIsFinished] = useState(false);

  // Note: La soumission finale se fera à la fin de tous les caractères
  const finalSubmissionMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
  });

  const currentCharacter = characters[currentIndex];

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    // On réinitialise le feedback si l'utilisateur change sa réponse
    if (isCorrect !== null) {
      setIsCorrect(null);
    }
  };

  const checkAnswer = () => {
    if (!userInput.trim() || !currentCharacter) return;

    if (userInput.trim().toLowerCase() === currentCharacter.answer.toLowerCase()) {
      setIsCorrect(true);
      // Passer au caractère suivant après un court délai
      setTimeout(() => {
        if (currentIndex < characters.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setUserInput('');
          setIsCorrect(null);
        } else {
          // Tous les caractères ont été reconnus
          setIsFinished(true);
          finalSubmissionMutation.mutate({
            component_id: component.id,
            user_answer_json: { "completed_all": true }
          });
        }
      }, 1000);
    } else {
      setIsCorrect(false);
    }
  };
  
  // Gérer le cas où l'exercice a déjà été soumis
  useEffect(() => {
    if (submittedAnswer) {
      setIsFinished(true);
    }
  }, [submittedAnswer]);

  if (isFinished) {
    return (
      <Alert severity="success">
        Excellent ! Vous avez terminé cet exercice de reconnaissance.
      </Alert>
    );
  }

  if (!characters.length) {
    return <Typography color="error">Format de l'exercice invalide.</Typography>;
  }

  const progress = (currentIndex / characters.length) * 100;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{content_json.instruction}</Typography>
      
      {/* Afficheur de caractère */}
      <Paper 
        variant="outlined" 
        sx={{ 
          my: 3, 
          p: 4, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: isCorrect === true ? 'success.light' : isCorrect === false ? 'error.light' : 'background.paper',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem' }}>
          {currentCharacter.char}
        </Typography>
      </Paper>

      {/* Barre de progression */}
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption" display="block" textAlign="right">
          {currentIndex + 1} / {characters.length}
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Votre réponse (ex: 'a', 'ka'...)"
        value={userInput}
        onChange={handleInputChange}
        disabled={isCorrect === true}
        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
        autoFocus
      />
      
      <Button 
        variant="contained" 
        onClick={checkAnswer} 
        sx={{ mt: 2 }}
        disabled={isCorrect === true || !userInput.trim()}
      >
        Valider
      </Button>

      {isCorrect === false && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Ce n'est pas tout à fait ça. Essayez encore !
        </Alert>
      )}
    </Box>
  );
};

export default CharacterRecognitionComponent;