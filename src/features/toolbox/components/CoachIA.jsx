// src/features/toolbox/components/CoachIA.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
  Box, 
  Paper, 
  Stack, 
  TextField, 
  IconButton, 
  Typography, 
  CircularProgress, 
  Avatar,
  Fade,
  Chip,
  Divider
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';

const logoSrc = '/logo192.png';

// Animation pour les messages
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 380,
  height: 520,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 20,
  background: `rgba(255, 255, 255, 0.95)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.15)}`,
  overflow: 'hidden',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const MessageContainer = styled(Box)(({ isUser, theme }) => ({
  animation: `${slideIn} 0.3s ease-out`,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  maxWidth: '85%',
  margin: theme.spacing(0.5, 0),
}));

const MessageBubble = styled(Paper)(({ isUser, theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  background: isUser 
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : alpha(theme.palette.background.paper, 0.9),
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
  border: isUser ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    '& fieldset': {
      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
    },
    '&:hover fieldset': {
      border: `1px solid ${theme.palette.primary.main}`,
    },
    '&.Mui-focused fieldset': {
      border: `2px solid ${theme.palette.primary.main}`,
    }
  }
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  borderRadius: 20,
  background: alpha(theme.palette.background.paper, 0.9),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  maxWidth: 'fit-content',
  '& .dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: theme.palette.text.secondary,
    animation: 'typing 1.4s infinite',
    '&:nth-of-type(2)': { animationDelay: '0.2s' },
    '&:nth-of-type(3)': { animationDelay: '0.4s' },
  },
  '@keyframes typing': {
    '0%, 60%, 100%': { opacity: 0.3 },
    '30%': { opacity: 1 },
  }
}));

const askCoachAPI = (payload) => apiClient.post('/toolbox/coach', payload).then(res => res.data);

const ChatMessage = ({ author, message, isFirst }) => {
  const isUser = author === 'user';
  
  return (
    <MessageContainer isUser={isUser}>
      <Stack direction="row" spacing={1.5} alignItems="flex-end">
        {!isUser && (
          <Avatar 
            src={isUser ? undefined : logoSrc} 
            sx={{ 
              width: 32, 
              height: 32,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              boxShadow: 2
            }}
          >
            {isUser ? <AccountCircleIcon /> : <SmartToyIcon sx={{ fontSize: 18 }} />}
          </Avatar>
        )}
        
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <MessageBubble isUser={isUser} elevation={2}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {message}
            </Typography>
          </MessageBubble>
        </Stack>
        
        {isUser && (
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <AccountCircleIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}
      </Stack>
    </MessageContainer>
  );
};

const CoachIA = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      author: 'ia', 
      message: '👋 Salut ! Je suis votre Coach IA personnel.\n\nComment puis-je vous accompagner dans votre apprentissage aujourd\'hui ?' 
    }
  ]);
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
  }, [messages, mutation.isPending]);

  const handleSend = () => {
    if (!input.trim()) return;

    const context = { path: location.pathname, ...params };
    const history = messages.slice(1);
    
    setMessages(prev => [...prev, { author: 'user', message: input }]);
    mutation.mutate({ message: input, context, history });
    setInput('');
  };

  const quickActions = [
    '💡 Donne-moi un conseil',
    '📚 Explique ce chapitre',
    '🎯 Créer un quiz',
    '⚡ Résumé rapide'
  ];

  return (
    <ChatWindow elevation={12}>
      {/* Header */}
      <ChatHeader>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ 
              width: 40, 
              height: 40,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)'
            }}>
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                🤖 Coach IA
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: 'success.main',
                  animation: 'pulse 2s infinite'
                }} />
                <Typography variant="caption" color="text.secondary">
                  En ligne
                </Typography>
              </Stack>
            </Box>
          </Stack>
          {onClose && (
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{ 
                bgcolor: alpha('#000', 0.05),
                '&:hover': { bgcolor: alpha('#000', 0.1) }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </ChatHeader>

      {/* Messages */}
      <Stack sx={{ flexGrow: 1, p: 2, overflowY: 'auto', gap: 1 }}>
        {messages.map((msg, index) => (
          <Fade in={true} timeout={300} key={index}>
            <div>
              <ChatMessage 
                author={msg.author} 
                message={msg.message}
                isFirst={index === 0}
              />
            </div>
          </Fade>
        ))}
        
        {mutation.isPending && (
          <TypingIndicator>
            <Box className="dot" />
            <Box className="dot" />
            <Box className="dot" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Coach réfléchit...
            </Typography>
          </TypingIndicator>
        )}
        
        <div ref={chatEndRef} />
      </Stack>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Actions rapides :
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {quickActions.map((action) => (
              <Chip
                key={action}
                label={action}
                size="small"
                clickable
                onClick={() => setInput(action)}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  '&:hover': { 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    transform: 'scale(1.05)'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ opacity: 0.6 }} />

      {/* Input */}
      <Box sx={{ p: 2 }}>
        <StyledTextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tapez votre message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={mutation.isPending}
          InputProps={{
            endAdornment: (
              <IconButton 
                onClick={handleSend} 
                disabled={mutation.isPending || !input.trim()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'action.disabled' }
                }}
                size="small"
              >
                <SendIcon fontSize="small" />
              </IconButton>
            )
          }}
        />
      </Box>
    </ChatWindow>
  );
};

export default CoachIA;