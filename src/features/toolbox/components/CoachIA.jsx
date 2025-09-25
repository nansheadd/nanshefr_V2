// src/features/toolbox/components/CoachIA.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useI18n } from '../../../i18n/I18nContext';
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
  CircularProgress,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import BoltIcon from '@mui/icons-material/Bolt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const caretBlink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const coachFrames = [
  '/avatars/frame-1.png',
  '/avatars/frame-2.png',
  '/avatars/frame-3.png',
  '/avatars/frame-4.png',
];

const TYPEWRITER_DELAY = 22;

const COACH_WELCOME_MESSAGE =
  "👋 Salut ! Je suis votre Coach IA personnel.\n\nComment puis-je vous accompagner dans votre apprentissage aujourd'hui ?";

const COACH_CONVERSATION_STORAGE_KEY = 'nanshe.coach.conversationId';

const getConversationStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage || window.localStorage || null;
  } catch (error) {
    console.warn('CoachIA: unable to access sessionStorage for conversations.', error);
    return null;
  }
};

const readStoredConversationId = () => {
  const storage = getConversationStorage();
  if (!storage) return null;
  try {
    return storage.getItem(COACH_CONVERSATION_STORAGE_KEY);
  } catch (error) {
    console.warn('CoachIA: unable to read stored conversation id.', error);
    return null;
  }
};

const writeStoredConversationId = (value) => {
  const storage = getConversationStorage();
  if (!storage) return;
  try {
    if (value) {
      storage.setItem(COACH_CONVERSATION_STORAGE_KEY, value);
    } else {
      storage.removeItem(COACH_CONVERSATION_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('CoachIA: unable to persist conversation id.', error);
  }
};

const ChatWindow = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'layout',
})(({ theme, layout = 'dock' }) => {
  const base = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 24,
    background:
      theme.palette.mode === 'dark'
        ? `linear-gradient(160deg, ${alpha(theme.palette.background.paper, 0.92)}, ${alpha(
            theme.palette.background.default,
            0.82,
          )})`
        : `linear-gradient(160deg, ${alpha(theme.palette.common.white, 0.98)}, ${alpha(
            theme.palette.secondary.light,
            0.18,
          )})`,
    backdropFilter: 'blur(22px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
    boxShadow: `0 22px 60px ${alpha(theme.palette.common.black, 0.16)}`,
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
    width: 'min(640px, 92vw)',
    height: 'min(420px, 70vh)',
  };
});

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  background: `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(
    theme.palette.secondary.main,
    0.18,
  )})`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at top right, ${alpha(theme.palette.common.white, 0.25)}, transparent 55%)`,
    pointerEvents: 'none',
    mixBlendMode: 'soft-light',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const MessageContainer = styled(Box)(({ isUser, theme }) => ({
  animation: `${slideIn} 0.3s ease-out`,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  maxWidth: isUser ? '78%' : '88%',
  margin: theme.spacing(0.5, 0),
}));

const MessageBubble = styled(Paper)(({ isUser, theme }) => ({
  padding: theme.spacing(1.75, 2.25),
  borderRadius: isUser ? '22px 22px 6px 22px' : '20px',
  background: isUser
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : `linear-gradient(165deg, ${alpha(theme.palette.secondary.light, 0.45)}, ${alpha(
        theme.palette.background.paper,
        0.98,
      )})`,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: isUser
    ? `0 6px 18px ${alpha(theme.palette.common.black, 0.22)}`
    : `0 16px 34px ${alpha(theme.palette.common.black, 0.18)}`,
  border: isUser
    ? `1px solid ${alpha(theme.palette.primary.light, 0.5)}`
    : `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
  position: 'relative',
  overflow: 'hidden',
  backdropFilter: 'blur(6px)',
}));

const PortraitFrame = styled(Box)(({ theme }) => ({
  width: 86,
  height: 86,
  borderRadius: 20,
  overflow: 'hidden',
  position: 'relative',
  border: `3px solid ${alpha(theme.palette.primary.dark, 0.45)}`,
  boxShadow: `0 16px 32px ${alpha(theme.palette.common.black, 0.35)}`,
  background: `radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.light, 0.4)}, ${alpha(
    theme.palette.common.black,
    0.6,
  )})`,
}));

const PortraitImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  backgroundColor: 'rgba(0,0,0,0.35)',
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
  padding: theme.spacing(1.4, 2),
  borderRadius: 999,
  background: alpha(theme.palette.background.paper, 0.82),
  border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
  boxShadow: `0 10px 26px ${alpha(theme.palette.common.black, 0.12)}`,
  backdropFilter: 'blur(10px)',
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

const fetchCoachConversation = async (conversationId) => {
  const endpoints = conversationId
    ? [
        `/toolbox/coach/conversations/${encodeURIComponent(conversationId)}`,
        `/toolbox/coach/conversation/${encodeURIComponent(conversationId)}`,
      ]
    : [
        '/toolbox/coach/conversations/current',
        '/toolbox/coach/conversations/latest',
        '/toolbox/coach/conversation',
      ];

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get(endpoint);
      if (response?.data) {
        return response.data;
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status && [400, 404, 405].includes(status)) {
        continue;
      }
      console.warn('CoachIA: unable to fetch conversation.', endpoint, error);
      throw error;
    }
  }

  return null;
};

const resetCoachConversation = async (conversationId) => {
  const attempts = [];
  if (conversationId) {
    const encoded = encodeURIComponent(conversationId);
    attempts.push({ method: 'delete', url: `/toolbox/coach/conversations/${encoded}` });
    attempts.push({ method: 'delete', url: `/toolbox/coach/conversation/${encoded}` });
  }
  attempts.push({ method: 'post', url: '/toolbox/coach/conversations/reset' });
  attempts.push({ method: 'delete', url: '/toolbox/coach/conversations/current' });
  attempts.push({ method: 'delete', url: '/toolbox/coach/conversation' });

  let lastError = null;
  for (const attempt of attempts) {
    const { method, url } = attempt;
    if (!apiClient[method]) continue;
    try {
      const response = await apiClient[method](url);
      return response?.data ?? null;
    } catch (error) {
      const status = error?.response?.status;
      if (status && [400, 404, 405].includes(status)) {
        lastError = error;
        continue;
      }
      lastError = error;
      break;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return null;
};

const pickString = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
};

const extractConversationData = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { conversationId: null, messages: null, responseText: '', energy: null };
  }

  const conversation =
    payload.conversation ||
    payload.data?.conversation ||
    payload.session ||
    payload.thread ||
    null;

  const conversationId = pickString(
    payload.conversation_id,
    payload.conversationId,
    conversation?.id,
    conversation?.conversation_id,
    conversation?.uuid,
    payload.id,
    payload.session_id,
    payload.thread_id,
  );

  const messages =
    (Array.isArray(payload.messages) && payload.messages) ||
    (Array.isArray(payload.history) && payload.history) ||
    (Array.isArray(payload.message_history) && payload.message_history) ||
    (Array.isArray(payload.entries) && payload.entries) ||
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.data?.messages) && payload.data.messages) ||
    (Array.isArray(payload.data?.history) && payload.data.history) ||
    (Array.isArray(conversation?.messages) && conversation.messages) ||
    (Array.isArray(conversation?.history) && conversation.history) ||
    null;

  const responseText =
    pickString(
      payload.response,
      payload.answer,
      payload.message,
      payload.text,
      payload.output,
      payload.content,
      payload.reply,
      payload.data?.response,
      payload.data?.answer,
    ) || '';

  const energy =
    payload.energy ||
    payload.meta?.energy ||
    conversation?.energy ||
    payload.data?.energy ||
    null;

  return { conversationId, messages, responseText, energy };
};

