// Fichier: src/features/learning/components/DiscussionComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Stack, Alert, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Chemin vers ton logo Nanshe (si dans /public)
const logoSrc = '/logo192.png';

// Fonctions API
const submitFirstAnswer = (answerData) => apiClient.post('/progress/answer', answerData).then(res => res.data);
const continueConversation = ({ answerLogId, ...payload }) =>
  apiClient.post(`/progress/discussion/${answerLogId}/continue`, payload).then(res => res.data);

// Message de chat
const ChatMessage = ({ author, message }) => {
  const isUser = author === 'user';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        backgroundColor: isUser ? 'primary.light' : '#f5f5f5', // gris clair fixe
        color: isUser ? 'primary.contrastText' : '#000', // texte noir pour IA
        maxWidth: '80%',
        boxShadow: 1,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isUser ? (
          <AccountCircleIcon />
        ) : (
          <Avatar
            src={logoSrc}
            alt="Nanshe"
            sx={{ width: 24, height: 24 }}
          />
        )}
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            color: isUser ? 'inherit' : '#000', // texte noir forcé
          }}
        >
          {message}
        </Typography>
      </Stack>
    </Paper>
  );
};


const DiscussionComponent = ({ component, submittedAnswer }) => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(submittedAnswer?.status === 'correct');
  const chatEndRef = useRef(null);

  // Synchronise l'état avec le serveur
  useEffect(() => {
    if (submittedAnswer?.ai_feedback?.history) {
      setMessages(submittedAnswer.ai_feedback.history);
    } else if (submittedAnswer) {
      setMessages([{ author: 'user', message: submittedAnswer.user_answer_json.text }]);
    } else {
      setMessages([]);
    }
    setIsCompleted(submittedAnswer?.status === 'correct');
  }, [submittedAnswer]);

  // Scroll auto
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mutations API
  const firstMessageMutation = useMutation({
    mutationFn: submitFirstAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    }
  });

  const continueMutation = useMutation({
    mutationFn: continueConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
    }
  });

  const isLoading = firstMessageMutation.isLoading || continueMutation.isLoading;

  const handleSend = () => {
    if (!currentUserInput.trim()) return;

    const newMessages = [...messages, { author: 'user', message: currentUserInput }];
    setMessages(newMessages);

    if (!submittedAnswer) {
      firstMessageMutation.mutate({
        component_id: component.id,
        user_answer_json: { text: currentUserInput }
      });
    } else {
      continueMutation.mutate({
        answerLogId: submittedAnswer.id,
        history: messages,
        user_message: currentUserInput
      });
    }
    setCurrentUserInput('');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {component.content_json.prompt || "Lancez la discussion"}
      </Typography>

      <Stack
        sx={{
          mt: 2,
          p: 2,
          border: '1px solid #ddd',
          borderRadius: 1,
          height: '300px',
          overflowY: 'auto',
          bgcolor: 'background.paper'
        }}
      >
        {messages.map((msg, index) => (
          <ChatMessage key={index} author={msg.author} message={msg.message} />
        ))}
        {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center', my: 1 }} />}
        <div ref={chatEndRef} />
      </Stack>

      {isCompleted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Discussion terminée et validée ! Vous pouvez passer à la suite.
        </Alert>
      ) : (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Écrivez votre message..."
            value={currentUserInput}
            onChange={(e) => setCurrentUserInput(e.target.value)}
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={isLoading || !currentUserInput}
          >
            Envoyer
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default DiscussionComponent;
