
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
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../../../hooks/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import NotificationBell from '../../notifications/components/NotificationBell';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarsIcon from '@mui/icons-material/Stars';
import frameStyles from '../../profile/constants/frameStyles';

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  padding: theme.spacing(3),
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const WelcomeText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
}));

const pickFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const resolvePaletteColor = (theme, rawColor) => {
  if (!rawColor) return undefined;
  if (typeof rawColor !== 'string') return rawColor;
  const color = rawColor.trim();
  if (!color) return undefined;
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
    return color;
  }

  const parts = color.split('.');
  let current = theme.palette;
  for (let index = 0; index < parts.length; index += 1) {
    const key = parts[index];
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      current = current[key];
    } else {
      current = undefined;
      break;
    }
  }

  return typeof current === 'string' ? current : color;
};

const getStatusSlug = (value = '') => {
  const normalized = value.toString().toLowerCase();
  if (!normalized) return '';
  const segments = normalized.split('.');
  return segments[segments.length - 1];
};

const getPremiumLabel = (statusSlug, rawStatus, isSuperuser) => {
  if (isSuperuser) return 'Administration';
  switch (statusSlug) {
    case 'trialing':
      return 'Essai Premium';
    case 'active':
    case 'premium':
      return 'Premium actif';
    case 'past_due':
      return 'Paiement en attente';
    case 'canceled':
    case 'cancelled':
      return 'Premium expiré';
    default:
      if (!rawStatus) return 'Premium';
      return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  }
};

