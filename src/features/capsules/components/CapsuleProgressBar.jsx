import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber';

const CapsuleProgressBar = ({ current = 0, target = 60000, label = 'Progression', dense = false }) => {
  const displayTarget = target && target > 0 ? target : 0;
  const clampedCurrent = displayTarget > 0
    ? Math.min(Math.max(current || 0, 0), displayTarget)
    : 0;
  const animatedXp = useAnimatedNumber(clampedCurrent, 600);
  const percent = displayTarget > 0 ? Math.min(100, (animatedXp / displayTarget) * 100) : 0;
  const roundedXp = Math.round(animatedXp);

  const spacing = dense ? 0.5 : 1;

  return (
    <Box sx={{ mt: dense ? 1 : 2 }}> 
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: spacing }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={600}>
          {Math.round(percent)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{ height: dense ? 6 : 8, borderRadius: 4, mb: spacing }}
      />
      <Typography variant="caption" color="text.secondary">
        {roundedXp.toLocaleString()} / {displayTarget.toLocaleString()} XP
      </Typography>
    </Box>
  );
};

export default CapsuleProgressBar;
