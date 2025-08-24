import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
    Box, 
    Container, 
    Typography, 
    Paper, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemText, 
    CircularProgress, 
    Alert, 
    Divider, 
    LinearProgress, 
    ListItemIcon 
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// --- Fonctions d'API ---
const fetchCourseById = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}`);
  return data;
};

const fetchKnowledgeGraph = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}/knowledge-graph`);
  return data;
};

const KnowledgeGraphPage = () => {
  const { courseId } = useParams();

  // Requête pour l'état global du cours (pending, generating, completed)
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    refetchInterval: (query) => 
      query.state.data?.generation_status !== 'completed' ? 5000 : false,
  });

  // Requête pour la structure du graphe (les nœuds et arêtes)
  const { data: graph, isError: isGraphError } = useQuery({
    queryKey: ['knowledgeGraph', courseId],
    queryFn: () => fetchKnowledgeGraph(courseId),
    // On n'active cette requête que si le cours n'est plus en "pending"
    enabled: !!course && course.generation_status !== 'pending',
    // On continue de poller tant qu'il reste des nœuds sans contenu
    refetchInterval: (query) => 
        query.state.data?.nodes?.some(n => !n.content_json) ? 5000 : false,
  });

  // --- Logique de Rendu ---

  // 1. État initial : L'IA est en train de réfléchir au plan du cours
  if (isCourseLoading || !course || course.generation_status === 'pending' || (course.generation_status !== 'completed' && !graph)) {
     return (
        <Container sx={{ textAlign: 'center', my: 5 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
                Construction du plan de votre cours...
            </Typography>
            <Typography color="text.secondary">
                {course?.generation_step || "Analyse du sujet par l'IA..."}
            </Typography>
        </Container>
    );
  }
  
  if (isGraphError) return <Alert severity="error">Impossible de charger le graphe de connaissances.</Alert>;
  if (!graph) return null; // Ne rien afficher si le graphe n'est pas encore prêt

  // 2. État intermédiaire : Le plan est prêt, on génère le contenu des leçons
  const nodesWithContent = graph.nodes.filter(n => n.content_json).length;
  const totalNodes = graph.nodes.length;
  const progress = totalNodes > 0 ? (nodesWithContent / totalNodes) * 100 : 0;
  
  return (
    <Container sx={{ my: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Exploration : {graph.course_title}
        </Typography>

        {progress < 100 && (
            <Box sx={{ my: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                    Rédaction des leçons en cours... ({nodesWithContent}/{totalNodes})
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
            </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" component="h2">Parcours d'Apprentissage</Typography>
        
        <List>
          {graph.nodes.map((node) => (
            <ListItem key={node.id} disablePadding>
              <ListItemButton 
                component={RouterLink} 
                to={`/nodes/${node.id}`}
                disabled={!node.is_unlocked}
              >
                <ListItemIcon>
                  {node.is_completed ? <CheckCircleIcon color="success" />
                   : !node.is_unlocked ? <LockIcon color="disabled" />
                   : <RadioButtonUncheckedIcon />
                  }
                </ListItemIcon>
                <ListItemText 
                  primary={node.title} 
                  secondary={!node.is_unlocked ? "Terminez le concept précédent pour débloquer" : `Type: ${node.node_type}`} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default KnowledgeGraphPage;