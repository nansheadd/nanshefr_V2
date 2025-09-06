import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import {
  Box, Typography, CircularProgress, Alert, Button, Paper,
  Container, Grid, Card, CardContent, Chip, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Divider,
  Breadcrumbs, Link, Avatar, Stack, Collapse, Tooltip,
  LinearProgress, Badge, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Domain Icons (réutilisation)
import LanguageIcon from '@mui/icons-material/Language';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessIcon from '@mui/icons-material/Business';
import ComputerIcon from '@mui/icons-material/Computer';
import BrushIcon from '@mui/icons-material/Brush';

// Domain configuration
const domainConfig = {
  'languages': { icon: LanguageIcon, color: '#4CAF50', label: 'Langues' },
  'social_sciences': { icon: AccountBalanceIcon, color: '#2196F3', label: 'Sciences sociales' },
  'natural_sciences': { icon: ScienceIcon, color: '#FF5722', label: 'Sciences naturelles' },
  'mathematics': { icon: CalculateIcon, color: '#9C27B0', label: 'Mathématiques' },
  'economics': { icon: BusinessIcon, color: '#FFC107', label: 'Économie' },
  'personal_development': { icon: PsychologyIcon, color: '#E91E63', label: 'Développement personnel' },
  'programming': { icon: ComputerIcon, color: '#607D8B', label: 'Programmation' },
  'arts': { icon: BrushIcon, color: '#FF9800', label: 'Arts' },
  'others': { icon: SchoolIcon, color: '#9E9E9E', label: 'Autres' }
};

// Styled Components
const HeroSection = styled(Box)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3)
}));

