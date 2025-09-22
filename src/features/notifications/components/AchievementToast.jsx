import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Avatar, Slide } from '@mui/material';
import { keyframes } from '@mui/system';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import BuildIcon from '@mui/icons-material/Build';
import { useWebSocket } from '../../../contexts/WebSocketProvider'; // On importe le hook du contexte
import { useI18n } from '../../../i18n/I18nContext';

const iconMap = {
  trophy: <EmojiEventsIcon />,
  explorer: <TravelExploreIcon />,
  adventurer: <TravelExploreIcon />,
  marathon: <TravelExploreIcon />,
  creator: <BuildIcon />,
  architect: <BuildIcon />,
  rocket: <RocketLaunchIcon />,
  starter: <RocketLaunchIcon />,
  torch: <EmojiEventsIcon />,
  collection: <EmojiEventsIcon />,
};

const popIn = keyframes`
  0% { transform: translateY(8px) scale(0.98); opacity: 0; }
  60% { transform: translateY(0) scale(1.02); opacity: 1; }
  100% { transform: translateY(0) scale(1); }
`;

function Toast({ open, onClose, badge, awardedAt, rewardXp, title }) {
  const { t } = useI18n();
  // ... (Le code de ce sous-composant ne change pas)
  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit onExited={onClose}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed', right: 24, bottom: 24, px: 2.5, py: 1.75, borderRadius: 3,
          bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(18,18,24,0.95)' : 'rgba(255,255,255,0.95)',
          border: (t) => `1px solid ${t.palette.success.main}60`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.28)', zIndex: 1400, display: 'flex',
          alignItems: 'center', gap: 1.5, backdropFilter: 'blur(10px)',
          animation: `${popIn} 320ms ease-out`,
        }}
      >
        <Avatar sx={{ bgcolor: 'warning.main', color: 'black', boxShadow: 2 }}>
          {iconMap[badge?.icon] || <EmojiEventsIcon />}
        </Avatar>
        <Box>
          <Typography variant="overline" sx={{ opacity: 0.8 }}>{t('notifications.toast.unlocked')}</Typography>
          <Typography variant="subtitle1" fontWeight={700}>{badge?.name}</Typography>
          <Typography variant="body2" color="text.secondary">{badge?.description}</Typography>
          {(rewardXp || title) && (
            <Typography variant="caption" color="success.main" fontWeight={600}>
              {rewardXp ? `+${rewardXp} XP` : ''} {rewardXp && title ? '•' : ''} {title || ''}
            </Typography>
          )}
        </Box>
      </Paper>
    </Slide>
  );
}

export default function AchievementToast() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const { lastMessage } = useWebSocket(); // On utilise le message du contexte

  // On supprime l'ancien useEffect qui créait la connexion WebSocket.
  // Ce nouvel useEffect réagit aux messages du contexte.
  useEffect(() => {
  if (!lastMessage) return;
  console.log('WS message →', lastMessage);
  if (lastMessage?.type === 'badge_awarded' && lastMessage?.badge) {
    setQueue((q) => [...q, {
      badge: lastMessage.badge,
      awardedAt: lastMessage.awarded_at,
      rewardXp: lastMessage.reward_xp,
      title: lastMessage.title,
    }]);
  }
}, [lastMessage]); // Se déclenche à chaque nouveau message

  // La logique de file d'attente ne change pas
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [first, ...rest] = queue;
      setCurrent(first);
      setQueue(rest);
    }
  }, [queue, current]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), 4000);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;
  return (
    <Toast
      open={Boolean(current)}
      onClose={() => setCurrent(null)}
      badge={current.badge}
      awardedAt={current.awardedAt}
      rewardXp={current.rewardXp}
      title={current.title}
    />
  );
}
