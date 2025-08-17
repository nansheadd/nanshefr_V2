// Fichier: nanshe/frontend/src/features/learning/components/CharacterRecognitionComponent.jsx (VERSION CORRIGÉE)
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Button, TextField, Alert, CircularProgress, Paper, LinearProgress } from '@mui/material';
import QcmComponent from './QcmComponent'; // <-- 1. On importe le composant QCM qui fonctionne

const submitAnswer = async (answerData) => {
  const { data } = await apiClient.post('/progress/answer', answerData);
  return data;
};

const CharacterRecognitionComponent = ({ component, submittedAnswer }) => {
  const { content_json } = component;
  const queryClient = useQueryClient();

  // --- 2. AIGUILLAGE DE FORMAT ---
  // Si les données contiennent une liste de "choices", on considère que c'est un QCM.
  if (Array.isArray(content_json.choices)) {
      // On rend le composant QCM et on s'arrête là.
      return <QcmComponent component={component} submittedAnswer={submittedAnswer} />;
  }
  // --- FIN DE L'AIGUILLAGE ---

  // Le reste du code ne s'exécute que si ce n'est PAS un QCM.
  const characters = content_json.characters || [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const finalSubmissionMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    },
  });

  useEffect(() => {
    if (submittedAnswer) {
      setIsFinished(true);
    }
  }, [submittedAnswer]);

  // Si ce n'est pas un QCM et qu'il n'y a pas de liste de "characters", ALORS c'est un format invalide.
  if (!characters.length) {
    return <Alert severity="warning">Format de l'exercice de reconnaissance invalide.</Alert>;
  }

  const currentCharacter = characters[currentIndex];

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    if (isCorrect !== null) setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (!userInput.trim() || !currentCharacter) return;

    if (userInput.trim().toLowerCase() === currentCharacter.answer.toLowerCase()) {
      setIsCorrect(true);
      setTimeout(() => {
        if (currentIndex < characters.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setUserInput('');
          setIsCorrect(null);
        } else {
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

  if (isFinished) {
    return <Alert severity="success">Excellent ! Vous avez terminé cet exercice de reconnaissance.</Alert>;
  }

  const progress = (currentIndex / characters.length) * 100;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{content_json.instruction}</Typography>
      <Paper 
        variant="outlined" 
        sx={{ 
          my: 3, p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center',
          backgroundColor: isCorrect === true ? 'success.light' : isCorrect === false ? 'error.light' : 'background.paper',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem' }}>
          {currentCharacter.char}
        </Typography>
      </Paper>
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