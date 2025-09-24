import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
import TopicIcon from '@mui/icons-material/Topic';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import CapsuleProgressBar from './CapsuleProgressBar';
import FeedbackButtons from '../../learning/components/FeedbackButtons';
import CapsuleChatPanel from '../../chat/components/CapsuleChatPanel';
import { fetchCapsuleDetail, fetchMoleculeAtoms } from '../api/capsulesApi';

const CapsuleDetail = () => {
  const { domain, area, capsuleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [expandedGranules, setExpandedGranules] = useState(new Set());
  const [expandedMolecules, setExpandedMolecules] = useState(new Set());
  const [atomsByMolecule, setAtomsByMolecule] = useState({});
  const [infoMessage, setInfoMessage] = useState(null);

  const { data: capsule, isLoading, isError, error } = useQuery({
    queryKey: ['capsule', domain, area, capsuleId],
    queryFn: () => fetchCapsuleDetail(domain, area, capsuleId),
    refetchInterval: (query) => {
      const status = query.state.data?.generation_status;
      return status === 'pending' ? 4000 : false;
    },
  });

  const startSession = (molecule) => {
    if (molecule.is_locked) {
      setInfoMessage("Terminez les leçons précédentes pour accéder à celle-ci.");
      return;
    }
    navigate(`/session/molecule/${molecule.id}`);
  };

  useEffect(() => {
    if (!capsule) return;
    const initial = {};
    capsule.granules?.forEach((granule) => {
      granule.molecules?.forEach((molecule) => {
        initial[molecule.id] = {
          loading: false,
          error: null,
          atoms: molecule.atoms ?? [],
          generationStatus: molecule.generation_status,
          progressStatus: molecule.progress_status,
        };
      });
    });
    setAtomsByMolecule((prev) => {
      const next = { ...prev };
      Object.entries(initial).forEach(([id, data]) => {
        const existing = next[id] || {};
        const merged = { ...existing, ...data };
        if (existing.atoms?.length && (!data.atoms || data.atoms.length === 0)) {
          merged.atoms = existing.atoms;
        }
        next[id] = merged;
      });
      return next;
    });
  }, [capsule]);

  const fetchAtoms = useMutation({
    mutationFn: async (moleculeId) => {
      setAtomsByMolecule((prev) => ({
        ...prev,
        [moleculeId]: {
          loading: true,
          error: null,
          atoms: [],
          generationStatus: 'pending',
          progressStatus: 'in_progress',
        },
      }));
      const result = await fetchMoleculeAtoms(moleculeId);
      return { moleculeId, ...result };
    },
    onSuccess: ({ moleculeId, atoms, generationStatus, progressStatus }) => {
      setAtomsByMolecule((prev) => ({
        ...prev,
        [moleculeId]: { loading: false, error: null, atoms, generationStatus, progressStatus },
      }));
    },
    onError: (err, moleculeId) => {
      if (err?.response?.status === 403 && err?.response?.data?.detail === 'molecule_locked') {
        setInfoMessage("Terminez la leçon précédente pour débloquer celle-ci.");
      }
      const detail = err?.response?.data?.detail || "Erreur lors du chargement des contenus.";
      setAtomsByMolecule((prev) => ({
        ...prev,
        [moleculeId]: { loading: false, error: detail, atoms: [], generationStatus: 'failed', progressStatus: 'not_started' },
      }));
    },
  });

  const toggleGranule = (granuleId) => {
    setExpandedGranules((prev) => {
      const next = new Set(prev);
      next.has(granuleId) ? next.delete(granuleId) : next.add(granuleId);
      return next;
    });
  };

  const toggleMolecule = (molecule) => {
    if (molecule.is_locked) {
      setInfoMessage("Terminez la leçon précédente pour débloquer celle-ci.");
      return;
    }
    setExpandedMolecules((prev) => {
      const next = new Set(prev);
      if (next.has(molecule.id)) {
        next.delete(molecule.id);
      } else {
        next.add(molecule.id);
        const state = atomsByMolecule[molecule.id];
        const genStatus = state?.generationStatus ?? molecule.generation_status;
        if (!state || (state.atoms?.length === 0 && genStatus !== 'pending' && !state.loading)) {
          fetchAtoms.mutate(molecule.id);
        }
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={64} />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">Impossible de charger la capsule : {error?.message}</Alert>
      </Container>
    );
  }

  if (!capsule) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">Aucune donnée disponible pour cette capsule.</Alert>
      </Container>
    );
  }

  const granules = capsule.granules ?? [];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pb: 4
    }}>
      {/* Header Section */}
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        py: 4, 
        mb: 4,
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              component={RouterLink}
              to="/capsules"
              variant="text"
              sx={{ color: 'text.secondary' }}
            >
              Retour
            </Button>
          </Stack>
          
          <Typography 
            variant="h3" 
            fontWeight="300" 
            sx={{ 
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {capsule.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {capsule.domain} • {capsule.area}
          </Typography>

          {/* Progress Stats */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="600" color="primary.main">
                  {granules.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Chapitres</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="600" color="secondary.main">
                  {granules.reduce((acc, granule) => acc + (granule.molecules?.length || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Leçons</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="600" color="success.main">
                  {Math.round(((capsule.user_xp ?? 0) / (capsule.xp_target ?? 60000)) * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Progression</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {capsule.generation_status === 'pending' && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            Cette capsule est encore en cours de génération. Tu peux commencer la première leçon
            pendant que le reste se prépare.
          </Alert>
        )}

        {infoMessage && (
          <Alert 
            severity="warning" 
            sx={{ mb: 4, borderRadius: 3 }} 
            onClose={() => setInfoMessage(null)}
          >
            {infoMessage}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {granules.length === 0 && (
                <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ py: 6 }}>
                    <Alert severity="info" sx={{ border: 'none' }}>
                      Aucun contenu n'est encore disponible. Revenez un peu plus tard.
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {granules.map((granule, index) => {
                const isGranuleExpanded = expandedGranules.has(granule.id);
                const completedMolecules = granule.molecules?.filter(m => m.progress_status === 'completed').length || 0;
                const totalMolecules = granule.molecules?.length || 0;
                
                return (
                  <Card 
                    key={granule.id}
                    sx={{ 
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      overflow: 'visible',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Granule Header */}
                      <Box 
                        onClick={() => toggleGranule(granule.id)}
                        sx={{ 
                          p: 4,
                          cursor: 'pointer',
                          background: `linear-gradient(135deg, 
                            ${granule.progress_status === 'completed' ? '#4caf50' : 
                              granule.progress_status === 'in_progress' ? '#ff9800' : '#e3f2fd'} 0%, 
                            ${granule.progress_status === 'completed' ? '#81c784' : 
                              granule.progress_status === 'in_progress' ? '#ffb74d' : '#bbdefb'} 100%)`,
                          color: granule.progress_status === 'not_started' ? 'text.primary' : 'white',
                          borderRadius: '16px 16px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
                            {granule.title}
                          </Typography>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {completedMolecules}/{totalMolecules} leçons
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {Math.round((granule.xp_percent ?? 0) * 100)}% XP
                            </Typography>
                          </Stack>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {granule.progress_status === 'completed' && (
                            <CheckCircleIcon sx={{ fontSize: 28 }} />
                          )}
                          <IconButton 
                            sx={{ 
                              color: 'inherit',
                              background: 'rgba(255,255,255,0.1)',
                              '&:hover': { background: 'rgba(255,255,255,0.2)' }
                            }}
                          >
                            {isGranuleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Molecules */}
                      <Collapse in={isGranuleExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3 }}>
                          <Stack spacing={2}>
            {granule.molecules?.map((molecule) => {
                              const moleculeState = atomsByMolecule[molecule.id] || {};
                              const generationStatus = moleculeState.generationStatus || molecule.generation_status;
                              const progressStatus = moleculeState.progressStatus || molecule.progress_status;
                              const hasContent = moleculeState.atoms && moleculeState.atoms.length > 0;
                              const isMoleculeExpanded = expandedMolecules.has(molecule.id);
                              const isLoading = moleculeState.loading;
                              const isLocked = molecule.is_locked;
                              const moleculeXpPercent = Math.round((molecule.xp_percent ?? 0) * 100);

                              return (
                                <Card
                                  key={molecule.id}
                                  sx={{
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: isLocked ? 'grey.300' : 'divider',
                                    opacity: isLocked ? 0.6 : 1,
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <CardContent sx={{ p: 3 }}>
                                    <Box 
                                      sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        cursor: isLocked ? 'not-allowed' : 'pointer'
                                      }}
                                      onClick={() => !isLocked && toggleMolecule(molecule)}
                                    >
                                      <Box 
                                        sx={{ 
                                          width: 40,
                                          height: 40,
                                          borderRadius: '50%',
                                          background: isLocked ? 'grey.300' : 
                                                    progressStatus === 'completed' ? 'success.light' :
                                                    progressStatus === 'in_progress' ? 'warning.light' : 'primary.light',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white'
                                        }}
                                      >
                                        {isLocked ? <LockIcon /> : 
                                         progressStatus === 'completed' ? <CheckCircleIcon /> :
                                         <PlayCircleOutlineIcon />}
                                      </Box>

                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 0.5 }}>
                                          {molecule.title}
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                          <Typography variant="body2" color="text.secondary">
                                            Leçon {molecule.order}
                                          </Typography>
                                          <Chip 
                                            label={`${moleculeXpPercent}% XP`}
                                            size="small"
                                            color="info"
                                          />
                                        </Stack>
                                      </Box>

                                      <Stack direction="row" spacing={1} alignItems="center">
                                        {isLoading && <CircularProgress size={20} />}
                                        
                                        <Button
                                          size="small"
                                          variant="contained"
                                          disabled={
                                            isLocked ||
                                            !hasContent ||
                                            generationStatus === 'pending' ||
                                            generationStatus === 'failed' ||
                                            isLoading
                                          }
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startSession(molecule);
                                          }}
                                          sx={{ borderRadius: 2 }}
                                        >
                                          {isLocked ? 'Verrouillé' : 
                                           generationStatus === 'pending' ? 'En cours...' : 'Étudier'}
                                        </Button>

                                        <FeedbackButtons
                                          contentType="molecule"
                                          contentId={molecule.id}
                                          initialRating={molecule.user_feedback_rating}
                                          initialReason={molecule.user_feedback_reason}
                                          initialComment={molecule.user_feedback_comment}
                                          onSuccess={() => {
                                            queryClient.invalidateQueries({ queryKey: ['capsule', domain, area, capsuleId] });
                                          }}
                                        />

                                        <IconButton 
                                          size="small"
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (!isLocked) toggleMolecule(molecule); 
                                          }}
                                        >
                                          {isMoleculeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                      </Stack>
                                    </Box>

                                    {/* Molecule Progress */}
                                    <Box sx={{ mt: 2 }}>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={moleculeXpPercent}
                                        sx={{ 
                                          height: 6,
                                          borderRadius: 3,
                                          bgcolor: 'grey.200'
                                        }}
                                      />
                                    </Box>

                                    {/* Atoms */}
                                    <Collapse in={isMoleculeExpanded} timeout="auto" unmountOnExit>
                                      <Box sx={{ mt: 3 }}>
                                        {moleculeState.error && (
                                          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                            {moleculeState.error}
                                          </Alert>
                                        )}
                                        
                                        {generationStatus === 'pending' && (
                                          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                            Génération en cours...
                                          </Alert>
                                        )}

                                        <Stack spacing={1}>
                                          {moleculeState.atoms?.map((atom) => {
                                            const isLesson = (atom.content_type || '').toLowerCase() === 'lesson';
                                            return (
                                              <Box 
                                                key={atom.id}
                                                sx={{ 
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  p: 2,
                                                  borderRadius: 2,
                                                  background: 'grey.50',
                                                  gap: 2
                                                }}
                                              >
                                                <Box 
                                                  sx={{ 
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: isLesson ? 'primary.light' : 'secondary.light',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white'
                                                  }}
                                                >
                                                  {isLesson ? <ArticleIcon fontSize="small" /> : <QuizIcon fontSize="small" />}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                  <Typography variant="body2" fontWeight="500">
                                                    {atom.title}lorenzo
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary">
                                                    {isLesson ? 'Leçon' : 'Quiz'}
                                                  </Typography>
                                                </Box>
                                                <FeedbackButtons
                                                  contentType="atom"
                                                  contentId={atom.id}
                                                  initialRating={atom.user_feedback_rating}
                                                  initialReason={atom.user_feedback_reason}
                                                  initialComment={atom.user_feedback_comment}
                                                  onSuccess={() => {
                                                    queryClient.invalidateQueries({ queryKey: ['capsule', domain, area, capsuleId] });
                                                  }}
                                                />
                                              </Box>
                                            );
                                          })}
                                        </Stack>
                                      </Box>
                                    </Collapse>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </Stack>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <CapsuleChatPanel 
                domain={capsule.domain} 
                area={capsule.area} 
                capsuleTitle={capsule.title} 
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CapsuleDetail;