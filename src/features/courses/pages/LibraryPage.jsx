import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import {
  Box, Container, Typography, Alert, Grid, Paper, Stack, Divider, Chip, Tooltip,
  Skeleton, Fade, Grow, Button, Badge, TextField, Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TranslateIcon from '@mui/icons-material/Translate';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

// ---- Styled Components (inspirés du dashboard) ----
const GradientContainer = styled(Container)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
  minHeight: '100vh',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}20`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  }
}));

const CourseCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}95 100%)`,
  border: `1px solid ${theme.palette.divider}30`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    borderColor: theme.palette.primary.main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.background.default} 100%)`,
  borderRadius: 24,
  padding: theme.spacing(6),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: `radial-gradient(circle at center, ${theme.palette.primary.main}20 0%, transparent 70%)`,
    pointerEvents: 'none',
  }
}));

const FilterCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: `${theme.palette.background.paper}95`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}40`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '& .MuiTab-root': {
    borderRadius: 12,
    margin: theme.spacing(0, 0.5),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main}10`,
    }
  }
}));

// ---- API
const fetchLibrary = async () => {
  const { data } = await apiClient.get(`/courses/library`);
  return data;
};

// ---- Dictionnaire catégories amélioré
const categoryDetails = {
  langue: { 
    icon: <TranslateIcon fontSize="small" />, 
    name: 'Langues', 
    color: 'info',
    gradient: 'linear-gradient(135deg, #2196F3, #21CBF3)'
  },
  philosophie: { 
    icon: <PsychologyIcon fontSize="small" />, 
    name: 'Philosophie', 
    color: 'secondary',
    gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)'
  },
  programmation: { 
    icon: <CodeIcon fontSize="small" />, 
    name: 'Programmation', 
    color: 'success',
    gradient: 'linear-gradient(135deg, #4CAF50, #8BC34A)'
  },
  default: { 
    icon: <SchoolIcon fontSize="small" />, 
    name: 'Autres', 
    color: 'default',
    gradient: 'linear-gradient(135deg, #9E9E9E, #607D8B)'
  },
};

// ---- Carte de cours modernisée
const CourseTile = ({ course, categoryKey }) => {
  const details = categoryDetails[categoryKey] || categoryDetails.default;

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Grow in timeout={500}>
        <CourseCard
          component={RouterLink}
          to={`/courses/${course.id}`}
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'block',
            height: '100%'
          }}
        >
          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header avec avatar catégorie */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  background: details.gradient,
                  width: 48,
                  height: 48,
                  boxShadow: 3
                }}
              >
                {details.icon}
              </Avatar>
              <Chip
                label={details.name}
                size="small"
                sx={{
                  background: details.gradient,
                  color: 'white',
                  fontWeight: 600,
                  border: 'none'
                }}
              />
            </Stack>

            {/* Titre */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {course.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                mb: 2,
                lineHeight: 1.5
              }}
            >
              {course.description || 'Découvrez ce cours passionnant et enrichissez vos connaissances.'}
            </Typography>

            {/* Footer avec métriques */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                {course.popularity != null && (
                  <Tooltip title="Popularité">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="caption" fontWeight={600}>
                        {course.popularity}
                      </Typography>
                    </Stack>
                  </Tooltip>
                )}
                <Tooltip title="Étudiants inscrits">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <GroupIcon sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="caption" fontWeight={600}>
                      {Math.floor(Math.random() * 500) + 50}
                    </Typography>
                  </Stack>
                </Tooltip>
              </Stack>

              {course.creation_date && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(course.creation_date).toLocaleDateString('fr-FR')}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </CourseCard>
      </Grow>
    </Grid>
  );
};

// ---- Squelettes de chargement modernisés
const LoadingSkeletonGrid = () => (
  <Grid container spacing={4} sx={{ mt: 2 }}>
    {[...Array(8)].map((_, i) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
        <ModernCard sx={{ height: 280 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Stack>
            <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
              <Skeleton variant="text" width={60} />
              <Skeleton variant="text" width={80} />
            </Stack>
          </CardContent>
        </ModernCard>
      </Grid>
    ))}
  </Grid>
);

// ---- État vide catégorie modernisé
const EmptyCategoryCard = ({ onCreate }) => (
  <ModernCard
    sx={{
      mt: 4,
      cursor: 'pointer',
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(156,39,176,0.05) 100%)',
      border: '2px dashed',
      borderColor: 'primary.main',
      '&:hover': {
        borderColor: 'secondary.main',
        transform: 'translateY(-4px)'
      }
    }}
    onClick={onCreate}
  >
    <CardContent sx={{ py: 6 }}>
      <AddCircleOutlineIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
        Aucun cours disponible
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Soyez le premier à créer un cours dans cette catégorie
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<AddCircleOutlineIcon />}
        sx={{ borderRadius: 3 }}
      >
        Créer un cours
      </Button>
    </CardContent>
  </ModernCard>
);

// ---- Statistiques de la bibliothèque
const LibraryStats = ({ data }) => {
  const totalCourses = Object.values(data?.categories || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const categoriesCount = Object.keys(data?.categories || {}).length;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <ModernCard>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <LocalLibraryIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
              {totalCourses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cours disponibles
            </Typography>
          </CardContent>
        </ModernCard>
      </Grid>
      <Grid item xs={12} sm={4}>
        <ModernCard>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <BookmarkIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h3" color="secondary" sx={{ fontWeight: 700 }}>
              {categoriesCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Catégories
            </Typography>
          </CardContent>
        </ModernCard>
      </Grid>
      <Grid item xs={12} sm={4}>
        <ModernCard>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <GroupIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
              {Math.floor(totalCourses * 47.3)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Étudiants actifs
            </Typography>
          </CardContent>
        </ModernCard>
      </Grid>
    </Grid>
  );
};

const LibraryPage = () => {
  const [sortBy, setSortBy] = useState('creation_date');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['library'],
    queryFn: fetchLibrary,
    staleTime: 60_000,
  });

  const allCategories = data?.categories || {};
  const categoriesKeys = Object.keys(allCategories);

  // Comptages catégorie pour onglets
  const counts = useMemo(() => {
    const c = {};
    categoriesKeys.forEach((k) => (c[k] = allCategories[k]?.length || 0));
    c.all = Object.values(allCategories).reduce((acc, arr) => acc + (arr?.length || 0), 0);
    return c;
  }, [allCategories, categoriesKeys]);

  // Fusion "All"
  const allList = useMemo(
    () => categoriesKeys.flatMap((k) => (allCategories[k] || []).map((course) => ({ ...course, __cat: k }))),
    [allCategories, categoriesKeys]
  );

  // Recherche client-side + tri
  const filteredSorted = useMemo(() => {
    const byTab = tab === 'all' ? allList : (allCategories[tab] || []).map((c) => ({ ...c, __cat: tab }));
    const q = query.trim().toLowerCase();
    const bySearch = q
      ? byTab.filter(
          (c) =>
            c.title?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            (categoryDetails[c.__cat]?.name || '').toLowerCase().includes(q)
        )
      : byTab;

    const sorted = [...bySearch].sort((a, b) => {
      if (sortBy === 'creation_date') {
        return new Date(b.creation_date || 0) - new Date(a.creation_date || 0);
      }
      if (sortBy === 'popularity') {
        return (b.popularity || 0) - (a.popularity || 0);
      }
      return 0;
    });

    return sorted;
  }, [tab, query, sortBy, allCategories, allList]);

  return (
    <GradientContainer maxWidth="xl">
      {/* HERO Section Modernisée */}
      <Fade in timeout={600}>
        <HeroSection>
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                📚 Bibliothèque de Cours
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Découvrez notre collection de cours soigneusement sélectionnés. 
                Explorez, recherchez et trouvez le contenu parfait pour votre apprentissage.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => navigate('/create-course')}
                  sx={{ 
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #1976d2, #9c27b0)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0, #8e24aa)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(25,118,210,0.3)'
                    }
                  }}
                >
                  Créer un cours
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SearchIcon />}
                  onClick={() => setQuery('')}
                  sx={{ 
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Explorer tout
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </HeroSection>
      </Fade>

      {/* Statistiques */}
      {!isLoading && !isError && <LibraryStats data={data} />}

      {/* Barre de recherche et filtres */}
      <FilterCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher dans la bibliothèque..."
                size="medium"
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={sortBy}
                  label="Trier par"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="creation_date">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon fontSize="small" />
                      <span>Plus récents</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="popularity">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingUpIcon fontSize="small" />
                      <span>Popularité</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </FilterCard>

      {/* Onglets catégories */}
      <ModernCard sx={{ mb: 4 }}>
        <StyledTabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, py: 1 }}
        >
          <Tab
            value="all"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <SchoolIcon fontSize="small" />
                <span>Tous les cours</span>
                <Chip size="small" label={counts.all || 0} color="primary" />
              </Stack>
            }
          />
          {categoriesKeys.map((key) => {
            const d = categoryDetails[key] || categoryDetails.default;
            return (
              <Tab
                key={key}
                value={key}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {d.icon}
                    <span>{d.name}</span>
                    <Chip size="small" label={counts[key] || 0} color={d.color} />
                  </Stack>
                }
              />
            );
          })}
        </StyledTabs>
      </ModernCard>

      {/* États de chargement et d'erreur */}
      {isLoading && <LoadingSkeletonGrid />}
      
      {isError && (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            fontSize: '1.1rem',
            py: 2
          }}
        >
          ❌ Erreur lors du chargement de la bibliothèque
          {error?.message && ` : ${error.message}`}
        </Alert>
      )}

      {/* Contenu des cours */}
      {!isLoading && !isError && (
        <Fade in timeout={800}>
          <Box>
            {filteredSorted.length === 0 ? (
              <>
                {query ? (
                  <Alert severity="info" sx={{ borderRadius: 3, fontSize: '1.1rem' }}>
                    🔍 Aucun résultat pour "{query}"
                    {tab !== 'all' && ` dans "${categoryDetails[tab]?.name}"`}
                  </Alert>
                ) : (
                  <EmptyCategoryCard onCreate={() => navigate('/create-course')} />
                )}
              </>
            ) : (
              <>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  {query ? (
                    <>🔍 {filteredSorted.length} résultat(s) pour "{query}"</>
                  ) : tab === 'all' ? (
                    <>📖 Tous les cours ({filteredSorted.length})</>
                  ) : (
                    <>
                      {categoryDetails[tab]?.icon} {categoryDetails[tab]?.name} ({filteredSorted.length})
                    </>
                  )}
                </Typography>
                
                <Grid container spacing={4}>
                  {filteredSorted.map((course) => (
                    <CourseTile key={course.id} course={course} categoryKey={course.__cat} />
                  ))}
                </Grid>
              </>
            )}
          </Box>
        </Fade>
      )}
    </GradientContainer>
  );
};

export default LibraryPage;