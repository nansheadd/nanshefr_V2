// Fichier : frontend/src/features/courses/pages/CoursePlanPage.jsx (ADAPTÉ À VOTRE PROJET)

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Container, Typography, Alert, Paper, ListItem,
    ListItemButton, ListItemText, ListItemIcon,
    Accordion, AccordionSummary, AccordionDetails, Grid, Card, CardContent,
    Chip, Stack, IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// Icônes
import StairsIcon from '@mui/icons-material/Stairs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LanguageIcon from '@mui/icons-material/Language';

// Composants
import CourseStats from '../components/CourseStats';
import VocabularyTrainer from '../components/VocabularyTrainer';

// Styled Components (UI moderne)
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.primary.main, 0.1)} 0%, 
    ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  borderRadius: 24,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
  }
}));

const CharacterCard = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: '16px !important',
  marginBottom: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  '&:before': {
    display: 'none',
  },
}));

const LevelCard = styled(ModernCard)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiListItemButton-root': {
    borderRadius: 16,
    padding: theme.spacing(2, 3),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
    }
  }
}));

// Composant pour afficher les alphabets
const CharacterSetViewer = ({ characterSet }) => (
  <StyledAccordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <LanguageIcon color="primary" />
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          {characterSet.name}
        </Typography>
        <Chip 
          label={`${characterSet.characters.length} caractères`} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>
      <Grid container spacing={2}>
        {characterSet.characters.map(char => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={char.id}>
            <CharacterCard elevation={0}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                {char.symbol}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {char.pronunciation}
              </Typography>
            </CharacterCard>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </StyledAccordion>
);

// Composant principal de la page
const CoursePlanPage = ({ course }) => {

  if (!course) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Aucune donnée de cours disponible.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Section Héro */}
      <HeroSection>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ 
              fontWeight: 800, 
              mb: 1,
              background: 'linear-gradient(135deg, #1976d2, #9c27b0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {course.title}
            </Typography>
            <Chip 
              label={course.course_type || 'Cours'} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Stack>
        <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.6, maxWidth: '80%', fontWeight: 400 }}>
          {course.description}
        </Typography>
      </HeroSection>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          {/* Section Alphabets */}
          {course.character_sets && course.character_sets.length > 0 && (
            <ModernCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                    Alphabets à Maîtriser
                  </Typography>
                </Stack>
                <Box>
                  {course.character_sets.map(set => (
                    <CharacterSetViewer key={set.id} characterSet={set} />
                  ))}
                </Box>
              </CardContent>
            </ModernCard>
          )}

          {/* Section Entraînement Vocabulaire */}
          {course.course_type === 'langue' && (
            <ModernCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <VocabularyTrainer courseId={course.id} />
              </CardContent>
            </ModernCard>
          )}

          {/* Section Niveaux du Cours */}
          <ModernCard>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <StairsIcon color="primary" />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                  Parcours d'Apprentissage
                </Typography>
              </Stack>

              <Stack spacing={2}>
                {course.levels?.sort((a, b) => a.level_order - b.level_order).map((level, index) => (
                  <LevelCard key={level.id} elevation={0}>
                    <ListItem disablePadding>
                      <ListItemButton component={RouterLink} to={`/levels/${level.id}`}>
                        <ListItemIcon>
                          <Box sx={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 40, height: 40, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${alpha('#1976d2', 0.1)}, ${alpha('#9c27b0', 0.1)})`,
                            border: `2px solid ${alpha('#1976d2', 0.2)}`,
                            color: 'primary.main', fontWeight: 700
                          }}>
                            {index + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{level.title}</Typography>}
                          secondary={<Typography color="text.secondary" sx={{ mt: 0.5 }}>Niveau {level.level_order + 1} • Cliquez pour commencer</Typography>}
                        />
                        <IconButton color="primary"><PlayArrowIcon /></IconButton>
                      </ListItemButton>
                    </ListItem>
                  </LevelCard>
                ))}
              </Stack>
            </CardContent>
          </ModernCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          {/* Section Statistiques */}
          <ModernCard>
            <CardContent sx={{ p: 3 }}>
              <CourseStats courseId={course.id} />
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CoursePlanPage;