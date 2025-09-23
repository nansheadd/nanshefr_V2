import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { createFeatureRequest, fetchFeatureVotes, normalizeFeatureVotes } from '../api/featureVotesApi';
import FeatureVoteCard from '../components/FeatureVoteCard';
import { useAuth } from '../../../hooks/useAuth';

const initialFormState = {
  title: '',
  description: '',
  category: '',
  tags: '',
};

const sanitizePayload = (form) => {
  const payload = {};
  if (form.title.trim()) {
    payload.title = form.title.trim();
  }
  if (form.description.trim()) {
    payload.description = form.description.trim();
  }
  if (form.category.trim()) {
    payload.category = form.category.trim();
  }
  const tagList = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tagList.length > 0) {
    payload.tags = tagList;
  }
  return payload;
};

const FeatureVoteAdminPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState(initialFormState);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [formError, setFormError] = React.useState('');

  const {
    data: featureResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['feature-votes'],
    queryFn: async () => {
      const data = await fetchFeatureVotes();
      return normalizeFeatureVotes(data);
    },
  });

  const features = featureResponse?.items ?? [];

  const createMutation = useMutation({
    mutationFn: createFeatureRequest,
    onSuccess: () => {
      setForm(initialFormState);
      setSuccessMessage('La fonctionnalité a été ajoutée avec succès.');
      setFormError('');
      queryClient.invalidateQueries({ queryKey: ['feature-votes'] });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = sanitizePayload(form);
    if (!payload.title || !payload.description) {
      setSuccessMessage('');
      setFormError('Merci de renseigner un titre et une description.');
      return;
    }
    setSuccessMessage('');
    setFormError('');
    createMutation.mutate(payload);
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) {
      setFormError('');
    }
  };

  const canSubmit = Boolean(form.title.trim() && form.description.trim());

  if (authLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user?.is_superuser) {
    return <Navigate to="/feature-votes" replace />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
              Gestion des fonctionnalités proposées
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Créez de nouvelles idées pour la communauté et suivez l'engagement des utilisateurs en temps réel.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            component={RouterLink}
            to="/feature-votes"
          >
            Retour aux votes
          </Button>
        </Stack>

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, borderRadius: 3 }} elevation={0}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nouvelle fonctionnalité
            </Typography>
            <TextField
              label="Titre"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="Titre clair et précis"
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Expliquez l'idée et la valeur apportée"
              required
              fullWidth
              multiline
              minRows={4}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Catégorie"
                value={form.category}
                onChange={handleChange('category')}
                placeholder="Ex: Tableau de bord, Capsules, Premium..."
                fullWidth
              />
              <TextField
                label="Tags"
                value={form.tags}
                onChange={handleChange('tags')}
                placeholder="Séparez les tags par une virgule"
                helperText="Optionnel"
                fullWidth
              />
            </Stack>
            {createMutation.isError && (
              <Alert severity="error">
                Impossible d'ajouter la fonctionnalité pour le moment.
              </Alert>
            )}
            {formError && (
              <Alert severity="warning" onClose={() => setFormError('')}>
                {formError}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={() => setForm(initialFormState)}
                disabled={createMutation.isPending}
                type="button"
              >
                Réinitialiser
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleIcon />}
                type="submit"
                disabled={!canSubmit || createMutation.isPending}
              >
                Ajouter la fonctionnalité
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Divider flexItem />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Idées actuelles
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Actualiser
          </Button>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            Impossible de charger les fonctionnalités pour le moment.
            {error?.message && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {error.message}
              </Typography>
            )}
          </Alert>
        ) : features.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 3 }} variant="outlined">
            <Typography variant="body1" gutterBottom>
              Aucune fonctionnalité enregistrée pour le moment.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez votre première idée grâce au formulaire ci-dessus.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} key={feature.id ?? feature.title}>
                <FeatureVoteCard feature={feature} showVoteButton={false} />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label={`Votes : ${feature.votes}`} />
                  <Chip label={`Statut : ${feature.statusLabel}`} />
                </Stack>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
};

export default FeatureVoteAdminPage;