const extractMessageRole = (raw) => {
  if (!raw) return '';

  if (raw.is_assistant || raw.isAssistant) return 'assistant';
  if (raw.is_user || raw.isUser) return 'user';

  const seen = [];
  const push = (value) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      seen.push(value.trim());
    }
  };

  const sources = [raw, raw.message, raw.payload, raw.data, raw.event, raw.meta];
  sources.forEach((source) => {
    if (!source || typeof source !== 'object') return;
    push(source.role);
    push(source.author_role);
    push(source.authorRole);
    push(source.sender_role);
    push(source.senderRole);
    push(source.user_role);
    push(source.type);
    push(source.author);
    push(source.from);
    push(source.participant?.role);
  });

  if (typeof raw.role === 'string') push(raw.role);
  if (typeof raw.author === 'string') push(raw.author);

  return seen.length > 0 ? seen[0].toLowerCase() : '';
};

const determineAuthorFromRole = (role) => {
  if (!role) return 'user';
  const normalized = role.toLowerCase();
  if (['assistant', 'coach', 'ai', 'ia', 'bot'].includes(normalized)) return 'ia';
  if (['system', 'narrator', 'moderator'].includes(normalized)) return 'ia';
  return 'user';
};

const extractMessageContent = (raw) => {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw;

  const contents = [];
  const push = (value) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      contents.push(value);
    }
  };

  const walk = (source) => {
    if (!source) return;
    if (typeof source === 'string') {
      push(source);
      return;
    }
    if (typeof source !== 'object') return;
    push(source.content);
    push(source.message);
    push(source.text);
    push(source.body);
    push(source.value);
    push(source.output);
    push(source.summary);
    push(source.response);
    push(source.reply);
    if (source.delta && typeof source.delta === 'object') {
      push(source.delta.content);
      push(source.delta.text);
    }
    if (Array.isArray(source.parts)) {
      source.parts.forEach((part) => walk(part));
    }
    if (Array.isArray(source.content)) {
      source.content.forEach((part) => walk(part));
    }
  };

  walk(raw);

  return contents.find((value) => value && value.trim().length > 0) || '';
};

const mapApiMessageToLocal = (raw, { animateAssistant = false, isLast = false } = {}) => {
  if (raw == null) return null;

  const role = extractMessageRole(raw);
  const author = determineAuthorFromRole(role);
  const content = extractMessageContent(raw);

  if (!content) {
    return null;
  }

  const shouldAnimateAssistant = animateAssistant && isLast && author === 'ia';

  return createMessage(author, content, { immediate: author !== 'ia' || !shouldAnimateAssistant });
};

const convertConversationMessages = (messages = [], { animateAssistant = false } = {}) => {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((entry, index) =>
      mapApiMessageToLocal(entry, {
        animateAssistant,
        isLast: index === messages.length - 1,
      }),
    )
    .filter(Boolean);
};

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

const determineCoachContext = (pathname) => {
  if (!pathname) return 'general';

  if (/^\/capsule\/[^/]+\/granule\/[^/]+\/molecule\//.test(pathname) || /^\/session\/molecule\//.test(pathname)) {
    return 'learning';
  }

  if (/^\/capsule\/[^/]+\/[^/]+\/[^/]+\/plan/.test(pathname)) {
    return 'capsulePlan';
  }

  if (/^\/capsule\/[^/]+\/[^/]+\/[^/]+$/.test(pathname)) {
    return 'capsuleDetail';
  }

  if (pathname.startsWith('/library') || pathname.startsWith('/capsules')) {
    return 'library';
  }

  if (pathname.startsWith('/dashboard')) {
    return 'dashboard';
  }

  if (pathname.startsWith('/toolbox')) {
    return 'toolbox';
  }

  return 'general';
};

