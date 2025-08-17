// Fichier: src/features/toolbox/components/CoachIA.jsx (NOUVEAU)
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Paper, Stack, TextField, IconButton, Typography, CircularProgress, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const logoSrc = '/logo192.png'; // Assurez-vous que le logo est dans /public

const askCoachAPI = (payload) => apiClient.post('/toolbox/coach', payload).then(res => res.data);

const ChatMessage = ({ author, message }) => {
  const isUser = author === 'user';
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%', py: 1 }}>
      {isUser ? <AccountCircleIcon sx={{ order: 2 }}/> : <Avatar src={logoSrc} sx={{ width: 24, height: 24 }} />}
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: isUser ? 'primary.main' : 'action.selected', color: isUser ? 'primary.contrastText' : 'text.primary' }}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message}</Typography>
      </Paper>
    </Stack>
  );
};

const CoachIA = () => {
  const [messages, setMessages] = useState([{ author: 'ia', message: 'Bonjour ! Comment puis-je vous aider dans votre apprentissage aujourd\'hui ?' }]);
  const [input, setInput] = useState('');
  const location = useLocation();
  const params = useParams();
  const chatEndRef = useRef(null);

  const mutation = useMutation({
    mutationFn: askCoachAPI,
    onSuccess: (data) => {
      setMessages(prev => [...prev, { author: 'ia', message: data.response }]);
    }
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mutation.isLoading]);

  const handleSend = () => {
    if (!input.trim()) return;

    const context = {
      path: location.pathname,
      ...params, // courseId, chapterId, etc.
    };

    const history = messages.slice(1); // Exclure le message d'accueil
    setMessages(prev => [...prev, { author: 'user', message: input }]);
    mutation.mutate({ message: input, context, history });
    setInput('');
  };

  return (
    <Paper elevation={8} sx={{ width: 360, height: 500, display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" component="h2">Coach IA</Typography>
      </Box>
      <Stack spacing={1} sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} author={msg.author} message={msg.message} />
        ))}
        {mutation.isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center' }} />}
        <div ref={chatEndRef} />
      </Stack>
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Posez votre question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={mutation.isLoading}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSend} disabled={mutation.isLoading || !input.trim()}>
                <SendIcon />
              </IconButton>
            )
          }}
        />
      </Box>
    </Paper>
  );
};

export default CoachIA;