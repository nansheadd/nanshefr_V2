import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axiosConfig';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Fade,
  Card,
  CardContent,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ScienceIcon from '@mui/icons-material/Science';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CategoryIcon from '@mui/icons-material/Category';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SchoolIcon from '@mui/icons-material/School';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CloseIcon from '@mui/icons-material/Close';
import TranslateIcon from '@mui/icons-material/Translate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BiotechIcon from '@mui/icons-material/Biotech';
import FunctionsIcon from '@mui/icons-material/Functions';
import GroupsIcon from '@mui/icons-material/Groups';
import CodeIcon from '@mui/icons-material/Code';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PaletteIcon from '@mui/icons-material/Palette';
import BusinessIcon from '@mui/icons-material/Business';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import QuizIcon from '@mui/icons-material/Quiz';
import WorkIcon from '@mui/icons-material/Work';
import HubIcon from '@mui/icons-material/Hub';
import StarIcon from '@mui/icons-material/Star';

const domainIcons = {
  'langues': TranslateIcon,
  'humanites': MenuBookIcon,
  'sciences_naturelles': BiotechIcon,
  'sciences_formelles': FunctionsIcon,
  'sciences_sociales': GroupsIcon,
  'informatique_data': CodeIcon,
  'ingenierie_tech': EngineeringIcon,
  'sante_medecine': LocalHospitalIcon,
  'arts_creation': PaletteIcon,
  'business_droit': BusinessIcon,
  'soft_skills': EmojiPeopleIcon,
  'tests_concours': QuizIcon,
  'metiers_pro': WorkIcon
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 24,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}30`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  overflow: 'visible',
}));

const ResultBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}05, ${theme.palette.secondary.main}05)`,
  border: `1px solid ${theme.palette.divider}20`,
  marginTop: theme.spacing(3),
}));

const StatsCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  background: 'white',
  border: `1px solid ${theme.palette.divider}20`,
  textAlign: 'center',
  flex: 1,
}));

const ActionCard = styled(Card)(({ theme, disabled }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  border: `2px solid ${disabled ? theme.palette.divider : theme.palette.primary.main}30`,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'all 0.3s ease',
  background: disabled ? 'rgba(200,200,200,0.1)' : 'white',
  '&:hover': !disabled && {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    borderColor: theme.palette.primary.main,
  }
}));

const FeedbackButton = styled(IconButton)(({ theme, active }) => ({
  border: `2px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: active ? `${theme.palette.primary.main}10` : 'transparent',
  marginLeft: theme.spacing(1),
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}20`,
  }
}));

const createCapsule = async (capsuleData) => {
  console.log("--- [FRONTEND] Lancement de la création de la capsule avec le titre :", capsuleData.title);
  const { data } = await api.post('/capsules/', capsuleData);
  console.log("--- [FRONTEND] Réponse reçue du backend :", data);
  return data;
};

