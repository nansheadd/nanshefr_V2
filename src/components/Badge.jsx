import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Zoom
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';

// Animations
const shine = keyframes`
  0% { background-position: -200% center; filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(30deg); }
  100% { background-position: 200% center; filter: hue-rotate(0deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-8px) scale(1.02); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px currentColor; }
  50% { box-shadow: 0 0 40px currentColor; }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

// Styles de tiers
const tierStyles = {
  bronze: { p: '#CD7F32', s: '#8B4513', g: '#FFA500' },
  silver: { p: '#C0C0C0', s: '#808080', g: '#FFFFFF' },
  gold: { p: '#FFD700', s: '#B8860B', g: '#FFF8DC' },
  diamond: { p: '#00E5FF', s: '#00ACC1', g: '#E0F7FA' }
};

// Badge hexagonal
const HexBadge = styled(Box)(({ theme }) => ({
  width: 180,
  height: 200,
  position: 'relative',
  cursor: 'pointer',
  clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.05)',
    '& .float': { animation: `${float} 2s infinite` }
  }
}));

// Fond du badge
const BadgeBg = styled(Box)(({ theme, tier, $earned }) => {
  const t = tierStyles[tier] || tierStyles.bronze;
  return {
    position: 'absolute',
    inset: 0,
    background: $earned 
      ? `linear-gradient(135deg, ${t.p}, ${t.g}, ${t.s})`
      : alpha(theme.palette.grey[700], 0.8),
    '&::before': $earned ? {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.3)}, transparent)`,
      backgroundSize: '200% 200%',
      animation: `${shine} 6s infinite`
    } : {}
  };
});

// Bordure néon
const Border = styled(Box)(({ theme, tier, $earned }) => {
  const t = tierStyles[tier] || tierStyles.bronze;
  return {
    position: 'absolute',
    inset: -3,
    background: $earned ? t.p : alpha(theme.palette.grey[600], 0.5),
    clipPath: 'inherit',
    zIndex: -1,
    filter: $earned ? 'blur(6px)' : 'none',
    animation: $earned ? `${pulse} 2s infinite` : 'none'
  };
});

// Icône centrale
const IconCore = styled(Box)(({ theme, $earned }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: $earned 
    ? 'rgba(255,255,255,0.2)' 
    : alpha(theme.palette.grey[600], 0.3),
  backdropFilter: 'blur(10px)',
  border: `2px solid ${alpha('#fff', $earned ? 0.3 : 0.1)}`,
  boxShadow: $earned ? '0 0 20px rgba(255,255,255,0.3)' : 'none',
  '& .icon': {
    fontSize: '1.8rem',
    color: $earned ? '#fff' : alpha('#fff', 0.3),
    filter: $earned ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none'
  }
}));

// Barre de progression
const ProgressBar = styled(Box)(({ theme }) => ({
  height: 10,
  borderRadius: 10,
  background: alpha(theme.palette.grey[800], 0.6),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  overflow: 'hidden',
  '& .bar': {
    height: '100%',
    background: 'linear-gradient(90deg, #00C853, #64DD17)',
    boxShadow: '0 0 10px rgba(100, 221, 23, 0.5)',
    transition: 'width 0.5s'
  }
}));

// Badge de rareté
const RarityDot = styled(Box)(({ rarity }) => {
  const colors = {
    legendary: '#FFD700',
    epic: '#E91E63', 
    rare: '#00BCD4',
    common: '#8BC34A'
  };
  return {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: colors[rarity],
    border: '2px solid #fff',
    boxShadow: `0 0 15px ${colors[rarity]}`,
    animation: `${glow} 2s infinite`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    zIndex: 10
  };
});

