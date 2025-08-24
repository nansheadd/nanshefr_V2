// Fichier : frontend/src/features/courses/pages/CoursePlanPage.jsx (VERSION FINALE)

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import {
    Box, Container, Typography, CircularProgress, Alert, List, ListItem,
    ListItemButton, ListItemText, Divider, Paper, ListItemIcon,
    Accordion, AccordionSummary, AccordionDetails, Grid
} from '@mui/material';
import StairsIcon from '@mui/icons-material/Stairs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CourseStats from '../components/CourseStats';
import VocabularyTrainer from '../components/VocabularyTrainer';
import KnowledgeGraphPage from './KnowledgeGraphPage'; // <-- On importe la vue du graphe

const fetchCourseById = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}`);
  return data;
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
  const navigate = useNavigate();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!isAuthenticated,
    // Polling pour rafraîchir le statut pendant la génération
    refetchInterval: (query) => {
        const data = query.state.data;
        return ['generating', 'pending'].includes(data?.generation_status) ? 3000 : false;
    },
  });
  useEffect(() => {
    if (course && course.course_type === 'philosophie') {
      navigate(`/courses/${courseId}/graph`, { replace: true });
    }
  }, [course, courseId, navigate]);

  if (course?.course_type === 'philosophie') {
    // On passe l'objet course en prop
    return <KnowledgeGraphPage course={course} />;
  }
  
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (isError) {
    return <Alert severity="error">Impossible de charger le plan du cours.</Alert>;
  }

  // --- AIGUILLEUR DE VUE ---
  // Si le cours est de type philosophie, on affiche directement le composant du graphe.
  if (course?.course_type === 'philosophie') {
    return <KnowledgeGraphPage course={course} />;
  }
  
  // --- AFFICHAGE POUR LES COURS LINÉAIRES (Langues, etc.) ---
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