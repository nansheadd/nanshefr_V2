// Fichier : nanshe/frontend/src/features/courses/pages/CoursePlanPage.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import {
    Box, Container, Typography, CircularProgress, Alert, List, ListItem,
    ListItemButton, ListItemText, Divider, Paper, ListItemIcon,
    Accordion, AccordionSummary, AccordionDetails, Grid, LinearProgress
} from '@mui/material';
import StairsIcon from '@mui/icons-material/Stairs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CourseStats from '../components/CourseStats';
import VocabularyTrainer from '../components/VocabularyTrainer';

const fetchCourseById = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}`);
  return data;
};

// Les jalons de progression connus du backend pour un cours de langue.
const PROGRESS_STEPS = [0, 5, 10, 30, 60, 80, 95, 100];

// Hook personnalisé contenant la logique d'animation
const useAnimatedProgress = (serverProgress, isGenerating) => {
    const [displayedProgress, setDisplayedProgress] = useState(0);
    const animationInterval = useRef(null);

    useEffect(() => {
        // Si la génération est terminée, on force 100% et on arrête tout.
        if (!isGenerating) {
            if (animationInterval.current) clearInterval(animationInterval.current);
            // S'assure que la barre va bien à 100 quand c'est fini.
            if (serverProgress > 0) setDisplayedProgress(100);
            return;
        }

        // On arrête l'ancienne animation avant d'en lancer une nouvelle.
        if (animationInterval.current) clearInterval(animationInterval.current);

        // On lance la nouvelle animation.
        animationInterval.current = setInterval(() => {
            setDisplayedProgress(prev => {
                // Si la progression affichée est en retard sur le serveur, on la rattrape vite.
                if (prev < serverProgress) {
                    return Math.min(prev + 2, serverProgress); // Rattrapage rapide
                }

                // Logique d'anticipation
                const nextStepIndex = PROGRESS_STEPS.findIndex(step => step > prev);
                const nextStepTarget = nextStepIndex !== -1 ? PROGRESS_STEPS[nextStepIndex] : 100;
                const animationTarget = nextStepTarget - 1;

                // Si on a atteint la cible d'animation, on attend.
                if (prev >= animationTarget) {
                    return prev;
                }

                // Sinon, on continue d'avancer lentement.
                return prev + 1;
            });
        }, 700); // Vitesse de l'animation artificielle (plus lente pour être visible)

        // Nettoyage de l'intervalle
        return () => clearInterval(animationInterval.current);

    }, [serverProgress, isGenerating]);

    return displayedProgress;
};


const CharacterSetViewer = ({ characterSet }) => (
    <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'bold' }}>{characterSet.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <Grid container spacing={1}>
                {characterSet.characters.map(char => (
                    <Grid item xs={2} sm={1} key={char.id}>
                        <Paper variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6">{char.symbol}</Typography>
                            <Typography variant="caption">{char.pronunciation}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </AccordionDetails>
    </Accordion>
);


const CoursePlanPage = () => {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!isAuthenticated,
  });

  const isGenerating = course?.generation_status === 'generating' || course?.generation_status === 'pending';
  const serverProgress = course?.generation_progress || 0;
  const animatedProgress = useAnimatedProgress(serverProgress, isGenerating);

  // Le polling pour rafraîchir les données du serveur
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGenerating, queryClient, courseId]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Alert severity="error">Impossible de charger le plan du cours.</Alert>;
  }

  // --- AFFICHAGE PENDANT LA GÉNÉRATION ---
  if (course?.generation_status !== 'completed') {
    return (
      <Container>
        <Paper sx={{ my: 4, p: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>{course?.title}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box my={4}>
            <Typography variant="h6" sx={{ mt: 2 }}>Génération de votre cours personnalisé...</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={animatedProgress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(animatedProgress)}%`}</Typography>
                </Box>
            </Box>
            <Typography color="text.secondary">
                Étape : {course.generation_step || 'Initialisation...'}
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  // --- AFFICHAGE NORMAL DU COURS TERMINÉ ---
  return (
    <Container>
      <Paper sx={{ my: 4, p: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>{course?.title}</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>{course?.description}</Typography>
        <Divider sx={{ my: 2 }} />
        {course?.character_sets && course.character_sets.length > 0 && (
            <>
                <Typography variant="h5" component="h2" gutterBottom>Alphabets à Maîtriser</Typography>
                <Box sx={{ mb: 3 }}>
                    {course.character_sets.map(set => (
                        <CharacterSetViewer key={set.id} characterSet={set} />
                    ))}
                </Box>
                <Divider sx={{ my: 2 }} />
            </>
        )}
        {course?.course_type === 'langue' && <VocabularyTrainer courseId={courseId} />}
        <CourseStats courseId={courseId} />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" component="h2" gutterBottom>Niveaux du Cours</Typography>
        <List>
          {course?.levels?.sort((a, b) => a.level_order - b.level_order).map((level) => (
            <ListItem key={level.id} disablePadding>
              <ListItemButton component={RouterLink} to={`/levels/${level.id}`}>
                <ListItemIcon><StairsIcon /></ListItemIcon>
                <ListItemText
                  primary={`Niveau ${level.level_order + 1}: ${level.title}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default CoursePlanPage;