// Dialog gaming
const GDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background: alpha('#1a1a2e', 0.95),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha('#00E5FF', 0.3)}`,
    boxShadow: '0 0 40px rgba(0, 229, 255, 0.2)',
    color: '#fff'
  }
}));

const Badge = ({
  name = "Badge",
  description = "Description",
  earned = false,
  tier = "bronze",
  category = "Progression",
  xpPoints = 50,
  progress = null,
  icon = "trophy",
  unlockedDate = null,
  rarity = "common",
  onClick = () => {}
}) => {
  const [open, setOpen] = useState(false);

  const getIcon = () => {
    const icons = {
      star: AutoAwesomeIcon,
      trophy: EmojiEventsIcon,
      check: CheckCircleIcon
    };
    const Icon = earned ? (icons[icon] || EmojiEventsIcon) : LockOutlinedIcon;
    return <Icon className="icon" />;
  };

  const rarityIcons = { legendary: '⚡', epic: '💎', rare: '✨', common: '•' };
  const progressPercent = progress ? Math.min((progress.current / progress.target) * 100, 100) : 0;

  return (
    <>
      <HexBadge onClick={() => { setOpen(true); onClick(); }}>
        <Border tier={tier} $earned={earned} />
        <BadgeBg tier={tier} $earned={earned} className="float" />
        
        {earned && rarity !== 'common' && (
          <RarityDot rarity={rarity}>
            {rarityIcons[rarity]}
          </RarityDot>
        )}

        <Stack
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          sx={{ height: '100%', p: 2, position: 'relative', zIndex: 1 }}
        >
          <IconCore $earned={earned}>
            {getIcon()}
          </IconCore>

          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 900,
                color: earned ? '#fff' : alpha('#fff', 0.3),
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.75rem'
              }}
            >
              {name}
            </Typography>

            <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: earned ? '#FFD700' : alpha('#fff', 0.2),
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {xpPoints} XP
              </Typography>
              {earned && <BoltIcon sx={{ fontSize: '0.9rem', color: '#FFD700' }} />}
            </Stack>
          </Box>

          {progress && !earned && (
            <Box sx={{ width: '100%', px: 1 }}>
              <ProgressBar>
                <Box className="bar" sx={{ width: `${progressPercent}%` }} />
              </ProgressBar>
              <Typography
                variant="caption"
                sx={{
                  color: '#00E5FF',
                  fontSize: '0.65rem',
                  display: 'block',
                  textAlign: 'center',
                  mt: 0.5,
                  fontWeight: 700
                }}
              >
                {progress.current}/{progress.target}
              </Typography>
            </Box>
          )}
        </Stack>
      </HexBadge>

      <GDialog open={open} onClose={() => setOpen(false)} TransitionComponent={Zoom} maxWidth="sm">
        <DialogTitle sx={{ borderBottom: `1px solid ${alpha('#00E5FF', 0.2)}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ width: 40 }} />
            <Stack spacing={1} alignItems="center">
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #00E5FF, #FF00FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase'
                }}
              >
                {name}
              </Typography>
              <Chip
                label={tier.toUpperCase()}
                size="small"
                sx={{
                  background: tierStyles[tier]?.p || '#FFD700',
                  color: '#000',
                  fontWeight: 900
                }}
              />
            </Stack>
            <IconButton onClick={() => setOpen(false)} sx={{ color: '#00E5FF' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(0, 229, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)',
                animation: `${pulse} 2s infinite`
              }}
            >
              {React.cloneElement(getIcon(), { sx: { fontSize: '2.5rem', color: '#00E5FF' } })}
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center', color: alpha('#fff', 0.9) }}>
              {description}
            </Typography>

            <Stack direction="row" spacing={3} sx={{ p: 2, borderRadius: 2, background: alpha('#00E5FF', 0.1) }}>
              {[
                { val: xpPoints, label: 'XP', color: '#FFD700' },
                { val: tier.toUpperCase(), label: 'Niveau', color: '#00E5FF' },
                { val: rarity.toUpperCase(), label: 'Rareté', color: '#FF00FF' }
              ].map((stat, i) => (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: stat.color }}>
                    {stat.val}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {progress && !earned && (
              <Box sx={{ width: '100%', maxWidth: 350 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUpIcon sx={{ color: '#00E5FF', fontSize: '1.2rem' }} />
                  <Typography variant="subtitle2" sx={{ color: '#00E5FF', fontWeight: 700 }}>
                    Progression
                  </Typography>
                </Stack>
                <ProgressBar>
                  <Box className="bar" sx={{ width: `${progressPercent}%` }} />
                </ProgressBar>
                <Typography variant="caption" sx={{ color: '#00E5FF', display: 'block', mt: 1, textAlign: 'center' }}>
                  {progress.current}/{progress.target} ({Math.round(progressPercent)}%)
                </Typography>
              </Box>
            )}

            {earned && unlockedDate && (
              <Chip
                icon={<CheckCircleIcon />}
                label={`Débloqué le ${new Date(unlockedDate).toLocaleDateString('fr-FR')}`}
                sx={{ background: alpha('#00E5FF', 0.2), color: '#00E5FF' }}
              />
            )}

            <Button
              variant="contained"
              onClick={() => setOpen(false)}
              fullWidth
              sx={{
                maxWidth: 280,
                py: 1.5,
                borderRadius: 2,
                background: earned ? '#00E5FF' : '#FF00FF',
                color: earned ? '#000' : '#fff',
                fontWeight: 900,
                boxShadow: `0 8px 20px ${alpha(earned ? '#00E5FF' : '#FF00FF', 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 30px ${alpha(earned ? '#00E5FF' : '#FF00FF', 0.6)}`
                }
              }}
            >
              {earned ? '✨ Continuer' : '🔒 Débloquer'}
            </Button>
          </Stack>
        </DialogContent>
      </GDialog>
    </>
  );
};

export default Badge;