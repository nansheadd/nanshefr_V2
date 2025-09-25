// src/features/toolbox/components/CoachIA.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Stack,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fade,
  Chip,
  Divider,
  Alert,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import BoltIcon from '@mui/icons-material/Bolt';

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const caretBlink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const coachFrames = [
  '/avatars/coach-frame-1.svg',
  '/avatars/coach-frame-2.svg',
  '/avatars/coach-frame-3.svg',
  '/avatars/coach-frame-4.svg',
];

const TYPEWRITER_DELAY = 22;

const ChatWindow = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'layout',
})(({ theme, layout = 'dock' }) => {
  const base = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 20,
    background: `rgba(255, 255, 255, 0.95)`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.15)}`,
    overflow: 'hidden',
  };

  if (layout === 'modal') {
    return {
      ...base,
      width: 'min(920px, 92vw)',
      height: 'min(85vh, 760px)',
    };
  }

  if (layout === 'page') {
    return {
      ...base,
      width: '100%',
      height: '100%',
      minHeight: 560,
    };
  }

  return {
    ...base,
    width: 380,
    height: 560,
  };
});

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
  },
}));

const MessageContainer = styled(Box)(({ isUser, theme }) => ({
  animation: `${slideIn} 0.3s ease-out`,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  maxWidth: isUser ? '85%' : '100%',
  margin: theme.spacing(0.5, 0),
}));

const MessageBubble = styled(Paper)(({ isUser, theme }) => ({
  padding: theme.spacing(1.75, 2.25),
  borderRadius: isUser ? '20px 20px 4px 20px' : '18px',
  background: isUser
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : `linear-gradient(180deg, ${alpha(theme.palette.secondary.light, 0.35)}, ${alpha(
        theme.palette.background.paper,
        0.95,
      )})`,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: isUser
    ? `0 4px 16px ${alpha(theme.palette.common.black, 0.15)}`
    : `0 12px 26px ${alpha(theme.palette.common.black, 0.18)}`,
  border: isUser ? 'none' : `2px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
  position: 'relative',
  overflow: 'hidden',
}));

const PortraitFrame = styled(Box)(({ theme }) => ({
  width: 96,
  height: 96,
  borderRadius: 18,
  overflow: 'hidden',
  position: 'relative',
  border: `3px solid ${alpha(theme.palette.primary.dark, 0.5)}`,
  boxShadow: `0 18px 28px ${alpha(theme.palette.common.black, 0.35)}`,
  background: `radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.light, 0.4)}, ${alpha(
    theme.palette.common.black,
    0.6,
  )})`,
}));

const PortraitImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

const PortraitGlow = styled('div')(({ theme, isActive }) => ({
  position: 'absolute',
  inset: -6,
  borderRadius: 22,
  background: isActive
    ? `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.45)} 0%, transparent 70%)`
    : 'transparent',
  filter: 'blur(12px)',
  opacity: isActive ? 1 : 0,
  transition: 'opacity 0.3s ease',
  pointerEvents: 'none',
}));

const BubbleShine = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  background: `linear-gradient(120deg, ${alpha(theme.palette.common.white, 0)} 30%, ${alpha(
    theme.palette.common.white,
    0.35,
  )} 50%, ${alpha(theme.palette.common.white, 0)} 70%)`,
  mixBlendMode: 'soft-light',
  pointerEvents: 'none',
}));

const Caret = styled('span')(({ theme }) => ({
  display: 'inline-block',
  marginLeft: 4,
  width: 10,
  animation: `${caretBlink} 1s steps(1, end) infinite`,
  color: alpha(theme.palette.secondary.main, 0.9),
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
    },
  },
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
  },
}));

const askCoachAPI = (payload) => apiClient.post('/toolbox/coach', payload).then((res) => res.data);
const fetchCoachEnergy = () => apiClient.get('/toolbox/coach/energy').then((res) => res.data);

