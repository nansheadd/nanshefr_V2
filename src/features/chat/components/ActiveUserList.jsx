import React from 'react';
import {
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

const ActiveUserList = ({ users = [], status, variant = 'full' }) => {
  const isLoading = status === 'connecting';
  const displayUsers = Array.isArray(users) ? users : [];
  const maxHeight = variant === 'embedded' ? 220 : 320;

  return (
    <Paper
      variant="outlined"
      sx={{
        flexShrink: 0,
        width: { xs: '100%', md: variant === 'full' ? 260 : '100%' },
        p: 2,
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1">Utilisateurs actifs</Typography>
        <Chip size="small" label={displayUsers.length} />
      </Stack>
      {isLoading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="70%" />
        </Stack>
      ) : displayUsers.length > 0 ? (
        <List dense sx={{ overflowY: 'auto' }}>
          {displayUsers.map((user) => (
            <ListItem key={user.id || user.username} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar>{(user.username || '?').charAt(0).toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.username}
                secondary={[user.area, user.domain].filter(Boolean).join(' • ') || undefined}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Aucun utilisateur actif pour le moment.
        </Typography>
      )}
    </Paper>
  );
};

export default ActiveUserList;
