import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link as RouterLink } from 'react-router-dom';
import { ChatProvider } from '../context/ChatProvider';
import ChatRoomView from './ChatRoomView';

const formatDomainLabel = (value) => {
  if (!value) return 'domaine';
  const normalized = value.replace(/[-_]/g, ' ');
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const CapsuleChatPanel = ({ domain, area, capsuleTitle }) => {
  const sanitizedDomain = domain || 'general';
  const sanitizedArea = area || '';

  const fullChatLink = useMemo(() => {
    const base = `/chat/domain/${encodeURIComponent(sanitizedDomain)}`;
    if (sanitizedArea) {
      return `${base}?area=${encodeURIComponent(sanitizedArea)}`;
    }
    return base;
  }, [sanitizedArea, sanitizedDomain]);

  const historyParamsValue = useMemo(() => ({ capsule: capsuleTitle }), [capsuleTitle]);

  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <ForumIcon color="primary" />
        <Box>
          <Typography variant="h6">
            Salon {formatDomainLabel(sanitizedDomain)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Partagez vos questions sur « {capsuleTitle} » avec les autres apprenants du domaine.
          </Typography>
        </Box>
      </Stack>
      <Divider />
      <ChatProvider>
        <ChatRoomView
          roomId={`domain:${sanitizedDomain}`}
          domain={sanitizedDomain}
          title={`Salon ${formatDomainLabel(sanitizedDomain)}`}
          description={null}
          defaultArea={sanitizedArea}
          initialAreaFilter={sanitizedArea}
          allowAreaSelection={false}
          areaLocked
          showActiveUsers
          variant="embedded"
          metadata={{ capsule: capsuleTitle }}
          historyRoomId={sanitizedDomain}
          historyParams={historyParamsValue}
        />
      </ChatProvider>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          component={RouterLink}
          to={fullChatLink}
          variant="outlined"
          endIcon={<LaunchIcon />}
        >
          Ouvrir le salon complet
        </Button>
      </Box>
    </Paper>
  );
};

export default CapsuleChatPanel;
