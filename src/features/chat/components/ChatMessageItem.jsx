import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { alpha } from '@mui/material/styles';

const formatChatTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch (error) {
    console.warn('Unable to format chat timestamp', error);
    return date.toLocaleString();
  }
};

const ChatMessageItem = ({ message, isOwn }) => {
  const { username, content, domain, area, createdAt, system } = message;
  const displayName = isOwn ? 'Vous' : username || 'Utilisateur';
  const timestamp = formatChatTimestamp(createdAt);

  if (system) {
    return (
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="small" />}
        sx={{ alignSelf: 'center', maxWidth: '100%' }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </Typography>
        {timestamp && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {timestamp}
          </Typography>
        )}
      </Alert>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        alignSelf: isOwn ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
        width: '100%',
      }}
    >
      {!isOwn && (
        <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main, fontSize: '0.875rem' }}>
          {(username || '?').charAt(0).toUpperCase()}
        </Avatar>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}
        >
          <Typography variant="subtitle2" color={isOwn ? 'primary.main' : 'text.primary'}>
            {displayName}
          </Typography>
          {domain && (
            <Chip label={domain} size="small" color="info" variant="outlined" />
          )}
          {area && (
            <Chip label={area} size="small" color="secondary" variant="outlined" />
          )}
          {timestamp && (
            <Typography variant="caption" color="text.secondary">
              {timestamp}
            </Typography>
          )}
        </Stack>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: 1,
            borderColor: (theme) =>
              isOwn ? alpha(theme.palette.primary.main, 0.4) : theme.palette.divider,
            backgroundColor: (theme) =>
              isOwn
                ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.12)
                : theme.palette.background.paper,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {content}
          </Typography>
        </Paper>
      </Box>
    </Stack>
  );
};

export default ChatMessageItem;
