
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
  Divider
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
import EmitBadgeButton from '../../../components/dev/EmitBadgeButton';
import WSStateButton from '../../../components/dev/WSStateButton';

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

const DashboardHeader = ({ user }) => {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileClick = (event) => {
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

  return (
    <HeaderContainer>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={1}>
          <WelcomeText variant="h3" component="h1">
            {getGreeting()}, {user?.username || 'Utilisateur'} ! 👋
          </WelcomeText>
          <Typography variant="body1" color="text.secondary">
            Prêt pour une nouvelle session d'apprentissage ?
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
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
          <IconButton onClick={handleProfileClick}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
                border: '3px solid white',
                boxShadow: 3
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || <PersonIcon />}
            </Avatar>
          </IconButton>

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