const LevelCard = styled(Card)(({ theme, $active }) => ({
  borderRadius: 12,
  transition: 'all 0.3s',
  cursor: 'pointer',
  border: $active ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const ChapterItem = styled(ListItem)(({ theme, completed }) => ({
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  background: completed ? alpha(theme.palette.success.main, 0.05) : 'transparent',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05)
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  textAlign: 'center',
  background: alpha(theme.palette.primary.main, 0.03)
}));

const CapsuleDetail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const { domain, area, capsuleId } = useParams();

  // Fetch capsule details
  const { data: capsule, isLoading, isError } = useQuery({
    queryKey: ['capsule', domain, area, capsuleId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/capsules/${domain}/${area}/${capsuleId}`);
      return data;
    }
  });

  // Check enrollment status
  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/capsules/me');
      return data;
    }
  });

  const isEnrolled = enrollments?.some(c => c.id === parseInt(capsuleId));
  const isCreator = capsule?.created_by === user?.id;

  // Enroll/Unenroll mutations
  const enrollMutation = useMutation({
    mutationFn: () => apiClient.post(`/capsules/${capsuleId}/enroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    }
  });

  const unenrollMutation = useMutation({
    mutationFn: () => apiClient.post(`/capsules/${capsuleId}/unenroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    }
  });

  const toggleLevel = (levelIndex) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelIndex)) {
      newExpanded.delete(levelIndex);
    } else {
      newExpanded.add(levelIndex);
    }
    setExpandedLevels(newExpanded);
  };

 const prepareSessionMutation = useMutation({
    mutationFn: (levelOrder) => 
      apiClient.post(`/capsules/${capsuleId}/level/${levelOrder}/session`),
    onSuccess: (response, levelOrder) => {
      // Une fois que le backend a tout préparé, on navigue vers la page de la session
      console.log("Session prête:", response.data);
      // On peut passer les données via sessionStorage ou refaire un fetch sur la page de session
      sessionStorage.setItem('currentSessionData', JSON.stringify(response.data));
      navigate(`/capsule/${capsuleId}/level/${levelOrder}/session`);
    },
    onError: (error) => {
      console.error("Erreur lors de la préparation de la session", error);
      // Afficher une alerte à l'utilisateur
    }
  });

  const handleStartChapter = (levelOrder, chapterIndex) => {
    // La navigation est maintenant directe vers la page qui va charger le contenu
    navigate(`/capsule/${capsuleId}/granule/${levelOrder}/molecule/${chapterIndex}`);
};
  
  const startLearning = (levelOrder) => {
    console.log(`Clic sur "Commencer" le niveau ${levelOrder}`);
    prepareSessionMutation.mutate(levelOrder);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (isError || !capsule) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Impossible de charger les détails de la capsule.
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Container>
    );
  }

  const config = domainConfig[capsule.domain] || domainConfig.others;
  const Icon = config.icon;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          component="button"
          variant="body2"
          onClick={() => navigate('/capsules')}
          underline="hover"
        >
          Capsules
        </Link>
        <Typography color="text.primary">{capsule.title}</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <HeroSection color={config.color}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: config.color, width: 56, height: 56 }}>
                <Icon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {capsule.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip 
                    label={config.label} 
                    size="small"
                    sx={{ 
                      bgcolor: alpha(config.color, 0.1),
                      color: config.color,
                      fontWeight: 600
                    }}
                  />
                  {capsule.area && (
                    <Chip label={capsule.area} size="small" variant="outlined" />
                  )}
                  {capsule.main_skill && (
                    <Chip label={capsule.main_skill} size="small" variant="outlined" />
                  )}
                  <Chip 
                    icon={capsule.is_public ? <PublicIcon /> : <LockIcon />}
                    label={capsule.is_public ? 'Public' : 'Privé'} 
                    size="small"
                  />
                </Stack>
              </Box>
            </Box>
            
            {capsule.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {capsule.description}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Action button */}
              {!isCreator && (
                isEnrolled ? (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="large"
                    startIcon={<PersonRemoveIcon />}
                    onClick={() => unenrollMutation.mutate()}
                    disabled={unenrollMutation.isPending}
                  >
                    Se désinscrire
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PersonAddIcon />}
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    sx={{
                      background: `linear-gradient(45deg, ${config.color} 30%, ${alpha(config.color, 0.7)} 90%)`
                    }}
                  >
                    S'inscrire à cette capsule
                  </Button>
                )
              )}
              
              {isCreator && (
                <Chip 
                  icon={<AutoAwesomeIcon />}
                  label="Vous êtes le créateur"
                  color="primary"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </HeroSection>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatsCard>
            <SchoolIcon color="primary" />
            <Typography variant="h6">
              {capsule.learning_plan_json?.levels?.length || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Niveaux
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard>
            <TimerIcon color="primary" />
            <Typography variant="h6">
              {capsule.learning_plan_json?.levels?.reduce(
                (acc, level) => acc + (level.chapters?.length || 0), 0
              ) || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chapitres
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6">
              {capsule.difficulty || 'Tous niveaux'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Difficulté
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={6} md={3}>
          <StatsCard>
            <CheckCircleIcon color="primary" />
            <Typography variant="h6">
              0%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Progression
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Learning Plan */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="600">
          📚 Plan d'apprentissage
        </Typography>
        
        {capsule.learning_plan_json?.levels ? (
          <Box sx={{ mt: 3 }}>
            {capsule.learning_plan_json.levels.map((level, levelIndex) => (
              <LevelCard 
                key={levelIndex} 
                sx={{ mb: 2 }}
                $active={expandedLevels.has(levelIndex)}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleLevel(levelIndex)}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">
                        {level.level_title || `Niveau ${levelIndex + 1}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {level.chapters?.length || 0} chapitres
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isEnrolled && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            startLearning(level.level_order || levelIndex + 1);
                          }}
                        >
                          Commencer
                        </Button>
                      )}
                      <IconButton>
                        {expandedLevels.has(levelIndex) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={expandedLevels.has(levelIndex)}>
                    <Divider sx={{ my: 2 }} />
                    <List>
                      {level.chapters?.map((chapter, chapterIndex) => (
                        <ChapterItem 
                          key={chapterIndex}
                          completed={false}
                          onClick={() => handleStartChapter(level.level_order || levelIndex + 1, chapterIndex + 1)}
                        >
                            {prepareSessionMutation.isLoading && <CircularProgress size={16} />}

                          <ListItemIcon>
                            <RadioButtonUncheckedIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={chapter.chapter_title}
                            secondary={`Chapitre ${chapterIndex + 1}`}
                          />
                        </ChapterItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>
              </LevelCard>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            Le plan d'apprentissage est en cours de génération...
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default CapsuleDetail;