import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper,
  Container,
  Chip,
  Stack,
  LinearProgress,
  Fade,
  Card,
  CardContent,
  Divider,
  Button,
  Fab
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import apiClient from '../../../api/axiosConfig';
import CodeIdeComponent from '../components/CodeIdeComponent';
import KnowledgeComponentViewer from '../../learning/components/KnowledgeComponentViewer'
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const GradientContainer = styled(Container)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}08 100%)`,
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  position: 'relative',
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeInUp} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
  }
}));

const HeaderCard = styled(ModernCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}10)`,
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '20px 20px 0 0',
  }
}));

const LoadingCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(4),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const GeneratingAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(135deg, ${theme.palette.info.main}10, ${theme.palette.info.main}05)`,
  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.info.main, 0.4)}, transparent)`,
    animation: `${shimmer} 2s infinite`,
  }
}));

const MarkdownContainer = styled(Box)(({ theme }) => ({
  '& h1, & h2, & h3': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  '& p': {
    lineHeight: 1.8,
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  '& code': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.dark,
    padding: theme.spacing(0.5, 1),
    borderRadius: 8,
    fontFamily: 'Monaco, monospace',
  },
  '& pre': {
    backgroundColor: alpha(theme.palette.grey[900], 0.05),
    padding: theme.spacing(2),
    borderRadius: 12,
    overflow: 'auto',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    margin: theme.spacing(2, 0),
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  }
}));

const NodeTypeChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12,
  fontWeight: 600,
  background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
  color: 'white',
  '& .MuiChip-icon': {
    color: 'white',
  }
}));

const NextButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(1.5, 4),
  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.6)',
    animation: `${pulse} 1s infinite`,
  }
}));

const FloatingFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 32,
  right: 32,
  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
  zIndex: 1000,
  '&:hover': {
    background: 'linear-gradient(135deg, #1565c0, #1976d2)',
    transform: 'scale(1.1)',
    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.6)',
  },
  transition: 'all 0.3s ease-in-out'
}));