const getAvatarFrameStyles = (theme, frameKey, user, { compact = false } = {}) => {
  const baseFrame = frameStyles[frameKey] || frameStyles.default || {};
  const borderValue = baseFrame.border || '3px solid';
  const defaultBorderColor = resolvePaletteColor(theme, baseFrame.borderColor) || theme.palette.primary.main;

  const customBorderSource = pickFirstDefined(
    user?.avatar_frame_color,
    user?.avatar_frame_hex,
    user?.avatar_frame_color_hex
  );
  const resolvedBorderColor = resolvePaletteColor(theme, customBorderSource) || defaultBorderColor;

  const glowSource = pickFirstDefined(
    user?.avatar_frame_glow_color,
    user?.avatar_frame_glow_hex,
    user?.avatar_frame_glow
  );
  const resolvedGlowColor = resolvePaletteColor(theme, glowSource) || resolvedBorderColor;

  const customBoxShadow = pickFirstDefined(
    user?.avatar_frame_box_shadow,
    user?.avatar_frame_shadow,
    user?.avatar_frame_boxshadow
  );

  const fallbackBoxShadow = compact
    ? `0 0 0 3px ${alpha(resolvedGlowColor, 0.2)}, 0 8px 18px ${alpha(resolvedGlowColor, 0.3)}`
    : `0 0 0 4px ${alpha(resolvedGlowColor, 0.25)}, 0 12px 28px ${alpha(resolvedGlowColor, 0.35)}`;

  return {
    border: borderValue,
    borderColor: resolvedBorderColor,
    boxShadow: customBoxShadow || baseFrame.boxShadow || fallbackBoxShadow,
  };
};

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
  const rawSubscriptionStatus = (user?.subscription_status ?? '').toString();
  const subscriptionSlug = getStatusSlug(rawSubscriptionStatus);
  const isPremiumUser = Boolean(
    user?.is_superuser || ['premium', 'active', 'trialing'].includes(subscriptionSlug)
  );
  const premiumLabel = getPremiumLabel(subscriptionSlug, rawSubscriptionStatus, Boolean(user?.is_superuser));
  const titleTextColor = pickFirstDefined(
    user?.title_color,
    user?.titleColor,
    user?.title_text_color
  );
  const titleBackgroundColor = pickFirstDefined(
    user?.title_background_color,
    user?.title_background,
    user?.titleBackgroundColor
  );

  const headerAccentSources = [
    user?.dashboard_accent_color,
    user?.header_accent_color,
    user?.avatar_frame_color,
    currentFrame?.borderColor,
  ];
  const actionButtonBaseSx = {
    borderRadius: 3,
    textTransform: 'none',
    fontWeight: 600,
    px: 2.5,
    minHeight: 44,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <HeaderContainer
      sx={(theme) => {
        const accentSource = pickFirstDefined(...headerAccentSources);
        const accentColor = resolvePaletteColor(theme, accentSource) || theme.palette.primary.main;
        return {
          borderColor: alpha(accentColor, 0.3),
          boxShadow: `0 18px 42px ${alpha(accentColor, 0.16)}`,
        };
      }}
    >
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
              sx={(theme) => ({
                width: 72,
                height: 72,
                fontSize: 28,
                bgcolor: 'primary.main',
                borderRadius: '28%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                ...getAvatarFrameStyles(theme, frameKey, user),
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              })}
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
                      sx={(theme) => {
                        const resolvedText = resolvePaletteColor(theme, titleTextColor);
                        const resolvedBackground = resolvePaletteColor(theme, titleBackgroundColor);
                        if (resolvedText || resolvedBackground) {
                          const accent = resolvedText || theme.palette.secondary.dark;
                          const backgroundShade =
                            resolvedBackground ||
                            alpha(accent, theme.palette.mode === 'dark' ? 0.3 : 0.12);
                          return {
                            px: 1.25,
                            fontWeight: 700,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: accent,
                            color: accent,
                            backgroundColor: backgroundShade,
                            '& .MuiChip-icon': {
                              color: accent,
                            },
                          };
                        }
                        const secondaryAccent = theme.palette.mode === 'dark'
                          ? theme.palette.secondary.light
                          : theme.palette.secondary.dark;
                        return {
                          px: 1.1,
                          fontWeight: 700,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha(secondaryAccent, 0.6),
                          backgroundColor: alpha(
                            secondaryAccent,
                            theme.palette.mode === 'dark' ? 0.18 : 0.12
                          ),
                          color: secondaryAccent,
                          '& .MuiChip-icon': {
                            color: secondaryAccent,
                          },
                        };
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
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, sm: 1.75 }}
          sx={{
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            width: { xs: '100%', md: 'auto' },
            mt: { xs: 2, md: 0 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              columnGap: 1.25,
              rowGap: 1.25,
              flexGrow: 1,
            }}
          >
            <NotificationBell />
            {isPremiumUser ? (
              <Chip
                icon={<WorkspacePremiumIcon />}
                label={premiumLabel}
                sx={(theme) => {
                  const badgeBackground = resolvePaletteColor(
                    theme,
                    pickFirstDefined(
                      user?.premium_badge_background_color,
                      user?.premium_badge_background
                    )
                  );
                  const badgeColor = resolvePaletteColor(
                    theme,
                    pickFirstDefined(user?.premium_badge_text_color, user?.premium_badge_color)
                  );
                  const finalBackground =
                    badgeBackground ||
                    alpha(
                      theme.palette.warning.main,
                      theme.palette.mode === 'dark' ? 0.25 : 0.18
                    );
                  const finalColor = badgeColor || theme.palette.warning.dark;
                  const borderColor =
                    resolvePaletteColor(theme, pickFirstDefined(user?.premium_badge_border_color)) ||
                    theme.palette.warning.main;
                  const iconColor =
                    resolvePaletteColor(theme, user?.premium_badge_icon_color) || finalColor;
                  return {
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 1.25,
                    border: '1px solid',
                    borderColor: alpha(borderColor, 0.6),
                    backgroundColor: finalBackground,
                    color: finalColor,
                    '& .MuiChip-icon': {
                      color: iconColor,
                    },
                  };
                }}
              />
            ) : (
              <Button
                variant="contained"
                color="secondary"
                component={RouterLink}
                to="/premium"
                startIcon={<WorkspacePremiumIcon />}
                sx={(theme) => ({
                  ...actionButtonBaseSx,
                  fontWeight: 700,
                  boxShadow: `0 10px 26px ${alpha(theme.palette.secondary.main, 0.28)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.32)}`,
                  },
                })}
              >
                Devenir Premium
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/capsules"
              state={{ openCreate: true }}
              startIcon={<AddCircleIcon />}
              sx={(theme) => ({
                ...actionButtonBaseSx,
                boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.32)}`,
                },
              })}
            >
              Créer une capsule
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/stats"
              startIcon={<QueryStatsIcon />}
              sx={(theme) => ({
                ...actionButtonBaseSx,
                borderWidth: 1.5,
                borderColor: alpha(theme.palette.text.primary, 0.18),
                color: theme.palette.text.primary,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: alpha(theme.palette.primary.main, 0.45),
                },
              })}
            >
              Mes Stats
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/feature-votes"
              startIcon={<HowToVoteIcon />}
              sx={(theme) => ({
                ...actionButtonBaseSx,
                borderWidth: 1.5,
                borderColor: alpha(theme.palette.text.primary, 0.18),
                color: theme.palette.text.primary,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: alpha(theme.palette.secondary.main, 0.5),
                },
              })}
            >
              Votes Communauté
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/badges"
              startIcon={<EmojiEventsIcon />}
              sx={(theme) => ({
                ...actionButtonBaseSx,
                borderWidth: 1.5,
                borderColor: alpha(theme.palette.text.primary, 0.18),
                color: theme.palette.text.primary,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: alpha(theme.palette.success.main, 0.5),
                },
              })}
            >
              Mes Badges
            </Button>
          </Box>

          {isLoading ? (
            <Skeleton
              variant="circular"
              width={48}
              height={48}
              sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
            />
          ) : (
            <IconButton
              onClick={handleProfileClick}
              disabled={!hasUser}
              sx={{ p: 0, alignSelf: { xs: 'flex-start', md: 'center' } }}
            >
              <Avatar
                src={avatarUrl || undefined}
                alt={displayName}
                sx={(theme) => ({
                  width: 48,
                  height: 48,
                  fontSize: 20,
                  bgcolor: 'primary.main',
                  borderRadius: '30%',
                  ...getAvatarFrameStyles(theme, frameKey, user, { compact: true }),
                })}
              >
                {avatarUrl ? null : avatarInitial || <PersonIcon />}
              </Avatar>
            </IconButton>
          )}
        </Stack>

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
            {user?.is_superuser && (
              <MenuItem
                component={RouterLink}
                to="/feature-votes/manage"
                onClick={handleClose}
                sx={{ py: 1.5 }}
              >
                <HowToVoteIcon sx={{ mr: 2 }} />
                Gérer les votes
              </MenuItem>
            )}
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
      </HeaderContainer>
  );
};

export default DashboardHeader;
