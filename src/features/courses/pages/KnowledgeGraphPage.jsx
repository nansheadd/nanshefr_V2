// Fichier : frontend/src/features/courses/pages/KnowledgeGraphPage.jsx (VERSION MODERNE)
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
  ListItemIcon,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Fade,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Styled components inspirés du dashboard
const GradientContainer = styled(Container)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}20`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  }
}));

const NodeListItem = styled(ListItemButton)(({ theme, disabled }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}30`,
  transition: 'all 0.3s ease-in-out',
  backgroundColor: disabled 
    ? `${theme.palette.action.disabled}10`
    : `${theme.palette.background.paper}80`,
  '&:hover': {
    backgroundColor: disabled 
      ? `${theme.palette.action.disabled}20`
      : `${theme.palette.primary.main}08`,
    transform: disabled ? 'none' : 'translateX(8px)',
    borderColor: disabled ? theme.palette.divider : theme.palette.primary.main,
  },
  '&.completed': {
    backgroundColor: `${theme.palette.success.main}10`,
    borderColor: theme.palette.success.main,
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
  border: `1px solid ${theme.palette.primary.main}20`,
  textAlign: 'center',
  padding: theme.spacing(2),
}));

// Fonction pour calculer les statistiques
const calculateStats = (nodes) => {
  if (!nodes || nodes.length === 0) return { total: 0, completed: 0, unlocked: 0 };
  
  const total = nodes.length;
  const completed = nodes.filter(node => node.is_completed).length;
  const unlocked = nodes.filter(node => node.is_unlocked).length;
  
  return { total, completed, unlocked };
};

// Fonction qui appelle la route backend
const fetchKnowledgeGraph = async (courseId) => {
  const { data } = await apiClient.get(`/courses/${courseId}/knowledge-graph`);
  return data;
};

const KnowledgeGraphPage = () => {
  const { courseId } = useParams();

  // useQuery pour gérer l'état de l'appel API
  const { data: graph, isLoading, isError, error } = useQuery({
    queryKey: ['knowledgeGraph', courseId],
    queryFn: () => fetchKnowledgeGraph(courseId),
  });

  // Calcul des statistiques
  const stats = graph ? calculateStats(graph.nodes) : { total: 0, completed: 0, unlocked: 0 };
  const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <GradientContainer maxWidth="xl">
        <Fade in={true}>
          <ModernCard>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
                🧠 Génération de votre parcours d'apprentissage...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Analyse des concepts et création des connexions
              </Typography>
            </CardContent>
          </ModernCard>
        </Fade>
      </GradientContainer>
    );
  }

  if (isError) {
    return (
      <GradientContainer maxWidth="xl">
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2, 
            boxShadow: 2,
            '& .MuiAlert-message': { fontSize: '1.1rem' }
          }}
        >
          ❌ Impossible de charger le graphe de connaissances : {error.message}
        </Alert>
      </GradientContainer>
    );
  }

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <GradientContainer maxWidth="xl">
        <Alert 
          severity="info"
          sx={{ 
            borderRadius: 2, 
            boxShadow: 2,
            '& .MuiAlert-message': { fontSize: '1.1rem' }
          }}
        >
          📚 Aucun concept n'a encore été généré pour ce cours.
        </Alert>
      </GradientContainer>
    );
  }

  // Rendu principal avec les données
  return (
    <GradientContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <Box>
          {/* En-tête avec titre et statistiques */}
          <ModernCard sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                  {graph.course_title}
                </Typography>
              </Box>
              
              <Typography variant="h6" color="text.secondary" gutterBottom>
                🗺️ Parcours d'Apprentissage Interactif
              </Typography>

              {/* Barre de progression */}
              <Box sx={{ mt: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progression du cours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progressPercentage)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                    }
                  }} 
                />
              </Box>

              {/* Statistiques */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <StatsCard>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Concepts Total
                    </Typography>
                  </StatsCard>
                </Grid>
                <Grid item xs={4}>
                  <StatsCard>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                      {stats.completed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Maîtrisés
                    </Typography>
                  </StatsCard>
                </Grid>
                <Grid item xs={4}>
                  <StatsCard>
                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                      {stats.unlocked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Disponibles
                    </Typography>
                  </StatsCard>
                </Grid>
              </Grid>
            </CardContent>
          </ModernCard>

          {/* Liste des concepts */}
          <ModernCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Concepts d'Apprentissage
                </Typography>
              </Box>

              <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
                {graph.nodes.map((node, index) => (
                  <ListItem key={node.id} disablePadding>
                    <NodeListItem
                      component={RouterLink}
                      to={`/nodes/${node.id}`}
                      disabled={!node.is_unlocked}
                      className={node.is_completed ? 'completed' : ''}
                      sx={{ width: '100%' }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {!node.is_unlocked ? (
                          <LockIcon color="disabled" />
                        ) : node.is_completed ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <RadioButtonUncheckedIcon color="action" />
                        )}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                              {node.title}
                            </Typography>
                            <Chip
                              label={node.node_type}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {node.is_completed 
                              ? "✅ Concept maîtrisé" 
                              : node.is_unlocked 
                                ? "🔓 Prêt à apprendre" 
                                : "🔒 Débloquer les prérequis"}
                          </Typography>
                        }
                      />
                    </NodeListItem>
                  </ListItem>
                ))}
              </List>

              {graph.nodes.length === 0 && (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  color: 'text.secondary'
                }}>
                  <Typography variant="h6">
                    📚 Aucun concept disponible
                  </Typography>
                  <Typography variant="body2">
                    Les concepts seront générés automatiquement lors de l'ajout de contenu
                  </Typography>
                </Box>
              )}
            </CardContent>
          </ModernCard>
        </Box>
      </Fade>
    </GradientContainer>
  );
};

export default KnowledgeGraphPage;