const NodeViewPage = () => {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const [node, setNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [nextNodeId, setNextNodeId] = useState(null);

  // Fonction pour récupérer les données du nœud
  const fetchNodeData = async () => {
    try {
      const response = await apiClient.get(`/knowledge-nodes/${nodeId}`);
      const data = response.data;
      setNode(data);

      if (data && !data.content_json) {
        setIsGenerating(true);
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      } else {
        setIsGenerating(false);
        setProgress(100);
      }
    } catch (err) {
      setError('Erreur lors de la récupération du contenu de la leçon.');
      console.error(err);
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer le node suivant
  const fetchNextNode = async () => {
    try {
      const response = await apiClient.get(`/knowledge-nodes/${nodeId}/next`);
      setNextNodeId(response.data.next_node_id);
    } catch (err) {
      console.log('Pas de node suivant disponible');
      setNextNodeId(null);
    }
  };

  // Navigation vers le node suivant
  const handleNextNode = () => {
    if (nextNodeId) {
      navigate(`/nodes/${nextNodeId}`);
    }
  };

  // Premier chargement des données
  useEffect(() => {
    setLoading(true);
    setProgress(10);
    fetchNodeData();
    fetchNextNode();
  }, [nodeId]);

  // Système de polling pour la génération
  useEffect(() => {
    if (!isGenerating) return;

    const intervalId = setInterval(() => {
      console.log("Vérification du statut de la génération du contenu...");
      fetchNodeData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isGenerating, nodeId]);

  const getNodeTypeIcon = (type) => {
    switch (type) {
      case 'CODING_EXERCISE':
        return <CodeIcon />;
      case 'LESSON':
        return <SchoolIcon />;
      default:
        return <AutoAwesomeIcon />;
    }
  };

  const getExerciseIcon = (componentType) => {
    const type = componentType?.toLowerCase();
    switch (type) {
      case 'qcm':
        return '📝';
      case 'writing':
      case 'rédaction':
        return '✍️';
      case 'essay':
      case 'essai':
        return '📄';
      case 'discussion':
        return '💬';
      case 'fill_in_the_blank':
        return '🔤';
      case 'reorder':
        return '🔄';
      case 'quiz':
        return '❓';
      case 'character_recognition':
        return '🔍';
      case 'association_drag_drop':
      case 'drag_drop':
        return '🎯';
      case 'sentence_construction':
        return '🔧';
      case 'coding_exercise':
        return '💻';
      default:
        return '📋';
    }
  };

  // Loading State
  if (loading) {
    return (
      <GradientContainer maxWidth="lg">
        <LoadingCard elevation={4}>
          <CircularProgress 
            size={48} 
            sx={{ mb: 2, color: 'primary.main' }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            🚀 Chargement de votre leçon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Préparation du contenu en cours...
          </Typography>
        </LoadingCard>
      </GradientContainer>
    );
  }

  // Error State
  if (error) {
    return (
      <GradientContainer maxWidth="lg">
        <Alert 
          severity="error" 
          sx={{ borderRadius: 3, fontSize: '1rem' }}
          icon={<AutoAwesomeIcon />}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Oops ! Une erreur s'est produite
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </GradientContainer>
    );
  }

  // Not Found State
  if (!node) {
    return (
      <GradientContainer maxWidth="lg">
        <Alert severity="warning" sx={{ borderRadius: 3, fontSize: '1rem' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            🔍 Leçon introuvable
          </Typography>
          <Typography variant="body2">
            Impossible de trouver cette leçon. Elle a peut-être été déplacée ou supprimée.
          </Typography>
        </Alert>
      </GradientContainer>
    );
  }

  return (
    <GradientContainer maxWidth="lg">
      <Stack spacing={4}>
        {/* Header Section */}
        <Fade in={true} timeout={600}>
          <HeaderCard>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h3" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 700,
                        background: `linear-gradient(135deg, #1976d2, #42a5f5)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                      }}
                    >
                      {node.title}
                    </Typography>
                    <NodeTypeChip
                      icon={getNodeTypeIcon(node.node_type)}
                      label={`Type: ${node.node_type}`}
                      size="medium"
                    />
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </HeaderCard>
        </Fade>

        {/* Generation Alert */}
        {isGenerating && (
          <Fade in={true} timeout={800}>
            <GeneratingAlert 
              severity="info" 
              sx={{ p: 3 }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TimerIcon />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      🤖 IA en action !
                    </Typography>
                    <Typography variant="body2">
                      Notre intelligence artificielle rédige cette leçon spécialement pour vous...
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha('#1976d2', 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  La page se mettra à jour automatiquement • {Math.round(progress)}%
                </Typography>
              </Stack>
            </GeneratingAlert>
          </Fade>
        )}

        {/* Lesson Content */}
        {node.content_json && (
          <Fade in={true} timeout={1000}>
            <ModernCard>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <SchoolIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    📚 Leçon
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 3, opacity: 0.6 }} />
                <MarkdownContainer>
                  <ReactMarkdown>
                    {node.content_json.lesson_text || "Le contenu de cette leçon n'a pas pu être chargé."}
                  </ReactMarkdown>
                </MarkdownContainer>
              </CardContent>
            </ModernCard>
          </Fade>
        )}

        {/* Exercises Section */}
        {node.exercises && node.exercises.length > 0 && (
          <Fade in={true} timeout={1200}>
            <Stack spacing={3}>
              {node.exercises.map((exercise, index) => (
                <ModernCard key={exercise.id}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <CodeIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {getExerciseIcon(exercise.component_type)} Exercice {index + 1}
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3, opacity: 0.6 }} />
                    <KnowledgeComponentViewer
                      component={exercise}
                      submittedAnswer={null} // À adapter si vous avez les réponses soumises
                      initialVote={null} // À adapter si vous avez les votes de feedback
                      onFeedbackSuccess={() => {}} // Callback optionnel
                    />
                  </CardContent>
                </ModernCard>
              ))}
            </Stack>
          </Fade>
        )}

        {/* Next Button - Version intégrée */}
        {nextNodeId && !isGenerating && (
          <Fade in={true} timeout={1400}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <NextButton
                variant="contained"
                size="large"
                onClick={handleNextNode}
                endIcon={<ArrowForwardIcon />}
              >
                🚀 Leçon Suivante
              </NextButton>
            </Box>
          </Fade>
        )}
      </Stack>

      {/* Floating Next Button - Alternative */}
      {nextNodeId && !isGenerating && (
        <Fade in={true} timeout={1600}>
          <FloatingFab
            onClick={handleNextNode}
            aria-label="Leçon suivante"
          >
            <NavigateNextIcon />
          </FloatingFab>
        </Fade>
      )}
    </GradientContainer>
  );
};

export default NodeViewPage;