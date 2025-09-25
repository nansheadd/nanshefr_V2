import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

const STATUS_CONFIG = {
  connecting: { label: 'Connexion…', color: 'info' },
  connected: { label: 'Connecté', color: 'success' },
  error: { label: 'Erreur', color: 'error' },
  closed: { label: 'Déconnecté', color: 'default' },
  idle: { label: 'Inactif', color: 'default' },
  loading: { label: 'Chargement…', color: 'info' },
  'loading-history': { label: 'Chargement…', color: 'info' },
};

const ChatRoomHeader = ({
  title,
  description,
  status,
  isLoadingHistory = false,
  areaFilter,
  onAreaFilterChange,
  areaOptions = [],
  showAreaFilter = true,
  lockedArea,
  actions,
  activeCount,
}) => {
  const statusKey = isLoadingHistory ? 'loading' : status;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.idle;
  const hasAreaFilter = showAreaFilter && areaOptions.length > 0;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Typography variant="h5" sx={{ mr: 1 }}>
            {title}
          </Typography>
          <Chip size="small" color={statusConfig.color} label={statusConfig.label} />
          {typeof activeCount === 'number' && (
            <Chip size="small" label={`${activeCount} en ligne`} />
          )}
          {lockedArea && (
            <Chip size="small" color="secondary" label={`Zone : ${lockedArea}`} />
          )}
        </Stack>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
        {hasAreaFilter && (
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel id="chat-room-area-filter">Filtrer par zone</InputLabel>
            <Select
              labelId="chat-room-area-filter"
              label="Filtrer par zone"
              value={areaFilter || ''}
              onChange={(event) => onAreaFilterChange?.(event.target.value)}
            >
              <MenuItem value="">Toutes les zones</MenuItem>
              {areaOptions.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {actions && <Box sx={{ display: 'flex', alignItems: 'center' }}>{actions}</Box>}
      </Stack>
    </Stack>
  );
};

export default ChatRoomHeader;
