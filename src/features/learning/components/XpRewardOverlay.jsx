import React, { useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { alpha, keyframes, styled } from '@mui/material/styles';

const popIn = keyframes`
  0% { transform: translateY(16px) scale(0.9); opacity: 0; }
  40% { transform: translateY(0) scale(1.05); opacity: 1; }
  70% { transform: translateY(-6px) scale(1); opacity: 1; }
  100% { transform: translateY(-8px) scale(0.98); opacity: 0; }
`;

const particleBurst = keyframes`
  0% { transform: translate(0, 0) scale(0.4); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0.1); opacity: 0; }
`;

const Overlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: theme.zIndex.modal + 10,
}));

const RewardCard = styled(Box)(({ theme }) => ({
  minWidth: 220,
  padding: theme.spacing(3, 4),
  borderRadius: 18,
  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.success.main, 0.35)}`,
  color: theme.palette.common.white,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  position: 'relative',
  overflow: 'hidden',
  animation: `${popIn} 1.4s ease-out forwards`,
}));

const Particle = styled('span')(({ theme }) => ({
  position: 'absolute',
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`,
  opacity: 0,
  animation: `${particleBurst} 900ms ease-out forwards`,
}));

const XpRewardOverlay = ({ reward, onDone }) => {
  const particles = useMemo(() => {
    if (!reward) return [];
    const count = 14;
    const baseAngle = Math.random() * 20;
    return Array.from({ length: count }).map((_, index) => {
      const angle = ((360 / count) * index + baseAngle) * (Math.PI / 180);
      const distance = 90 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      return {
        dx,
        dy,
        delay: 80 + index * 35,
        size: 8 + Math.random() * 6,
        hue: index % 2 === 0 ? 'warning' : 'primary',
      };
    });
  }, [reward]);

  useEffect(() => {
    if (!reward) return undefined;
    const timeout = setTimeout(() => {
      onDone?.();
    }, 1400);
    return () => clearTimeout(timeout);
  }, [reward, onDone]);

  if (!reward) {
    return null;
  }

  return (
    <Overlay>
      <RewardCard>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            +{reward.xp}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>XP</Typography>
        </Box>
        {reward.title && (
          <Typography variant="body2" sx={{ opacity: 0.85, textAlign: 'center' }}>
            {reward.title}
          </Typography>
        )}
        {particles.map((particle, index) => (
          <Particle
            key={index}
            style={{
              '--dx': `${particle.dx}px`,
              '--dy': `${particle.dy}px`,
              animationDelay: `${particle.delay}ms`,
              width: particle.size,
              height: particle.size,
              background:
                particle.hue === 'primary'
                  ? `linear-gradient(135deg, ${alpha('#60a5fa', 0.9)}, #2563eb)`
                  : undefined,
            }}
          />
        ))}
      </RewardCard>
    </Overlay>
  );
};

export default XpRewardOverlay;