const formatDuration = (seconds) => {
  if (seconds == null) return '';
  const totalSeconds = Math.max(0, Math.round(seconds));
  if (totalSeconds < 60) {
    return `${totalSeconds || 1} s`;
  }
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const totalHours = Math.round(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours} h`;
  }
  const totalDays = Math.round(totalHours / 24);
  return `${totalDays} j`;
};

const formatEnergyValue = (value) => {
  if (value == null) return '0';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const generateMessageId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createMessage = (author, text, { immediate = author === 'user' } = {}) => ({
  id: generateMessageId(),
  author,
  message: text,
  displayed: immediate ? text : '',
  isTyping: author === 'ia' ? !immediate : false,
});

const getTypingStep = (text) => {
  if (!text) return 1;
  if (text.length > 600) return 4;
  if (text.length > 320) return 3;
  if (text.length > 160) return 2;
  return 1;
};

const ChatMessage = ({ message, isActive, activeFrameSrc }) => {
  const isUser = message.author === 'user';
  const text = message.displayed ?? message.message;
  return (
    <MessageContainer isUser={isUser}>
      <Stack direction="row" spacing={isUser ? 1.5 : 2.5} alignItems="flex-end">
        {!isUser && (
          <Box sx={{ position: 'relative' }}>
            <PortraitGlow isActive={isActive} />
            <PortraitFrame>
              <PortraitImage src={isActive ? activeFrameSrc : coachFrames[0]} alt="Coach IA" />
              <BubbleShine />
            </PortraitFrame>
          </Box>
        )}

        <Stack spacing={0.75} sx={{ flex: 1 }}>
          <MessageBubble isUser={isUser} elevation={0}>
            {!isUser && <BubbleShine />}
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                letterSpacing: isUser ? 0 : '0.02em',
                fontFamily: isUser ? 'inherit' : `'Source Code Pro', 'Courier New', monospace`,
                fontSize: isUser ? '0.95rem' : '1rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {text}
              {isActive && <Caret>▍</Caret>}
            </Typography>
          </MessageBubble>
        </Stack>

        {isUser && (
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            <AccountCircleIcon sx={{ fontSize: 18 }} />
          </Avatar>
        )}
      </Stack>
    </MessageContainer>
  );
};

const quickActions = [
  { label: '💡 Donne-moi un conseil', message: 'Peux-tu me donner un conseil personnalisé pour continuer mon apprentissage ?', type: 'advice' },
  { label: '📚 Explique ce chapitre', message: 'Explique-moi ce chapitre en détail, avec des exemples si possible.', type: 'explain_chapter' },
  { label: '🎯 Créer un quiz', message: 'Prépare un quiz rapide pour tester mes connaissances sur cette leçon.', type: 'create_quiz' },
  { label: '⚡ Résumé rapide', message: 'Fais-moi un résumé rapide du contenu.', type: 'summary' },
  { label: '🕵️ Mode agent', message: '', type: 'agent_mode' },
];

const CoachIA = ({ onClose, onExpand, layout = 'dock' }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(() => [
    createMessage(
      'ia',
      "👋 Salut ! Je suis votre Coach IA personnel.\n\nComment puis-je vous accompagner dans votre apprentissage aujourd'hui ?",
      { immediate: false },
    ),
  ]);
  const [input, setInput] = useState('');
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [infoBanner, setInfoBanner] = useState(null);
  const location = useLocation();
  const params = useParams();
  const chatEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const messagesRef = useRef([]);
  const typingIntervalRef = useRef(null);
  const typingMessageRef = useRef(null);
  const speakingIntervalRef = useRef(null);
  const [activeFrame, setActiveFrame] = useState(0);

  const queryClient = useQueryClient();
  const {
    data: energy,
    isLoading: isEnergyLoading,
    isFetching: isEnergyFetching,
    refetch: refetchEnergy,
  } = useQuery({
    queryKey: ['coach-energy'],
    queryFn: fetchCoachEnergy,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: askCoachAPI,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, createMessage('ia', data.response, { immediate: false })]);
      queryClient.setQueryData(['coach-energy'], data.energy);
      setInfoBanner(null);
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail;
      if (detail?.code === 'coach_energy_depleted') {
        const status = detail.energy;
        queryClient.setQueryData(['coach-energy'], status);
        setMessages((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        const waitDuration = formatDuration(status?.seconds_until_next_message);
        setInfoBanner({
          severity: 'warning',
          message: `⚡ Énergie épuisée. ${waitDuration ? `Prochain message dans ${waitDuration}.` : 'Réessaie un peu plus tard.'}`,
        });
      } else {
        setInfoBanner({ severity: 'error', message: 'Le coach est momentanément indisponible.' });
      }
    },
  });

  const energyStatus = energy;

  const renderEnergyGauge = () => {
    if (isEnergyLoading && !energyStatus) {
      return (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="indeterminate" sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Chargement de l'énergie du coach...
          </Typography>
        </Box>
      );
    }

    if (!energyStatus) {
      return null;
    }

    if (energyStatus.is_unlimited) {
      return (
        <Chip
          icon={<BoltIcon fontSize="small" />}
          label="Énergie illimitée"
          color="success"
          size="small"
          sx={{ mt: 2, alignSelf: 'flex-start', fontWeight: 600 }}
        />
      );
    }

    const percentage = Math.max(0, Math.min(100, Math.round((energyStatus.percentage || 0) * 100)));
    const messageCost = energyStatus.message_cost || 1;
    const availableMessages = Math.max(0, Math.floor(energyStatus.current / messageCost));
    const nextBonus = energyStatus.seconds_until_next_message && energyStatus.seconds_until_next_message > 0
      ? `+1 message dans ${formatDuration(energyStatus.seconds_until_next_message)}`
      : 'Prêt pour un nouveau message';

    return (
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            Énergie du coach
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <BoltIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" color="text.secondary">
              {`${availableMessages} message${availableMessages > 1 ? 's' : ''}`}
            </Typography>
          </Stack>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: (theme) => {
                if (percentage <= 20) return theme.palette.error.main;
                if (percentage <= 50) return theme.palette.warning.main;
                return theme.palette.primary.main;
              },
            },
          }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {`${formatEnergyValue(energyStatus.current)} / ${formatEnergyValue(energyStatus.max)} ⚡`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isEnergyFetching ? 'Recharge en cours…' : nextBonus}
          </Typography>
        </Stack>
      </Box>
    );
  };

  useEffect(() => {
    messagesRef.current = messages;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mutation.isPending]);

  useEffect(() => {
    const last = messages[messages.length - 1];

    if (!last || last.author !== 'ia' || !last.isTyping) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        typingMessageRef.current = null;
      }
      return;
    }

    if (typingMessageRef.current === last.id) {
      return;
    }

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingMessageRef.current = last.id;
    typingIntervalRef.current = setInterval(() => {
      setMessages((prev) => {
        const index = prev.findIndex((item) => item.id === last.id);
        if (index === -1) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          typingMessageRef.current = null;
          return prev;
        }

        const target = prev[index];
        const nextDisplayed = target.message.slice(0, target.displayed.length + getTypingStep(target.message));
        const stillTyping = nextDisplayed.length < target.message.length;
        const updated = [...prev];
        updated[index] = {
          ...target,
          displayed: nextDisplayed,
          isTyping: stillTyping,
        };

        if (!stillTyping) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          typingMessageRef.current = null;
        }

        return updated;
      });
    }, TYPEWRITER_DELAY);
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const coachIsTyping = lastMessage?.author === 'ia' && lastMessage?.isTyping;
  const coachIsSpeaking = mutation.isPending || coachIsTyping;

  useEffect(() => {
    if (coachIsSpeaking) {
      setActiveFrame(0);
      if (!speakingIntervalRef.current) {
        speakingIntervalRef.current = setInterval(() => {
          setActiveFrame((prev) => (prev + 1) % coachFrames.length);
        }, 120);
      }
    } else {
      if (speakingIntervalRef.current) {
        clearInterval(speakingIntervalRef.current);
        speakingIntervalRef.current = null;
      }
      setActiveFrame(0);
    }
  }, [coachIsSpeaking]);

  useEffect(
    () => () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (speakingIntervalRef.current) {
        clearInterval(speakingIntervalRef.current);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    (text, extra = {}) => {
      const trimmed = text?.trim();
      if (!trimmed || mutation.isPending) return;

      if (isEnergyLoading) {
        setInfoBanner({ severity: 'info', message: "Chargement de ton énergie..." });
        return;
      }

      if (!energy) {
        refetchEnergy();
        setInfoBanner({ severity: 'info', message: "Chargement de ton énergie..." });
        return;
      }

      const messageCost = energy?.message_cost ?? 1;
      if (!energy.is_unlimited && energy.current < messageCost) {
        const waitDuration = formatDuration(energy.seconds_until_next_message);
        setInfoBanner({
          severity: 'warning',
          message: `⚡ Plus d'énergie disponible. ${waitDuration ? `Prochain message dans ${waitDuration}.` : 'Patiente un instant avant de réessayer.'}`,
        });
        return;
      }

      setInfoBanner(null);
      const context = { path: location.pathname, ...params };
      const history = messagesRef.current.slice(1).map(({ author, message }) => ({ author, message }));

      setMessages((prev) => [...prev, createMessage('user', trimmed)]);
      mutation.mutate({
        message: trimmed,
        context,
        history,
        quick_action: extra.quick_action || null,
        selection: extra.selection || null,
      });
    },
    [mutation, isEnergyLoading, energy, refetchEnergy, setInfoBanner, location.pathname, params],
  );

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleQuickAction = (action) => {
    if (action.type === 'agent_mode') {
      setIsAgentMode((prev) => !prev);
      setInfoBanner({
        severity: 'info',
        message: !isAgentMode ? t('coach.agent.enabled') : t('coach.agent.disabled'),
      });
      return;
    }

    if (action.type === 'explain_chapter') {
      const lessonEl = document.querySelector('[data-coach-section="lesson"]');
      const lessonText = lessonEl?.innerText?.trim() || '';
      sendMessage(action.message, {
        quick_action: action.type,
        selection: lessonText
          ? {
              text: lessonText.slice(0, 2000),
              path: location.pathname,
              section: 'lesson',
            }
          : null,
      });
      if (!lessonText) {
        setInfoBanner({ severity: 'warning', message: t('coach.errors.lessonNotFound') });
      }
      return;
    }

    sendMessage(action.message, { quick_action: action.type });
  };

  useEffect(() => {
    if (!isAgentMode) {
      document.body.style.cursor = '';
      return;
    }

    document.body.style.cursor = 'crosshair';
    const handler = (event) => {
      if (chatWindowRef.current && chatWindowRef.current.contains(event.target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const text = (event.target?.innerText || '').trim();
      setIsAgentMode(false);
      document.body.style.cursor = '';

      if (!text) {
        setInfoBanner({ severity: 'warning', message: t('coach.agent.noSelection') });
        return;
      }

      sendMessage('Peux-tu m’aider à comprendre ce passage ?', {
        quick_action: 'agent_selection',
        selection: {
          text: text.slice(0, 2000),
          path: location.pathname,
          tag: event.target.tagName,
        },
      });
    };

    document.addEventListener('click', handler, true);
    return () => {
      document.body.style.cursor = '';
      document.removeEventListener('click', handler, true);
    };
  }, [isAgentMode, location.pathname, sendMessage, t]);

  return (
    <ChatWindow elevation={12} ref={chatWindowRef} layout={layout}>
      <ChatHeader>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              }}
            >
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                🤖 Coach IA
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    animation: 'pulse 2s infinite',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  En ligne
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {onExpand && layout !== 'modal' && (
              <Tooltip title="Ouvrir en modal">
                <IconButton
                  onClick={onExpand}
                  size="small"
                  sx={{ bgcolor: alpha('#000', 0.05), '&:hover': { bgcolor: alpha('#000', 0.1) } }}
                >
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Chip
              icon={<CenterFocusStrongIcon />}
              label={isAgentMode ? 'Agent actif' : 'Mode agent'}
              size="small"
              clickable
              color={isAgentMode ? 'success' : 'default'}
              onClick={() => handleQuickAction({ type: 'agent_mode', label: '', message: '' })}
            />
            {onClose && (
              <IconButton onClick={onClose} size="small" sx={{ bgcolor: alpha('#000', 0.05), '&:hover': { bgcolor: alpha('#000', 0.1) } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Stack>
        {renderEnergyGauge()}
        <Divider sx={{ mt: 2, opacity: 0.5 }} />
        {infoBanner && (
          <Alert severity={infoBanner.severity} sx={{ mt: 2 }} onClose={() => setInfoBanner(null)}>
            {infoBanner.message}
          </Alert>
        )}
      </ChatHeader>

      <Stack sx={{ flexGrow: 1, p: 2, overflowY: 'auto', gap: 1 }}>
        {messages.map((msg, index) => {
          const isActive = index === messages.length - 1 && msg.author === 'ia' && msg.isTyping;
          return (
            <Fade in key={msg.id} timeout={300}>
              <div>
                <ChatMessage message={msg} isActive={isActive} activeFrameSrc={coachFrames[activeFrame]} />
              </div>
            </Fade>
          );
        })}

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

      {messages.length === 1 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Actions rapides :
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {quickActions.map((action) => (
              <Chip
                key={action.label}
                label={action.label}
                size="small"
                clickable
                onClick={() => handleQuickAction(action)}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'scale(1.05)',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ opacity: 0.6 }} />

      <Box sx={{ p: 2 }}>
        <StyledTextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={isAgentMode ? 'Mode agent actif...' : 'Tapez votre message...'}
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
                  '&.Mui-disabled': { bgcolor: 'action.disabled' },
                }}
                size="small"
              >
                <SendIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </Box>
    </ChatWindow>
  );
};

export default CoachIA;