function ClassifierTest() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [dislikeDialog, setDislikeDialog] = useState(false);
  const [dislikeReason, setDislikeReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const navigate = useNavigate();

  const capsuleCreationMutation = useMutation({
    mutationFn: createCapsule,
    onSuccess: (data) => {
      const newCapsule = response.data;
      console.log("--- [FRONTEND] Réponse reçue du backend :", newCapsule);
      const url = `/capsule/${newCapsule.domain}/${newCapsule.area}/${newCapsule.id}`;
      console.log("--- [FRONTEND] Redirection vers la nouvelle page de la capsule :", url);
      navigate(url);
    },
    onError: (err) => {
      console.error("--- [FRONTEND] Erreur lors de la création de la capsule :", err);
      setError(err.response?.data?.detail || "Une erreur est survenue lors du lancement de la création.");
    }
  });

  const handleClassify = async () => {
    if (!text) {
      setError('Veuillez entrer un sujet.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setFeedback(null);
    setShowActions(false);
    try {
      const response = await api.post('/capsules/classify-topic/', {
        text: text, // Conforme au modèle Pydantic `ClassifyRequest`
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    if (type === 'like') {
      setShowActions(true);
    } else {
      setShowActions(false);
      setDislikeDialog(true);
    }
  };

  const handleCreateCapsule = () => {
    console.log("--- [FRONTEND] Clic sur 'Lancer la Capsule'. Lancement de la mutation.");
    capsuleCreationMutation.mutate({
      title: text,
    });
  };

  const dislikeReasons = [
    'Mauvaise catégorie principale', 'Compétences non pertinentes', 'Niveau mal évalué',
    'Domaine incorrect', 'Classification trop générale', 'Autre'
  ];

  const getDomainIcon = (domain) => {
    const key = domain?.toLowerCase().replace(/\s+/g, '_');
    const Icon = domainIcons[key] || CategoryIcon;
    return <Icon />;
  };

  return (
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <ScienceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Test du Classifieur de Sujet</Typography>
                <Typography variant="body2" color="text.secondary">Analysez votre sujet avec l'IA</Typography>
              </Box>
            </Stack>

            <Stack spacing={3}>
              <TextField
                fullWidth variant="outlined" label="Entrez votre sujet"
                value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Ex: apprendre python, les hiragana, etc."
                disabled={loading || capsuleCreationMutation.isPending}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <Button
                variant="contained" onClick={handleClassify} disabled={loading || !text || capsuleCreationMutation.isPending}
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                sx={{
                  borderRadius: 3, py: 1.5,
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  '&:hover': { background: 'linear-gradient(135deg, #1565c0, #1976d2)' }
                }}
              >
                {loading ? 'Classification en cours...' : 'Classifier le sujet'}
              </Button>

              {(error || capsuleCreationMutation.isError) && (
                <Fade in>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error || capsuleCreationMutation.error.message}
                  </Alert>
                </Fade>
              )}

              {/* --- MODIFICATION 1: On vérifie que `result` existe avant de l'afficher --- */}
              {result && (
                <Fade in>
                  <ResultBox>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {/* --- MODIFICATION 2: On accède directement à `result.domain` --- */}
                        {getDomainIcon(result.domain)}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Classification: {result.domain || 'Non défini'}
                        </Typography>
                      </Stack>
                      <Stack direction="row">
                        <FeedbackButton active={feedback === 'like'} onClick={() => handleFeedback('like')} color="success"><ThumbUpIcon /></FeedbackButton>
                        <FeedbackButton active={feedback === 'dislike'} onClick={() => handleFeedback('dislike')} color="error"><ThumbDownIcon /></FeedbackButton>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                      <StatsCard>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                          {/* --- MODIFICATION 3: On adapte toutes les références --- */}
                          {getDomainIcon(result.domain)}
                          <Typography variant="h4" color="primary.main">{result.domain !== 'others' ? 1 : 0}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Domaine</Typography>
                      </StatsCard>
                      <StatsCard>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                          <HubIcon color="secondary" />
                          <Typography variant="h4" color="secondary.main">{result.area !== 'default' ? 1 : 0}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Area</Typography>
                      </StatsCard>
                      <StatsCard>
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                          <StarIcon sx={{ color: '#ffa726' }} />
                          <Typography variant="h4" sx={{ color: '#ffa726' }}>{result.main_skill ? 1 : 0}</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">Skill</Typography>
                      </StatsCard>
                    </Stack>

                    <Collapse in={showActions}>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>🎯 Créer votre parcours</Typography>
                      <Stack spacing={2}>
                        <ActionCard onClick={handleCreateCapsule} disabled={capsuleCreationMutation.isPending}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            {capsuleCreationMutation.isPending ?
                              <CircularProgress size={40} /> :
                              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            }
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>Lancer la Capsule</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {capsuleCreationMutation.isPending ? "Initialisation de la capsule..." : "Crée un parcours d'apprentissage complet"}
                              </Typography>
                            </Box>
                          </Stack>
                        </ActionCard>
                        <ActionCard onClick={() => console.log('Cours adaptatif')}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <RocketLaunchIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>Parcours Adaptatif</Typography>
                              <Typography variant="body2" color="text.secondary">Personnalisé selon votre niveau</Typography>
                            </Box>
                          </Stack>
                        </ActionCard>
                        <ActionCard disabled>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <SportsEsportsIcon sx={{ fontSize: 40 }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>Mode Aventure</Typography>
                              <Typography variant="body2" color="text.secondary">Bientôt disponible - Apprenez en jouant!</Typography>
                            </Box>
                          </Stack>
                        </ActionCard>
                      </Stack>
                    </Collapse>
                  </ResultBox>
                </Fade>
              )}
            </Stack>
          </CardContent>
        </StyledCard>

        <Dialog open={dislikeDialog} onClose={() => setDislikeDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Aidez-nous à améliorer</Typography>
              <IconButton onClick={() => setDislikeDialog(false)}><CloseIcon /></IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth>
              <RadioGroup value={dislikeReason} onChange={(e) => setDislikeReason(e.target.value)}>
                {dislikeReasons.map((reason) => (
                  <FormControlLabel key={reason} value={reason} control={<Radio />} label={reason} />
                ))}
              </RadioGroup>
              {dislikeReason === 'Autre' && (
                <TextField multiline rows={3} placeholder="Précisez votre feedback..."
                  value={customReason} onChange={(e) => setCustomReason(e.target.value)} sx={{ mt: 2 }} />
              )}
            </FormControl>
            <Button fullWidth variant="contained" sx={{ mt: 3 }}
              onClick={() => {
                console.log('Feedback:', dislikeReason, customReason);
                setDislikeDialog(false);
              }}>
              Envoyer le feedback
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
  );
}

export default ClassifierTest;