const contextualQuickActions = {
  dashboard: [
    {
      label: '🎯 Priorités du jour',
      message: 'Analyse mon tableau de bord et propose-moi mes priorités du moment.',
      type: 'dashboard_focus',
    },
    {
      label: '📈 Comprendre mes progrès',
      message: 'Peux-tu analyser mes statistiques et m’expliquer où j’en suis ?',
      type: 'analyze_progress',
    },
    {
      label: '🧭 Où aller ensuite ?',
      message: 'Suggère-moi la prochaine activité pertinente à partir de ce que tu vois ici.',
      type: 'next_step',
    },
  ],
  library: [
    {
      label: '🔍 Trouve une capsule',
      message: 'Recommande-moi une capsule adaptée à mon niveau et à mes objectifs.',
      type: 'recommend_capsule',
    },
    {
      label: '🗂️ Organise ma bibliothèque',
      message: 'Aide-moi à organiser ou filtrer les capsules pertinentes pour moi.',
      type: 'organize_library',
    },
    {
      label: '✨ Découverte du moment',
      message: 'Propose-moi une capsule inspirante à explorer dès maintenant.',
      type: 'discover_capsule',
    },
  ],
  capsuleDetail: [
    {
      label: '🧠 Résumé de la capsule',
      message: 'Fais-moi un résumé clair de cette capsule et de ce que je vais y apprendre.',
      type: 'capsule_summary',
    },
    {
      label: '🎓 Objectifs pédagogiques',
      message: 'Explique-moi les objectifs clés de cette capsule et comment elle va m’aider.',
      type: 'capsule_objectives',
    },
    {
      label: '🚀 Plan d’étude',
      message: 'Aide-moi à planifier comment progresser efficacement dans cette capsule.',
      type: 'capsule_plan',
    },
  ],
  capsulePlan: [
    {
      label: '🗺️ Parcours conseillé',
      message: 'Analyse le plan de cette capsule et indique-moi par où commencer.',
      type: 'plan_guidance',
    },
    {
      label: '📌 Points importants',
      message: 'Identifie les molécules clés sur lesquelles je devrais me concentrer.',
      type: 'plan_highlights',
    },
    {
      label: '📝 Préparation de session',
      message: 'Aide-moi à préparer ma prochaine session d’apprentissage sur cette capsule.',
      type: 'plan_preparation',
    },
  ],
  toolbox: [
    {
      label: '🛠️ Aide sur la toolbox',
      message: 'Explique-moi comment profiter des outils avancés disponibles ici.',
      type: 'toolbox_help',
    },
    {
      label: '🧭 Navigation toolbox',
      message: 'Guide-moi vers les fonctionnalités les plus utiles de la toolbox.',
      type: 'toolbox_navigation',
    },
    {
      label: '💡 Cas d’usage',
      message: 'Donne-moi des idées concrètes pour utiliser ces outils dans ma session.',
      type: 'toolbox_use_cases',
    },
  ],
  learning: [
    {
      label: '📚 Explique cette leçon',
      message: 'Explique-moi cette leçon en détail avec des exemples concrets.',
      type: 'explain_chapter',
    },
    {
      label: '⚡ Résumé rapide',
      message: 'Fais-moi un résumé rapide de ce que je dois retenir.',
      type: 'summary',
    },
    {
      label: '🎯 Créer un quiz',
      message: 'Prépare un quiz pour tester ma compréhension de cette leçon.',
      type: 'create_quiz',
    },
    {
      label: '🧠 Flashcards express',
      message: 'Génère quelques flashcards pour réviser les points clés.',
      type: 'flashcards',
    },
  ],
  general: [
    {
      label: '💡 Donne-moi un conseil',
      message: 'Peux-tu me donner un conseil personnalisé pour continuer mon apprentissage ?',
      type: 'advice',
    },
    {
      label: '🧭 Besoin d’orientation',
      message: 'Aide-moi à savoir quelle est la prochaine étape pertinente dans la plateforme.',
      type: 'orientation',
    },
    {
      label: '✨ Découverte',
      message: 'Propose-moi une activité ou une capsule intéressante à explorer maintenant.',
      type: 'discovery',
    },
  ],
};

const buildQuickActions = (context, isAgentAvailable) => {
  const actions = [...(contextualQuickActions[context] || contextualQuickActions.general)];

  actions.push({
    label: '🕵️ Mode agent',
    message: '',
    type: 'agent_mode',
    disabled: !isAgentAvailable,
    tooltip: !isAgentAvailable
      ? 'Le mode agent permet de sélectionner un passage d’une molécule pour obtenir de l’aide. Ouvre une leçon pour l’utiliser.'
      : 'Active le mode agent pour sélectionner un passage précis dans la leçon.',
  });

  return actions;
};

