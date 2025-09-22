import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShieldIcon from '@mui/icons-material/Shield';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockResetIcon from '@mui/icons-material/LockReset';
import SaveIcon from '@mui/icons-material/Save';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import StarsIcon from '@mui/icons-material/Stars';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import frameStyles from '../constants/frameStyles';

const frameOptions = [
  {
    value: 'default',
    label: 'Cadre classique',
    description: 'Le look standard disponible pour tout le monde.',
  },
  {
    value: 'premium_glow',
    label: 'Aura Premium',
    description: 'Brille avec un halo doré réservé aux abonnés Premium.',
    requiresPremium: true,
  },
  {
    value: 'cosmic',
    label: 'Cadre cosmique',
    description: 'Débloqué grâce aux badges légendaires.',
    requiresTitle: true,
  },
  {
    value: 'champion',
    label: 'Champion.ne',
    description: "Un cadre vibrant pour les titulaires d'un titre actif.",
    requiresTitle: true,
  },
];

const fetchSubscription = async () => {
  const response = await apiClient.get('/users/me/subscription', {
    validateStatus: (status) => [200, 204, 404].includes(status),
  });

  if (response.status === 204 || response.status === 404) {
    return null;
  }

  return response.data;
};

const fetchBadges = async () => {
  const { data } = await apiClient.get('/badges');
  return data;
};

const updateProfile = async (payload) => {
  const { data } = await apiClient.patch('/users/me', payload);
  return data;
};

const changePassword = async (payload) => {
  const { data } = await apiClient.post('/users/me/change-password', payload);
  return data;
};

const cancelSubscription = async () => {
  const { data } = await apiClient.post('/users/me/subscription/cancel');
  return data;
};

const updateAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await apiClient.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const removeAvatar = async () => {
  const { data } = await apiClient.delete('/users/me/avatar');
  return data;
};

const updateAvatarFrame = async (frame) => {
  const { data } = await apiClient.patch('/users/me', { avatar_frame: frame });
  return data;
};

