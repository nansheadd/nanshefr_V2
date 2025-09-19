import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Box, Button, CircularProgress, Divider, IconButton, List, ListItem, ListItemText, Menu, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import apiClient from '../../../api/axiosConfig';
import { useWebSocket } from '../../../contexts/WebSocketProvider'; // On importe le hook du contexte

const fetchUnreadCount = async () => {
  const { data } = await apiClient.get('/notifications/unread-count');
  return data.unread_count ?? 0;
};

const fetchNotifications = async () => {
  const { data } = await apiClient.get('/notifications?limit=10');
  return data;
};

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { lastMessage } = useWebSocket(); // On utilise le message du contexte

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
  });

  const { data: notifications = [], isLoading: isLoadingList } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: fetchNotifications,
    enabled: open,
    staleTime: 0,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => apiClient.post(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = (notification) => {
    if (notification.status === 'unread') {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      handleClose();
    }
  };

  // On supprime l'ancien useEffect qui créait la connexion WebSocket.
  // Ce nouvel useEffect réagit aux messages du contexte.
  useEffect(() => {
    if (!lastMessage) return; // Ne rien faire si aucun message n'est arrivé

    try {
      if (lastMessage.unread_count !== undefined) {
        console.log("🔔 NotificationBell a reçu un nouveau compte via le contexte !", lastMessage.unread_count);
        queryClient.setQueryData(['notifications', 'unread-count'], lastMessage.unread_count);
      }
      if (lastMessage.type === 'notification_created') {
        // Invalider la liste pour forcer un refetch est plus simple et fiable
        queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      }
      // ... (les autres logiques pour 'notification_updated' et 'notifications_cleared' restent valides)
    } catch (error) {
      console.error('Erreur de traitement du message WebSocket dans NotificationBell:', error);
    }
  }, [lastMessage, queryClient]); // Se déclenche à chaque nouveau message

  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  // Le JSX du composant ne change pas
  return (
    <>
      <IconButton onClick={handleOpen} size="large" sx={{ position: 'relative' }}>
        <Badge badgeContent={displayCount} color="error" overlap="circular" invisible={unreadCount === 0}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl} open={open} onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ '& .MuiPaper-root': { width: 360, maxHeight: 460, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
          <Button size="small" startIcon={<CheckIcon />} onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isLoading || unreadCount === 0}>
            Tout marquer lu
          </Button>
        </Box>
        <Divider />
        {isLoadingList ? (
          <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <HourglassEmptyIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography component="span" variant="body2">Pas de notifications pour le moment.</Typography>
          </Box>
        ) : (
          <List dense sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem key={notification.id} button onClick={() => handleNotificationClick(notification)} sx={{ alignItems: 'flex-start', bgcolor: notification.status === 'unread' ? 'action.hover' : 'transparent' }}>
                <ListItemText
                  primary={<Typography component="span" variant="subtitle2" fontWeight={notification.status === 'unread' ? 700 : 500}>{notification.title}</Typography>}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography component="span" variant="body2" color="text.secondary">{notification.message}</Typography>
                      <Typography component="span" variant="caption" color="text.disabled">{new Date(notification.created_at).toLocaleString()}</Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;