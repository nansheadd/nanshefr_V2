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
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import TopicIcon from '@mui/icons-material/Topic';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
import apiClient from '../../../api/axiosConfig';
import FeedbackButtons from '../../learning/components/FeedbackButtons';
import CapsuleProgressBar from '../components/CapsuleProgressBar';
import { useAuth } from '../../../hooks/useAuth';
import { useI18n } from '../../../i18n/I18nContext';

const fetchCapsule = async (domain, area, capsuleId) => {
  const { data } = await apiClient.get(`/capsules/${domain}/${area}/${capsuleId}`);
  return data;
};

const CapsulePlanPage = () => {
  const { domain, area, capsuleId } = useParams();
  const navigate = useNavigate();

  const [expandedGranules, setExpandedGranules] = useState(new Set());
  const [expandedMolecules, setExpandedMolecules] = useState(new Set());
  const [atomsByMolecule, setAtomsByMolecule] = useState({});
  const [infoMessage, setInfoMessage] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useI18n();
  const rawStatus = (user?.subscription_status ?? '').toString().toLowerCase();
  const normalizedStatus = rawStatus.includes('.') ? rawStatus.split('.').pop() : rawStatus;
  const isPremium = normalizedStatus === 'premium';
  const canGenerateBonus = Boolean(user?.is_superuser || isPremium);

  const { data: capsule, isLoading, isError, error } = useQuery({
    queryKey: ['capsule', domain, area, capsuleId],
    queryFn: () => fetchCapsule(domain, area, capsuleId),
    enabled: !!capsuleId,
    refetchInterval: (query) => {
      const status = query.state.data?.generation_status;
      return status === 'pending' ? 4000 : false;
    },
  });

  const fetchAtoms = useMutation({
    mutationFn: async (moleculeId) => {
      setAtomsByMolecule((prev) => ({
        ...prev,
        [moleculeId]: { loading: true, error: null, atoms: [], generationStatus: 'pending', progressStatus: 'in_progress' },
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
        setInfoMessage(t('capsulePlan.messages.unlock'));
      }
      const detail = err?.response?.data?.detail || t('capsulePlan.errors.loadAtoms');
      setAtomsByMolecule((prev) => ({
        ...prev,
        [moleculeId]: { loading: false, error: detail, atoms: [], generationStatus: 'failed', progressStatus: 'not_started' },
      }));
    },
  });

  const generateBonus = useMutation({
    mutationFn: async ({ moleculeId, kind }) => {
      const { data } = await apiClient.post(`/capsules/molecules/${moleculeId}/bonus`, { kind });
      return { moleculeId, atoms: data || [] };
    },
    onMutate: ({ moleculeId }) => {
      setAtomsByMolecule((prev) => ({
        ...prev,
        [moleculeId]: {
          ...(prev[moleculeId] || {}),
          loading: true,
          error: null,
        },
      }));
    },
    onSuccess: ({ moleculeId, atoms }) => {
      const allCompleted = atoms.every((atom) => atom.progress_status === 'completed');
      const anyAttempt = atoms.some((atom) => atom.progress_status !== 'not_started');
      const progressStatus = allCompleted ? 'completed' : anyAttempt ? 'in_progress' : 'not_started';
      setAtomsByMolecule((prev) => ({
        ...prev,
        [moleculeId]: {
          loading: false,
          error: null,
          atoms,
          generationStatus: 'completed',
          progressStatus,
        },
      }));
      queryClient.invalidateQueries({ queryKey: ['capsule', domain, area, capsuleId] });
    },
    onError: (err) => {
      if (err?.response?.status === 403 && err?.response?.data?.detail === 'premium_required') {
        setInfoMessage(t('capsulePlan.messages.bonusPremium'));
        return;
      }
      const detail = err?.response?.data?.detail || t('capsulePlan.errors.bonus');
      setInfoMessage(detail);
      const moleculeId = generateBonus.variables?.moleculeId;
      if (moleculeId) {
        setAtomsByMolecule((prev) => ({
          ...prev,
          [moleculeId]: {
            ...(prev[moleculeId] || {}),
            loading: false,
          },
        }));
      }
    },
  });

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

  const toggleGranule = (granuleId) => {
    setExpandedGranules((prev) => {
      const next = new Set(prev);
      next.has(granuleId) ? next.delete(granuleId) : next.add(granuleId);
      return next;
    });
  };

  const toggleMolecule = (molecule) => {
    if (molecule.is_locked) {
      setInfoMessage(t('capsulePlan.messages.unlock'));
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

  const startSession = (molecule) => {
    if (molecule.is_locked) {
      setInfoMessage(t('capsulePlan.messages.unlockMultiple'));
      return;
    }
    navigate(`/session/molecule/${molecule.id}`);
  };

  const handleGenerateBonus = (molecule, kind) => {
    if (!canGenerateBonus) {
      setInfoMessage(t('capsulePlan.messages.bonusPremium'));
      return;
    }
    generateBonus.mutate({ moleculeId: molecule.id, kind });
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={56} />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{t('capsulePlan.alerts.loadError')} {error?.message}</Alert>
      </Container>
    );
  }

  if (!capsule) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">{t('capsulePlan.alerts.noData')}</Alert>
      </Container>
    );
  }

  const granules = capsule.granules ?? [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button component={RouterLink} to="/capsules" startIcon={<ArrowBackIcon />}>{t('capsulePlan.back')}</Button>
        <Typography variant="h4" fontWeight={700}>{capsule.title}</Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        {capsule.domain} • {capsule.area}
      </Typography>

      {capsule.generation_status === 'pending' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('capsulePlan.messages.planPending')}
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
            <Typography variant="body2">{t('capsulePlan.stats.chapters')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <TopicIcon color="secondary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" fontWeight={700}>
              {granules.reduce((acc, granule) => acc + (granule.molecules?.length || 0), 0)}
            </Typography>
            <Typography variant="body2">{t('capsulePlan.stats.lessons')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <CapsuleProgressBar
              current={capsule.user_xp ?? 0}
              target={capsule.xp_target ?? 60000}
              label={t('capsulePlan.stats.globalProgress')}
            />
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t('capsulePlan.labels.program')}
        </Typography>

        {granules.length === 0 && (
          <Alert severity="info">{t('capsulePlan.alerts.contentPending')}</Alert>
        )}

        <List sx={{ mt: 2 }}>
          {granules.map((granule) => {
            const isExpanded = expandedGranules.has(granule.id);
            return (
              <Box key={granule.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <ListItem button onClick={() => toggleGranule(granule.id)}>
                  <ListItemIcon>
                    <Chip label={`${t('capsulePlan.labels.chapterShort')} ${granule.order}`} color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={granule.title} />
                  <Chip
                    label={`${Math.round((granule.xp_percent ?? 0) * 100)}% ${t('capsulePlan.labels.xpSuffix')}`}
                    size="small"
                    color="info"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={t(`capsulePlan.status.${granule.progress_status}`)}
                    size="small"
                    color={granule.progress_status === 'completed' ? 'success' : granule.progress_status === 'in_progress' ? 'warning' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    edge="end"
                    sx={
                      !isExpanded
                        ? {
                            animation: 'arrowPulse 1.8s ease-in-out infinite',
                            '@keyframes arrowPulse': {
                              '0%': { transform: 'translateX(0)' },
                              '50%': { transform: 'translateX(6px)' },
                              '100%': { transform: 'translateX(0)' },
                            },
                          }
                        : undefined
                    }
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </ListItem>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {granule.molecules?.map((molecule) => {
                      const state = atomsByMolecule[molecule.id] || {};
                      const generationStatus = state.generationStatus || molecule.generation_status;
                      const progressStatus = state.progressStatus || molecule.progress_status;
                      const hasContent = state.atoms && state.atoms.length > 0;
                      const isMoleculeExpanded = expandedMolecules.has(molecule.id);
                      const progressLabel = progressStatus === 'completed'
                        ? t('capsulePlan.status.validated')
                        : progressStatus === 'failed'
                          ? t('capsulePlan.status.failed')
                          : t(`capsulePlan.status.${progressStatus}`);
                      const progressColor = progressStatus === 'completed' ? 'success' : progressStatus === 'failed' ? 'error' : progressStatus === 'in_progress' ? 'warning' : 'default';
                      const moleculeXpPercent = Math.round((molecule.xp_percent ?? 0) * 100);
                      const isBonusGenerating = generateBonus.isPending && generateBonus.variables?.moleculeId === molecule.id;
                      const premiumHint = canGenerateBonus ? '' : t('capsulePlan.labels.availableWithPremium');
                      return (
                        <Box key={molecule.id} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                          <ListItem button sx={{ pl: 6 }} onClick={() => toggleMolecule(molecule)}>
                            <ListItemIcon><TopicIcon color="action" /></ListItemIcon>
                            <ListItemText
                              primary={molecule.title}
                              secondary={`${t('capsulePlan.labels.lesson')} ${molecule.order}`}
                            />
                            {state.loading && <CircularProgress size={18} sx={{ mr: 1 }} />}
                            <Chip
                              label={`${moleculeXpPercent}% ${t('capsulePlan.labels.xpSuffix')}`}
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
                              edge="end"
                              onClick={(e) => { e.stopPropagation(); toggleMolecule(molecule); }}
                              sx={
                                !isMoleculeExpanded
                                  ? {
                                      animation: 'arrowPulse 1.8s ease-in-out infinite',
                                      '@keyframes arrowPulse': {
                                        '0%': { transform: 'translateX(0)' },
                                        '50%': { transform: 'translateX(6px)' },
                                        '100%': { transform: 'translateX(0)' },
                                      },
                                    }
                                  : undefined
                              }
                            >
                              {isMoleculeExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Button
                              size="small"
                              sx={{ ml: 1 }}
                              variant="contained"
                              disabled={molecule.is_locked || !hasContent || generationStatus === 'pending' || generationStatus === 'failed' || state.loading}
                              onClick={(e) => { e.stopPropagation(); startSession(molecule); }}
                            >
                              {molecule.is_locked
                                ? t('capsulePlan.labels.locked')
                                : generationStatus === 'pending'
                                  ? t('capsulePlan.labels.loading')
                                  : t('capsulePlan.labels.study')}
                            </Button>
                          </ListItem>
                          <Collapse in={isMoleculeExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ pl: 8, pr: 3, py: 2 }}>
                              <CapsuleProgressBar
                                current={molecule.xp_earned ?? 0}
                                target={molecule.xp_total ?? 0}
                                label={t('capsulePlan.stats.lessonXp')}
                                dense
                              />
                              {!!molecule.bonus_xp_total && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {t('capsulePlan.stats.bonusXp', {
                                    earned: molecule.bonus_xp_earned ?? 0,
                                    total: molecule.bonus_xp_total ?? 0,
                                  })}
                                </Typography>
                              )}
                              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ my: 2 }}>
                                {!canGenerateBonus && (
                                  <Typography variant="caption" color="warning.main" sx={{ mb: 0.5 }}>
                                    {t('capsulePlan.labels.premiumFeature')}
                                  </Typography>
                                )}
                                <Tooltip title={premiumHint} placement="top" disableHoverListener={canGenerateBonus} arrow>
                                  <span>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="secondary"
                                      disabled={isBonusGenerating}
                                      onClick={() => handleGenerateBonus(molecule, 'exercise')}
                                      sx={{
                                        opacity: canGenerateBonus ? 1 : 0.6,
                                        cursor: canGenerateBonus ? 'pointer' : 'not-allowed',
                                      }}
                                    >
                                      {isBonusGenerating ? t('capsulePlan.labels.loading') : t('capsulePlan.buttons.bonusExercise')}
                                    </Button>
                                  </span>
                                </Tooltip>
                                <Tooltip title={premiumHint} placement="top" disableHoverListener={canGenerateBonus} arrow>
                                  <span>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="info"
                                      disabled={isBonusGenerating}
                                      onClick={() => handleGenerateBonus(molecule, 'lesson')}
                                      sx={{
                                        opacity: canGenerateBonus ? 1 : 0.6,
                                        cursor: canGenerateBonus ? 'pointer' : 'not-allowed',
                                      }}
                                    >
                                      {isBonusGenerating ? t('capsulePlan.labels.loading') : t('capsulePlan.buttons.bonusTheory')}
                                    </Button>
                                  </span>
                                </Tooltip>
                              </Stack>
                              {state.error && <Alert severity="error" sx={{ mb: 2 }}>{state.error}</Alert>}
                              {generationStatus === 'pending' && (
                                <Alert severity="info" sx={{ mb: 2 }}>{t('capsulePlan.messages.generationRunning')}</Alert>
                              )}
                              {generationStatus === 'failed' && (
                                <Alert severity="error" sx={{ mb: 2 }}>{t('capsulePlan.messages.generationFailed')}</Alert>
                              )}
                              {!state.loading && !state.error && generationStatus !== 'pending' && (!state.atoms || state.atoms.length === 0) && (
                                <Alert severity="info">{t('capsulePlan.messages.lessonGenerating')}</Alert>
                              )}
                              {state.atoms?.map((atom) => {
                                const type = (atom.content_type || '').toLowerCase();
                                const xpValue = atom.xp_value ?? 0;
                                return (
                                  <ListItem key={atom.id} sx={{ pl: 0, alignItems: 'center' }}>
                                    <ListItemIcon>
                                      {type === 'lesson' ? <ArticleIcon color="primary" /> : <QuizIcon color="secondary" />}
                                    </ListItemIcon>
                                    <ListItemText primary={atom.title} secondary={type === 'lesson' ? t('capsulePlan.labels.lesson') : t('capsulePlan.labels.quiz')} />
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2 }}>
                                      {atom.is_bonus && <Chip label={t('capsulePlan.labels.bonus')} color="warning" size="small" />}
                                      <Chip label={`+${xpValue} ${t('capsulePlan.labels.xpSuffix')}`} size="small" color={atom.is_bonus ? 'warning' : 'success'} variant={atom.is_bonus ? 'outlined' : 'filled'} />
                                    </Stack>
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

export default CapsulePlanPage;
