
// src/features/dashboard/components/DashboardHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationBell from '../../notifications/components/NotificationBell';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarsIcon from '@mui/icons-material/Stars';
import frameStyles from '../../profile/constants/frameStyles';

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}30`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const WelcomeText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
}));

const DashboardHeader = () => {
  const { user, isLoading, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileClick = (event) => {
    if (isLoading) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const hasUser = Boolean(user);
  const displayName = user?.display_name || user?.username || 'Utilisateur';
  const avatarUrl = user?.avatar_url || user?.profile_picture_url || user?.avatar || null;
  const avatarInitial = hasUser ? displayName?.charAt(0)?.toUpperCase() : null;
  const frameKey = hasUser && user?.avatar_frame && frameStyles[user.avatar_frame]
    ? user.avatar_frame
    : 'default';
  const currentFrame = frameStyles[frameKey];

  return (
    <HeaderContainer>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
          {isLoading ? (
            <Skeleton variant="circular" width={72} height={72} />
          ) : (
            <Avatar
              src={avatarUrl || undefined}
              alt={displayName}
              sx={{
                width: 72,
                height: 72,
                fontSize: 28,
                bgcolor: 'primary.main',
                borderRadius: '28%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                ...currentFrame,
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {avatarUrl
                ? null
                : avatarInitial || <PersonIcon fontSize="medium" />}
            </Avatar>
          )}

          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            {isLoading ? (
              <>
                <Skeleton variant="text" width={200} sx={{ fontSize: '2rem' }} />
                <Skeleton variant="text" width={240} />
              </>
            ) : (
              <>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  sx={{ minWidth: 0 }}
                >
                  <WelcomeText variant="h4" component="h1">
                    {`${getGreeting()}, ${displayName} ! 👋`}
                  </WelcomeText>
                  {user?.title && (
                    <Chip
                      label={user.title}
                      size="small"
                      icon={<StarsIcon fontSize="small" />}
                      sx={{
                        px: 1,
                        fontWeight: 600,
                        borderRadius: 2,
                        background: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(121, 80, 255, 0.25)'
                            : 'rgba(121, 80, 255, 0.15)',
                        color: (theme) =>
                          theme.palette.mode === 'dark'
                            ? theme.palette.secondary.light
                            : theme.palette.secondary.dark,
                        '& .MuiChip-icon': {
                          color: 'inherit',
                        },
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Prêt pour une nouvelle session d'apprentissage ?
                </Typography>
              </>
            )}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            flexWrap: 'wrap',
            rowGap: 1.5,
            columnGap: 1.5,
            mt: { xs: 2, md: 0 },
          }}
        >
          <NotificationBell />
          <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to="/premium"
            startIcon={<WorkspacePremiumIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(121, 80, 255, 0.25)',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Devenir Premium
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/capsules"
            state={{ openCreate: true }}
            startIcon={<AddCircleIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Créer une capsule
          </Button>
          {/* Bouton Stats */}
          <Button
            variant="outlined"
            component={RouterLink}
            to="/stats"
            startIcon={<QueryStatsIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Mes Stats
          </Button>
          {/* Bouton Badges */}
          <Button
            variant="outlined"
            component={RouterLink}
            to="/badges"
            startIcon={<EmojiEventsIcon />}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Mes Badges
          </Button>

          {/* Menu Profil */}
          {isLoading ? (
            <Skeleton variant="circular" width={48} height={48} />
          ) : (
            <IconButton onClick={handleProfileClick} disabled={!hasUser} sx={{ p: 0 }}>
              <Avatar
                src={avatarUrl || undefined}
                alt={displayName}
                sx={{
                  width: 48,
                  height: 48,
                  fontSize: 20,
                  bgcolor: 'primary.main',
                  borderRadius: '30%',
                  ...currentFrame,
                }}
              >
                {avatarUrl ? null : avatarInitial || <PersonIcon />}
              </Avatar>
            </IconButton>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                mt: 1,
                minWidth: 180,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }
            }}
          >
            {hasUser && (
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {displayName}
                </Typography>
                {user?.email && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                )}
              </Box>
            )}
            {hasUser && <Divider sx={{ my: 0.5 }} />}
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleClose}
              sx={{ py: 1.5 }}
            >
              <PersonIcon sx={{ mr: 2 }} />
              Mon Profil
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleClose}
              sx={{ py: 1.5 }}
            >
              <SettingsIcon sx={{ mr: 2 }} />
              Paramètres du compte
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => {
                handleClose();
                logout();
              }}
              sx={{ py: 1.5, color: 'error.main' }}
            >
              <LogoutIcon sx={{ mr: 2 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </HeaderContainer>
  );
};

export default DashboardHeader;