const updateUserTitle = async (title) => {
  const { data } = await apiClient.patch('/users/me', { title });
  return data;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
};

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [profileForm, setProfileForm] = useState({ username: '', email: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileFeedback, setProfileFeedback] = useState({ severity: 'success', message: '' });
  const [passwordFeedback, setPasswordFeedback] = useState({ severity: 'success', message: '' });
  const [titleFeedback, setTitleFeedback] = useState({ severity: 'success', message: '' });
  const [avatarFeedback, setAvatarFeedback] = useState({ severity: 'success', message: '' });
  const [selectedTitle, setSelectedTitle] = useState('');
  const [frameValue, setFrameValue] = useState('default');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
    });
    setSelectedTitle(user.title || '');
    setFrameValue(user.avatar_frame || 'default');
  }, [user]);

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: fetchSubscription,
  });

  const badgesQuery = useQuery({
    queryKey: ['badges', 'profile'],
    queryFn: fetchBadges,
  });

  const availableTitles = useMemo(() => {
    if (!Array.isArray(badgesQuery.data)) return [];
    return badgesQuery.data
      .filter((entry) => entry?.is_unlocked)
      .map((entry) => ({
        id: entry.badge?.id ?? entry.id,
        label: entry.badge?.title || entry.badge?.name || entry.badge?.slug || entry.badge?.code || entry.badge?.id,
        description: entry.badge?.description,
      }))
      .filter((title) => Boolean(title.label))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [badgesQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setProfileFeedback({ severity: 'success', message: 'Profil mis à jour avec succès.' });
      queryClient.setQueryData(['user'], (prev) => ({ ...(prev || {}), ...(data || {}) }));
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || "Impossible de mettre à jour le profil.";
      setProfileFeedback({ severity: 'error', message: detail });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordFeedback({ severity: 'success', message: 'Mot de passe mis à jour.' });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || "Impossible de mettre à jour le mot de passe.";
      setPasswordFeedback({ severity: 'error', message: detail });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const avatarMutation = useMutation({
    mutationFn: updateAvatar,
    onSuccess: (data) => {
      setAvatarFeedback({ severity: 'success', message: 'Photo de profil mise à jour.' });
      queryClient.setQueryData(['user'], (prev) => ({ ...(prev || {}), ...(data || {}) }));
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || "Impossible de mettre à jour la photo de profil.";
      setAvatarFeedback({ severity: 'error', message: detail });
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: removeAvatar,
    onSuccess: (data) => {
      setAvatarFeedback({ severity: 'success', message: 'Photo de profil réinitialisée.' });
      queryClient.setQueryData(['user'], (prev) => ({ ...(prev || {}), ...(data || {}) }));
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || "Impossible de supprimer la photo de profil.";
      setAvatarFeedback({ severity: 'error', message: detail });
    },
  });

  const frameMutation = useMutation({
    mutationFn: updateAvatarFrame,
    onSuccess: (data) => {
      setAvatarFeedback({ severity: 'success', message: 'Cadre de profil mis à jour.' });
      queryClient.setQueryData(['user'], (prev) => ({ ...(prev || {}), ...(data || {}) }));
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || "Impossible de mettre à jour le cadre.";
      setAvatarFeedback({ severity: 'error', message: detail });
    },
  });

  const titleMutation = useMutation({
    mutationFn: updateUserTitle,
    onSuccess: (data) => {
      setTitleFeedback({ severity: 'success', message: 'Titre mis à jour.' });
      queryClient.setQueryData(['user'], (prev) => ({ ...(prev || {}), ...(data || {}) }));
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail || "Impossible de mettre à jour le titre.";
      setTitleFeedback({ severity: 'error', message: detail });
    },
  });

  const subscription = subscriptionQuery.data;
  const subscriptionStatus = (subscription?.status || user?.subscription_status || '').toString();
  const subscriptionEnd = subscription?.current_period_end || user?.subscription_ends_at || user?.subscription_end;
  const cancelAtPeriodEnd = Boolean(subscription?.cancel_at_period_end || user?.subscription_cancel_at_period_end);

  const isPremium = useMemo(() => {
    const raw = subscriptionStatus.toLowerCase();
    return raw.includes('premium') || raw === 'active' || raw === 'trialing';
  }, [subscriptionStatus]);

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    setProfileFeedback({ severity: 'success', message: '' });
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordFeedback({ severity: 'error', message: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    setPasswordFeedback({ severity: 'success', message: '' });
    changePasswordMutation.mutate({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFeedback({ severity: 'success', message: '' });
    avatarMutation.mutate(file);
  };

  const handleFrameChange = (event, value) => {
    if (!value) return;
    const option = frameOptions.find((item) => item.value === value);
    if (option?.requiresPremium && !isPremium) {
      setAvatarFeedback({ severity: 'error', message: 'Cette option est réservée aux membres Premium.' });
      return;
    }
    if (option?.requiresTitle && availableTitles.length === 0) {
      setAvatarFeedback({ severity: 'error', message: "Débloquez un badge pour accéder à ce cadre." });
      return;
    }
    const previous = frameValue;
    setFrameValue(value);
    setAvatarFeedback({ severity: 'success', message: '' });
    frameMutation.mutate(value, {
      onError: () => {
        setFrameValue(previous);
      },
    });
  };

  const handleTitleSave = () => {
    setTitleFeedback({ severity: 'success', message: '' });
    titleMutation.mutate(selectedTitle || null);
  };

  const avatarUrl = user?.avatar_url || user?.profile_picture_url || user?.avatar || null;
  const avatarInitial = user?.username?.charAt(0)?.toUpperCase() || '?';
  const currentFrame = frameStyles[frameValue] || frameStyles.default;
  const headerTitle = user?.title || selectedTitle;

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={2} alignItems="center">
            <LinearProgress sx={{ width: '100%' }} />
            <Typography variant="body2" color="text.secondary">
              Chargement du profil...
            </Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,58,138,0.85))'
                  : 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,165,233,0.08))',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatarUrl || undefined}
                  alt={user?.username}
                  sx={{
                    width: 108,
                    height: 108,
                    fontSize: 36,
                    bgcolor: 'primary.main',
                    borderRadius: '30%',
                    ...currentFrame,
                  }}
                >
                  {avatarInitial}
                </Avatar>
                <Tooltip title="Changer la photo">
                  <IconButton
                    color="primary"
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      right: -10,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Stack spacing={1}>
                  <Typography variant="h4" fontWeight={700}>
                    {user?.username || 'Mon profil'}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {headerTitle ? (
                      <Chip icon={<StarsIcon />} color="secondary" label={headerTitle} />
                    ) : (
                      <Chip icon={<StarsIcon />} variant="outlined" label="Aucun titre" />
                    )}
                    <Chip icon={<ShieldIcon />} label={user?.email || 'Adresse inconnue'} variant="outlined" />
                    {isPremium ? (
                      <Chip
                        icon={<WorkspacePremiumIcon />}
                        color="warning"
                        label={subscriptionStatus ? subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1) : 'Premium'}
                      />
                    ) : (
                      <Chip variant="outlined" icon={<WorkspacePremiumIcon />} label="Offre Standard" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
                    {user?.bio || "Complétez votre biographie pour raconter votre aventure d'apprentissage."}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarMonthIcon fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Fin de période : {formatDate(subscriptionEnd)}
                      </Typography>
                    </Box>
                    {cancelAtPeriodEnd && (
                      <Chip
                        icon={<CancelScheduleSendIcon />}
                        color="error"
                        variant="outlined"
                        label="Résiliation programmée"
                      />
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={2} component="form" onSubmit={handleProfileSubmit}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Informations personnelles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mettez à jour votre nom d'utilisateur, votre email ou votre bio.
                </Typography>
              </Box>

              {profileFeedback.message && (
                <Alert severity={profileFeedback.severity}>{profileFeedback.message}</Alert>
              )}

              <TextField
                label="Nom d'utilisateur"
                name="username"
                value={profileForm.username}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, username: event.target.value }))}
                fullWidth
              />
              <TextField
                type="email"
                label="Adresse email"
                name="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                fullWidth
              />
              <TextField
                label="Bio"
                name="bio"
                value={profileForm.bio}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
                fullWidth
                minRows={3}
                multiline
              />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={updateProfileMutation.isLoading}
                >
                  Enregistrer
                </Button>
              </Box>
              {updateProfileMutation.isLoading && <LinearProgress />}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={2} component="form" onSubmit={handlePasswordSubmit}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Sécurité du compte
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Changez votre mot de passe pour sécuriser votre compte.
                </Typography>
              </Box>

              {passwordFeedback.message && (
                <Alert severity={passwordFeedback.severity}>{passwordFeedback.message}</Alert>
              )}

              <TextField
                label="Mot de passe actuel"
                type="password"
                value={passwordForm.current_password}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Nouveau mot de passe"
                type="password"
                value={passwordForm.new_password}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm_password: event.target.value }))}
                fullWidth
                required
              />
              <Box>
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<LockResetIcon />}
                  disabled={changePasswordMutation.isLoading}
                >
                  Mettre à jour
                </Button>
              </Box>
              {changePasswordMutation.isLoading && <LinearProgress />}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Abonnement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gérez votre formule et consultez la prochaine date de facturation.
                </Typography>
              </Box>

              {subscriptionQuery.isLoading && <LinearProgress />}

              {subscriptionQuery.isError && (
                <Alert severity="error">Impossible de charger les informations d'abonnement.</Alert>
              )}

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Chip
                  icon={<WorkspacePremiumIcon />}
                  color={isPremium ? 'warning' : 'default'}
                  label={subscriptionStatus ? subscriptionStatus.toUpperCase() : 'AUCUN ABONNEMENT'}
                />
                <Chip
                  icon={<CalendarMonthIcon />}
                  variant="outlined"
                  label={`Renouvellement : ${formatDate(subscriptionEnd)}`}
                />
                {cancelAtPeriodEnd && (
                  <Chip
                    icon={<CancelScheduleSendIcon />}
                    color="error"
                    variant="outlined"
                    label="La résiliation prendra effet à la fin de la période."
                  />
                )}
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/premium"
                  startIcon={<WorkspacePremiumIcon />}
                >
                  Voir les offres Premium
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelScheduleSendIcon />}
                  disabled={cancelSubscriptionMutation.isLoading || !subscriptionStatus}
                  onClick={() => cancelSubscriptionMutation.mutate()}
                >
                  Annuler mon abonnement
                </Button>
              </Stack>

              {cancelSubscriptionMutation.isSuccess && (
                <Alert severity="info">La résiliation a été demandée. Vous conserverez l'accès jusqu'à la fin de la période.</Alert>
              )}
              {cancelSubscriptionMutation.isError && (
                <Alert severity="error">Impossible d'annuler l'abonnement pour le moment.</Alert>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Titres débloqués
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sélectionnez le titre qui apparaîtra sur votre profil. Les titres sont débloqués en gagnant des badges.
                </Typography>
              </Box>

              {badgesQuery.isLoading && <LinearProgress />}
              {badgesQuery.isError && (
                <Alert severity="error">Impossible de récupérer la liste des titres disponibles.</Alert>
              )}
              {titleFeedback.message && <Alert severity={titleFeedback.severity}>{titleFeedback.message}</Alert>}

              <TextField
                select
                label="Titre"
                value={selectedTitle}
                onChange={(event) => setSelectedTitle(event.target.value)}
                helperText={availableTitles.length ? 'Choisissez un titre ou laissez vide pour aucun.' : 'Débloquez un badge pour obtenir un titre.'}
                fullWidth
              >
                <MenuItem value="">
                  Aucun titre
                </MenuItem>
                {availableTitles.map((title) => (
                  <MenuItem key={title.id} value={title.label}>
                    <Stack spacing={0.5}>
                      <Typography variant="body1" fontWeight={600}>
                        {title.label}
                      </Typography>
                      {title.description && (
                        <Typography variant="caption" color="text.secondary">
                          {title.description}
                        </Typography>
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<EmojiEventsIcon />}
                  onClick={handleTitleSave}
                  disabled={titleMutation.isLoading}
                >
                  Mettre à jour mon titre
                </Button>
                <Button
                  variant="text"
                  onClick={() => setSelectedTitle('')}
                >
                  Effacer
                </Button>
              </Stack>
              {titleMutation.isLoading && <LinearProgress />}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Personnalisation de l'avatar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Importez une photo et choisissez un cadre pour afficher votre statut.
                </Typography>
              </Box>

              {avatarFeedback.message && <Alert severity={avatarFeedback.severity}>{avatarFeedback.message}</Alert>}

              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={avatarUrl || undefined}
                  alt={user?.username}
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: 24,
                    bgcolor: 'primary.main',
                    borderRadius: '30%',
                    ...currentFrame,
                  }}
                >
                  {avatarInitial}
                </Avatar>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarMutation.isLoading}
                  >
                    Importer une image
                  </Button>
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => removeAvatarMutation.mutate()}
                    disabled={removeAvatarMutation.isLoading}
                  >
                    Réinitialiser
                  </Button>
                </Stack>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" color="text.secondary">
                Cadres disponibles
              </Typography>

              <ToggleButtonGroup
                exclusive
                fullWidth
                value={frameValue}
                onChange={handleFrameChange}
                orientation="vertical"
              >
                {frameOptions.map((option) => (
                  <ToggleButton key={option.value} value={option.value} sx={{ justifyContent: 'flex-start', textAlign: 'left', p: 2 }}>
                    <Stack spacing={0.5} alignItems="flex-start">
                      <Typography variant="body1" fontWeight={600}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                      {option.requiresPremium && (
                        <Chip size="small" color="warning" label="Premium" sx={{ mt: 0.5 }} />
                      )}
                      {option.requiresTitle && (
                        <Chip size="small" icon={<EmojiEventsIcon fontSize="small" />} label="Badge requis" sx={{ mt: 0.5 }} />
                      )}
                    </Stack>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {(avatarMutation.isLoading || removeAvatarMutation.isLoading || frameMutation.isLoading) && (
                <LinearProgress />
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
