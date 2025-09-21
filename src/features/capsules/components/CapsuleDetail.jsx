import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
import TopicIcon from '@mui/icons-material/Topic';
import SchoolIcon from '@mui/icons-material/School';
import CapsuleProgressBar from './CapsuleProgressBar';
import FeedbackButtons from '../../learning/components/FeedbackButtons';

const CapsuleDetail = () => {
  const { domain, area, capsuleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [expandedGranules, setExpandedGranules] = useState(new Set());
  const [expandedMolecules, setExpandedMolecules] = useState(new Set());
  const [atomsByMolecule, setAtomsByMolecule] = useState({});
  const [infoMessage, setInfoMessage] = useState(null);

  const { data: capsule, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['capsule', domain, area, capsuleId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/capsules/${domain}/${area}/${capsuleId}`);
      return data;
    },
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
        [moleculeId]: { loading: true, error: null, atoms: [], status: 'pending' },
      }));
      const response = await apiClient.get(`/capsules/molecules/${moleculeId}/atoms`, {
        validateStatus: (status) => [200, 202].includes(status),
      });
      if (response.status === 202) {
        return { moleculeId, atoms: [], generationStatus: 'pending', progressStatus: 'in_progress' };
      }
      const atoms = response.data || [];
      const allCompleted = atoms.every((atom) => atom.progress_status === 'completed');
      const anyAttempt = atoms.some((atom) => atom.progress_status !== 'not_started');
      const progressStatus = allCompleted ? 'completed' : anyAttempt ? 'in_progress' : 'not_started';
      return { moleculeId, atoms, generationStatus: 'completed', progressStatus };
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
      <Container sx={{ py: 6, textAlign: 'center' }}>
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/capsules"
          variant="text"
        >
          Retour
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {capsule.title}
        </Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        {capsule.domain} • {capsule.area}
      </Typography>

      {capsule.generation_status === 'pending' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Cette capsule est encore en cours de génération. Tu peux commencer la première leçon
          pendant que le reste se prépare. La page se mettra à jour automatiquement.
        </Alert>
      )}

      {infoMessage && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setInfoMessage(null)}>
          {infoMessage}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" fontWeight={700}>{granules.length}</Typography>
            <Typography variant="body2">Chapitres</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <TopicIcon color="secondary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" fontWeight={700}>
              {granules.reduce((acc, granule) => acc + (granule.molecules?.length || 0), 0)}
            </Typography>
            <Typography variant="body2">Leçons</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <CapsuleProgressBar
              current={capsule.user_xp ?? 0}
              target={capsule.xp_target ?? 60000}
              label="Progression globale"
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Plan d'apprentissage
        </Typography>

        {granules.length === 0 && (
          <Alert severity="info">
            Aucun contenu n'est encore disponible. Revenez un peu plus tard pendant que la capsule se
            génère.
          </Alert>
        )}

        <List sx={{ mt: 2 }}>
          {granules.map((granule) => {
            const isGranuleExpanded = expandedGranules.has(granule.id);
            return (
              <Box key={granule.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <ListItem onClick={() => toggleGranule(granule.id)} button>
                  <ListItemIcon><Chip label={`Chap. ${granule.order}`} color="primary" /></ListItemIcon>
                  <ListItemText primary={granule.title} />
                  <Chip
                    label={`${Math.round((granule.xp_percent ?? 0) * 100)}% XP`}
                    size="small"
                    color="info"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={granule.progress_status === 'completed' ? 'Terminé' : granule.progress_status === 'in_progress' ? 'En cours' : 'À faire'}
                    size="small"
                    color={granule.progress_status === 'completed' ? 'success' : granule.progress_status === 'in_progress' ? 'warning' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <IconButton edge="end">
                    {isGranuleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </ListItem>
                <Collapse in={isGranuleExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {granule.molecules?.map((molecule) => {
                      const moleculeState = atomsByMolecule[molecule.id] || {};
                      const generationStatus = moleculeState.generationStatus || molecule.generation_status;
                      const progressStatus = moleculeState.progressStatus || molecule.progress_status;
                      const hasContent = moleculeState.atoms && moleculeState.atoms.length > 0;
                      const isMoleculeExpanded = expandedMolecules.has(molecule.id);
                      const isLoading = moleculeState.loading;
                      const isLocked = molecule.is_locked;
                      const progressLabel = progressStatus === 'completed' ? 'Validé' : progressStatus === 'failed' ? 'À rejouer' : progressStatus === 'in_progress' ? 'En cours' : 'À faire';
                      const progressColor = progressStatus === 'completed' ? 'success' : progressStatus === 'failed' ? 'error' : progressStatus === 'in_progress' ? 'warning' : 'default';
                      const moleculeXpPercent = Math.round((molecule.xp_percent ?? 0) * 100);
                      return (
                        <Box key={molecule.id} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                         <ListItem button onClick={() => toggleMolecule(molecule)} sx={{ pl: 6 }}>
                            <ListItemIcon><TopicIcon color="action" /></ListItemIcon>
                            <ListItemText
                              primary={molecule.title}
                              secondary={`Leçon ${molecule.order}`}
                            />
                            {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                            <Chip
                              label={`${moleculeXpPercent}% XP`}
                              size="small"
                              color="info"
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={progressLabel}
                              size="small"
                              color={progressColor}
                              sx={{ mr: 1 }}
                            />
                            <IconButton edge="end" onClick={(e) => { e.stopPropagation(); toggleMolecule(molecule); }}>
                              {isMoleculeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
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
                            <Button
                              size="small"
                              sx={{ ml: 1 }}
                              variant="contained"
                              disabled={isLocked || !hasContent || generationStatus === 'pending' || generationStatus === 'failed' || isLoading}
                              onClick={(e) => { e.stopPropagation(); startSession(molecule); }}
                            >
                              {isLocked ? 'Verrouillé' : generationStatus === 'pending' ? 'En cours...' : 'Étudier'}
                            </Button>
                          </ListItem>
                         <Collapse in={isMoleculeExpanded} timeout="auto" unmountOnExit>
                           <Box sx={{ pl: 8, pr: 3, py: 2 }}>
                              <CapsuleProgressBar
                                current={molecule.xp_earned ?? 0}
                                target={molecule.xp_total ?? 0}
                                label="XP de cette leçon"
                                dense
                              />
                              {moleculeState.error && <Alert severity="error" sx={{ mb: 2 }}>{moleculeState.error}</Alert>}
                              {generationStatus === 'pending' && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                  Génération en cours. Tu peux quitter cette page : tu recevras une notification quand la leçon sera prête.
                                </Alert>
                              )}
                              {generationStatus === 'failed' && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                  La génération de cette leçon a échoué. Réessaie plus tard.
                                </Alert>
                              )}
                              {!isLoading && !moleculeState.error && generationStatus !== 'pending' && (!moleculeState.atoms || moleculeState.atoms.length === 0) && (
                                <Alert severity="info">Les contenus de cette leçon sont encore en train d'être générés.</Alert>
                              )}
                              {moleculeState.atoms?.map((atom) => {
                                const type = (atom.content_type || '').toLowerCase();
                                return (
                                  <ListItem key={atom.id} sx={{ pl: 0, alignItems: 'center' }}>
                                    <ListItemIcon>
                                      {type === 'lesson' ? <ArticleIcon color="primary" /> : <QuizIcon color="secondary" />}
                                    </ListItemIcon>
                                    <ListItemText primary={atom.title} secondary={type === 'lesson' ? 'Leçon' : 'Quiz'} />
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
                                  </ListItem>
                                );
                              })}
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Paper>
    </Container>
  );
};

export default CapsuleDetail;
