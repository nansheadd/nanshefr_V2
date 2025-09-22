import React, { useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import InterestsIcon from '@mui/icons-material/Interests';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useChatContext } from '../context/ChatProvider';

const isPathActive = (currentPath, targetPath) => {
  if (targetPath === '/chat') {
    return currentPath === '/chat' || currentPath === '/chat/';
  }
  return currentPath.startsWith(targetPath);
};

const ChatSidebar = ({ rooms, isLoading, error }) => {
  const location = useLocation();
  const { rooms: activeRooms } = useChatContext();

  const domainRooms = rooms?.domains || [];
  const generalRoom = rooms?.general || {
    label: 'Chat général',
    description: 'Discutez avec tout le monde.',
    slug: 'general',
  };

  const activeCounts = useMemo(() => {
    const map = new Map();
    Object.entries(activeRooms || {}).forEach(([roomId, roomState]) => {
      if (roomState?.activeUsers) {
        map.set(roomId, roomState.activeUsers.length);
      }
    });
    return map;
  }, [activeRooms]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', md: 280 },
        borderRight: { md: (theme) => `1px solid ${theme.palette.divider}` },
      }}
    >
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="h6" gutterBottom>
          Salons
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rejoignez le chat général ou les salons par domaine.
        </Typography>
      </Box>
      <Divider />
      <List component="nav" disablePadding>
        <ListItemButton
          component={RouterLink}
          to="/chat"
          selected={isPathActive(location.pathname, '/chat') && !location.pathname.startsWith('/chat/domain')}
        >
          <ListItemIcon>
            <ForumIcon />
          </ListItemIcon>
          <ListItemText
            primary={generalRoom.label || 'Chat général'}
            secondary={generalRoom.description || 'Espace commun pour toutes les discussions.'}
          />
        </ListItemButton>
      </List>
      <Divider textAlign="left" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <InterestsIcon fontSize="small" />
          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Domaines
          </Typography>
        </Stack>
      </Divider>
      <Box sx={{ px: 1 }}>
        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={20} />
          </Stack>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ px: 1, py: 2 }}>
            Impossible de charger la liste des salons.
          </Typography>
        ) : domainRooms.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2 }}>
            Aucun domaine disponible pour le moment.
          </Typography>
        ) : (
          <List dense disablePadding>
            {domainRooms.map((room) => {
              const domainSlug = encodeURIComponent(room.slug || room.domain || room.id);
              const to = `/chat/domain/${domainSlug}`;
              const roomId = `domain:${room.domain || room.slug || room.id}`;
              const activeCount = activeCounts.get(roomId) ?? room.activeUserCount ?? 0;
              return (
                <ListItemButton
                  key={roomId}
                  component={RouterLink}
                  to={to}
                  selected={isPathActive(location.pathname, to)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <InterestsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={room.label || room.domain || room.id}
                    secondary={room.description}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                  {activeCount > 0 && (
                    <Typography variant="caption" color="text.secondary">{activeCount}</Typography>
                  )}
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default ChatSidebar;
