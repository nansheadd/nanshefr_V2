import React from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
    Box, 
    Container, 
    Typography, 
    Paper, 
    CircularProgress, 
    Alert, 
    Divider, 
    Button 
} from '@mui/material';
import LessonComponent from '../../learning/components/LessonComponent';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// --- Fonctions d'API ---
const fetchNodeById = async (nodeId) => {
  const { data } = await apiClient.get(`/nodes/${nodeId}`);
  return data;
};

const fetchKnowledgeGraph = async (courseId) => {
    if (!courseId) return null;
    const { data } = await apiClient.get(`/courses/${courseId}/knowledge-graph`);
    return data;
};

const completeNode = (nodeId) => {
    return apiClient.post(`/progress/nodes/${nodeId}/complete`);
};

const NodeViewPage = () => {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Requête pour le contenu du nœud actuel
  const { data: node, isLoading, isError } = useQuery({
    queryKey: ['knowledgeNode', nodeId],
    queryFn: () => fetchNodeById(nodeId),
  });
  
  // Requête pour le graphe complet, afin de trouver le nœud suivant
  const { data: graph } = useQuery({
    queryKey: ['knowledgeGraph', node?.course_id],
    queryFn: () => fetchKnowledgeGraph(node?.course_id),
    enabled: !!node?.course_id,
  });

  // Mutation pour marquer le nœud comme terminé
  const completeNodeMutation = useMutation({
      mutationFn: () => completeNode(nodeId),
      onSuccess: () => {
          // Invalider les données du graphe pour qu'elles se rechargent avec la nouvelle progression
          queryClient.invalidateQueries({ queryKey: ['knowledgeGraph', node?.course_id] });

          const nextNode = findNextNode();
          if (nextNode) {
              navigate(`/nodes/${nextNode.id}`);
          } else {
              navigate(`/courses/${node?.course_id}/graph`);
          }
      }
  });

  const findNextNode = () => {
      if (!graph || !node) return null;
      // Les nœuds sont déjà triés par ID par le backend
      const currentIndex = graph.nodes.findIndex(n => n.id === node.id);
      if (currentIndex !== -1 && currentIndex < graph.nodes.length - 1) {
          return graph.nodes[currentIndex + 1];
      }
      return null;
  };
  
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (isError) return <Alert severity="error">Impossible de charger le contenu de ce nœud.</Alert>;
  
  const nextNode = findNextNode();

  return (
    <Container sx={{ my: 4 }}>
      <Button component={RouterLink} to={`/courses/${node?.course_id}/graph`}>&larr; Retour au parcours d'apprentissage</Button>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>{node?.title}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">Type : {node?.node_type}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>{node?.description}</Typography>
        
        {node?.content_json?.lesson_text ? (
          <LessonComponent content={node.content_json} />
        ) : (
          <Alert severity="info">Le contenu de cette leçon est en cours de rédaction.</Alert>
        )}
      </Paper>

      {node?.exercises && node.exercises.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>Exercices d'Application</Typography>
          <Divider sx={{ mb: 3 }} />
          {node.exercises.map((exercise) => (
            <KnowledgeComponentViewer
              key={exercise.id}
              component={exercise}
            />
          ))}
        </Box>
      )}

      <Box sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<NavigateNextIcon />}
            onClick={() => completeNodeMutation.mutate()}
            disabled={completeNodeMutation.isPending}
          >
            {nextNode ? 'Leçon Suivante' : 'Terminer le Cours'}
          </Button>
      </Box>
    </Container>
  );
};

export default NodeViewPage;