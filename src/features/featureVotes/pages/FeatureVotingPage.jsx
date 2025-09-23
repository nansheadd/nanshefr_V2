import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDebounce } from 'use-debounce';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Link as RouterLink } from 'react-router-dom';
import { fetchFeatureVotes, normalizeFeatureVotes, submitFeatureVote } from '../api/featureVotesApi';
import FeatureVoteCard from '../components/FeatureVoteCard';
import { useAuth } from '../../../hooks/useAuth';

const useFilters = (features) => {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 250);

  const statuses = React.useMemo(() => {
    const values = new Set();
    features.forEach((feature) => {
      if (feature.statusLabel) {
        values.add(`${feature.status}|${feature.statusLabel}|${feature.statusColor}`);
      }
    });
    return Array.from(values).map((entry) => {
      const [status, label, color] = entry.split('|');
      return { status, label, color };
    });
  }, [features]);

  const categories = React.useMemo(() => {
    const values = new Set();
    features.forEach((feature) => {
      if (feature.categoryLabel) {
        values.add(feature.categoryLabel);
      }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [features]);

  const filteredFeatures = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return features.filter((feature) => {
      const matchesStatus =
        statusFilter === 'all' || feature.status === statusFilter || feature.statusLabel === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || feature.categoryLabel === categoryFilter || feature.category === categoryFilter;
      const matchesSearch =
        !query ||
        [feature.title, feature.description, feature.categoryLabel, feature.statusLabel]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query));
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [features, statusFilter, categoryFilter, debouncedSearch]);

  const resetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
  };

  return {
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    statuses,
    categories,
    filteredFeatures,
    resetFilters,
  };
};

const FeatureVotingPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    staleTime: 60_000,
  });

  const features = featureResponse?.items ?? [];

  const filters = useFilters(features);

  const voteMutation = useMutation({
    mutationFn: submitFeatureVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-votes'] });
    },
  });

  const handleVote = (feature) => {
    if (!feature?.id) return;
    voteMutation.mutate({
      featureId: feature.id,
      action: feature.userHasVoted ? 'remove' : 'vote',
    });
  };

  const activeFeatureId = voteMutation.variables?.featureId;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Votez pour les prochaines fonctionnalités
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Donnez votre avis et influencez la feuille de route de Nanshe. Chaque vote nous aide à prioriser
            les améliorations qui comptent pour vous.
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              label="Rechercher"
              placeholder="Titre, description, catégorie..."
              value={filters.searchTerm}
              onChange={(event) => filters.setSearchTerm(event.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FilterAltIcon />}
              onClick={filters.resetFilters}
            >
              Réinitialiser
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Actualiser
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle2" color="text.secondary">
              Statut :
            </Typography>
            <Chip
              label="Tous"
              color={filters.statusFilter === 'all' ? 'primary' : 'default'}
              onClick={() => filters.setStatusFilter('all')}
              variant={filters.statusFilter === 'all' ? 'filled' : 'outlined'}
            />
            {filters.statuses.map(({ status, label, color }) => (
              <Chip
                key={status}
                label={label}
                color={filters.statusFilter === status ? color : 'default'}
                onClick={() => filters.setStatusFilter(status)}
                variant={filters.statusFilter === status ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle2" color="text.secondary">
              Catégorie :
            </Typography>
            <Chip
              label="Toutes"
              color={filters.categoryFilter === 'all' ? 'primary' : 'default'}
              onClick={() => filters.setCategoryFilter('all')}
              variant={filters.categoryFilter === 'all' ? 'filled' : 'outlined'}
            />
            {filters.categories.map((category) => (
              <Chip
                key={category}
                label={category}
                color={filters.categoryFilter === category ? 'primary' : 'default'}
                onClick={() => filters.setCategoryFilter(category)}
                variant={filters.categoryFilter === category ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            Impossible de charger les propositions pour le moment.
            {error?.message && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {error.message}
              </Typography>
            )}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filters.filteredFeatures.length === 0 ? (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: (theme) => `1px dashed ${theme.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Aucune proposition ne correspond à votre recherche
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajustez vos filtres ou revenez plus tard pour découvrir de nouvelles idées.
                  </Typography>
                </Box>
              </Grid>
            ) : (
              filters.filteredFeatures.map((feature) => (
                <Grid item xs={12} key={feature.id ?? feature.title}>
                  <FeatureVoteCard
                    feature={feature}
                    onVote={() => handleVote(feature)}
                    votingDisabled={voteMutation.isPending && activeFeatureId === feature.id}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {voteMutation.isError && (
          <Alert severity="error">
            Impossible d'enregistrer votre vote pour le moment. Merci de réessayer plus tard.
          </Alert>
        )}

        {user?.is_superuser && (
          <Box sx={{ textAlign: 'right' }}>
            <Button variant="outlined" component={RouterLink} to="/feature-votes/manage">
              Accéder à la gestion des features
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default FeatureVotingPage;