const CoachIA = ({ onClose, onExpand, layout = 'dock' }) => {
  const { t } = useI18n();
  const [messages, setMessages] = useState(() => [
    createMessage('ia', COACH_WELCOME_MESSAGE, { immediate: false }),
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isResettingConversation, setIsResettingConversation] = useState(false);
  const [input, setInput] = useState('');
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [infoBanner, setInfoBanner] = useState(null);
  const location = useLocation();
  const params = useParams();
  const chatEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const messagesRef = useRef([]);
  const hasHydratedConversationRef = useRef(false);
  const typingIntervalRef = useRef(null);
  const typingMessageRef = useRef(null);
  const speakingIntervalRef = useRef(null);
  const [activeFrame, setActiveFrame] = useState(0);

  const coachContext = useMemo(() => determineCoachContext(location.pathname), [location.pathname]);
  const isAgentAvailable = coachContext === 'learning';
  const quickActions = useMemo(
    () => buildQuickActions(coachContext, isAgentAvailable),
    [coachContext, isAgentAvailable],
  );
  const agentTooltip = quickActions.find((action) => action.type === 'agent_mode')?.tooltip;

  useEffect(() => {
    writeStoredConversationId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (hasHydratedConversationRef.current) {
      return;
    }

    hasHydratedConversationRef.current = true;
    let cancelled = false;

    const loadConversation = async () => {
      setIsLoadingConversation(true);
      try {
        const storedId = readStoredConversationId();
        const data = await fetchCoachConversation(storedId);
        if (!data || cancelled) {
          return;
        }

        const { conversationId: nextId, messages: rawMessages, energy } = extractConversationData(data);
        const effectiveId = nextId || storedId || null;
        if (effectiveId) {
          setConversationId(effectiveId);
        }

        if (energy) {
          queryClient.setQueryData(['coach-energy'], energy);
        }

        if (Array.isArray(rawMessages) && rawMessages.length > 0) {
          const normalized = convertConversationMessages(rawMessages, { animateAssistant: false });
          if (normalized.length > 0) {
            setMessages(normalized);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('CoachIA: unable to hydrate conversation history.', error);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingConversation(false);
        }
      }
    };

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

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
      const { conversationId: nextId, messages: rawMessages, responseText, energy } = extractConversationData(data);

      if (nextId) {
        setConversationId(nextId);
      }

      if (energy) {
        queryClient.setQueryData(['coach-energy'], energy);
      } else if (data.energy) {
        queryClient.setQueryData(['coach-energy'], data.energy);
      }

      const normalizedMessages = convertConversationMessages(rawMessages, { animateAssistant: true });
      const previousCount = messagesRef.current.length;

      if (normalizedMessages.length >= previousCount && normalizedMessages.length > 0) {
        setMessages(normalizedMessages);
      } else if (normalizedMessages.length > 0) {
        const lastServerMessage = normalizedMessages[normalizedMessages.length - 1];
        if (lastServerMessage && lastServerMessage.author === 'ia') {
          setMessages((prev) => [...prev, createMessage('ia', lastServerMessage.message, { immediate: false })]);
        }
      } else if (responseText || data.response) {
        const text = responseText || data.response;
        setMessages((prev) => [...prev, createMessage('ia', text, { immediate: false })]);
      }

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
      if (!speakingIntervalRef.current) {
        setActiveFrame(0);
        speakingIntervalRef.current = setInterval(() => {
          setActiveFrame((prev) => (prev + 1) % coachFrames.length);
        }, 120);
      }
      return;
    }

    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current);
      speakingIntervalRef.current = null;
    }
    setActiveFrame(0);
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
      if (
        !trimmed ||
        mutation.isPending ||
        isLoadingConversation ||
        isResettingConversation
      ) {
        return;
      }

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
      const payload = {
        message: trimmed,
        context,
        history,
        quick_action: extra.quick_action || null,
        selection: extra.selection || null,
      };

      if (conversationId) {
        payload.conversation_id = conversationId;
        payload.conversationId = conversationId;
        payload.conversation = { id: conversationId };
      }

      mutation.mutate(payload);
    },
    [
      mutation,
      isEnergyLoading,
      energy,
      refetchEnergy,
      setInfoBanner,
      location.pathname,
      params,
      conversationId,
      isLoadingConversation,
      isResettingConversation,
    ],
  );

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleResetConversation = useCallback(async () => {
    if (isResettingConversation || mutation.isPending) {
      return;
    }

    setIsResettingConversation(true);
    setInfoBanner(null);

    try {
      await resetCoachConversation(conversationId);
      setConversationId(null);
      setMessages([createMessage('ia', COACH_WELCOME_MESSAGE, { immediate: false })]);
      writeStoredConversationId(null);
    } catch (error) {
      console.warn('CoachIA: unable to reset conversation.', error);
      setInfoBanner({ severity: 'error', message: 'Impossible de réinitialiser la conversation pour le moment.' });
    } finally {
      setIsResettingConversation(false);
    }
  }, [conversationId, isResettingConversation, mutation.isPending, setInfoBanner]);

  const handleQuickAction = (action) => {
    if (action?.disabled) {
      return;
    }

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
    if (isAgentMode && !isAgentAvailable) {
      setIsAgentMode(false);
      setInfoBanner({
        severity: 'info',
        message: 'Le mode agent est disponible uniquement lorsque vous ouvrez une molécule.',
      });
    }
  }, [isAgentMode, isAgentAvailable]);

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
            <Tooltip title={agentTooltip || ''} placement="bottom">
              <span>
                <Chip
                  icon={<CenterFocusStrongIcon />}
                  label={isAgentMode ? 'Agent actif' : 'Mode agent'}
                  size="small"
                  clickable={isAgentAvailable}
                  disabled={!isAgentAvailable}
                  color={isAgentMode ? 'success' : 'default'}
                  onClick={() => handleQuickAction({ type: 'agent_mode', label: '', message: '' })}
                  sx={{
                    cursor: isAgentAvailable ? 'pointer' : 'not-allowed',
                  }}
                />
              </span>
            </Tooltip>
            <Tooltip title="Nouvelle conversation" placement="bottom">
              <span>
                <IconButton
                  onClick={handleResetConversation}
                  size="small"
                  disabled={
                    isResettingConversation || mutation.isPending || isLoadingConversation
                  }
                  sx={{ bgcolor: alpha('#000', 0.05), '&:hover': { bgcolor: alpha('#000', 0.1) } }}
                >
                  {isResettingConversation ? (
                    <CircularProgress size={16} sx={{ color: 'text.secondary' }} />
                  ) : (
                    <RestartAltIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
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
        {isLoadingConversation && (
          <Stack alignItems="center" spacing={1} sx={{ py: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="caption" color="text.secondary">
              Chargement de ta conversation...
            </Typography>
          </Stack>
        )}
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
            {quickActions.map((action) => {
              const chip = (
                <Chip
                  label={action.label}
                  size="small"
                  clickable={!action.disabled}
                  disabled={action.disabled}
                  onClick={!action.disabled ? () => handleQuickAction(action) : undefined}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    '&:hover': action.disabled
                      ? {}
                      : {
                          bgcolor: 'primary.main',
                          color: 'white',
                          transform: 'scale(1.05)',
                        },
                  }}
                />
              );

              if (action.tooltip) {
                return (
                  <Tooltip key={action.label} title={action.tooltip} arrow>
                    <span>{chip}</span>
                  </Tooltip>
                );
              }

              return (
                <span key={action.label}>
                  {chip}
                </span>
              );
            })}
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
          disabled={mutation.isPending || isLoadingConversation || isResettingConversation}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={handleSend}
                disabled={
                  mutation.isPending ||
                  isLoadingConversation ||
                  isResettingConversation ||
                  !input.trim()
                }
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
