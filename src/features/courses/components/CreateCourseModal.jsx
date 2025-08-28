// src/features/courses/components/CreateCourseModal.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  IconButton,
  Fade,
  Slide,
  Stack,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SchoolIcon from '@mui/icons-material/School';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DynamicPersonalizationForm from './DynamicPersonalizationForm';

// Fonctions API
const getPersonalizationForm = async (courseData) => {
  const { data } = await apiClient.post('/courses/personalization-form', courseData);
  return data;
};

const createCourse = async (courseData) => {
  const { data } = await apiClient.post('/courses/', courseData);
  return data;
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.palette.divider}30`,
    boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
    maxWidth: 700,
    width: '90vw',
    maxHeight: '90vh',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
  borderBottom: `1px solid ${theme.palette.divider}30`,
  padding: theme.spacing(3),
  position: 'relative',
}));

const ModernStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderTopWidth: 2,
    borderRadius: 1,
  },
  '& .MuiStepLabel-iconContainer': {
    '& .MuiSvgIcon-root': {
      borderRadius: '50%',
      border: `2px solid ${theme.palette.divider}`,
      background: theme.palette.background.paper,
      fontSize: '1.5rem',
      transition: 'all 0.3s ease-in-out',
    }
  },
  '& .MuiStep-completed .MuiSvgIcon-root': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    border: 'none',
    color: 'white',
  },
  '& .MuiStep-active .MuiSvgIcon-root': {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    border: 'none',
    color: 'white',
    transform: 'scale(1.1)',
  }
}));

const ModeCard = styled(Box)(({ theme, selected }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}30`,
  background: selected 
    ? `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.main}20)`
    : 'rgba(255, 255, 255, 0.7)',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: `2px solid ${theme.palette.primary.main}50`,
  },
  ...(selected && {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 32px ${theme.palette.primary.main}30`,
  })
}));

const ModelCard = styled(Box)(({ theme, selected }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  border: `2px solid ${selected ? theme.palette.secondary.main : theme.palette.divider}30`,
  background: selected 
    ? `linear-gradient(135deg, ${theme.palette.secondary.main}10, ${theme.palette.secondary.main}20)`
    : 'rgba(255, 255, 255, 0.7)',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    border: `2px solid ${theme.palette.secondary.main}50`,
  },
  ...(selected && {
    transform: 'scale(1.02)',
  })
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateCourseModal = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [courseData, setCourseData] = useState({
    title: '',
    model_choice: 'openai_gpt4o_mini',
    creation_mode: 'full',
    personalization_details: {},
  });
  const [formSchema, setFormSchema] = useState(null);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const formMutation = useMutation({
    mutationFn: getPersonalizationForm,
    onSuccess: (data) => {
      setFormSchema(data);
      if (!data.fields || data.fields.length === 0) {
        setStep(1);
      } else {
        setStep(2);
      }
    }
  });

  const courseCreationMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-courses'] });
      onClose();
      navigate(`/courses/${data.id}`);
    },
  });

  const handleClose = () => {
    if (!formMutation.isPending && !courseCreationMutation.isPending) {
      setStep(0);
      setCourseData({
        title: '',
        model_choice: 'openai_gpt4o_mini',
        creation_mode: 'full',
        personalization_details: {},
      });
      setFormSchema(null);
      onClose();
    }
  };
  
  const handleNextStep = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (courseData.creation_mode === 'adaptive') {
        formMutation.mutate({ title: courseData.title, model_choice: courseData.model_choice });
      } else {
        courseCreationMutation.mutate(courseData);
      }
    } else if (step === 2) {
      courseCreationMutation.mutate(courseData);
    }
  };
  
  const handleBackStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleModeSelect = (mode) => {
    setCourseData({ ...courseData, creation_mode: mode });
  };

  const handleModelSelect = (model) => {
    setCourseData({ ...courseData, model_choice: model });
  };
  
  const steps = ['Configuration', 'Moteur IA', 'Personnalisation', 'Création'];
  const activeSteps = courseData.creation_mode === 'adaptive' ? steps : [steps[0], steps[1], steps[3]];

  const isLoading = formMutation.isPending || courseCreationMutation.isPending;

  const modes = [
    {
      value: 'full',
      title: 'Cours Classique',
      description: 'Un parcours complet de A à Z sur votre sujet',
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      features: ['Structure complète', 'Progression linéaire', 'Création rapide']
    },
    {
      value: 'adaptive',
      title: 'Cours Adaptatif',
      description: 'Un cours personnalisé selon votre niveau et objectifs',
      icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />,
      features: ['Personnalisé', 'Questions ciblées', 'Adapté à vous']
    }
  ];

  const models = [
    {
      value: 'openai_gpt4o_mini',
      name: 'OpenAI GPT-4o Mini',
      description: 'Recommandé - Rapide et efficace',
      badge: 'Recommandé',
      color: 'success'
    },
    {
      value: 'gemini',
      name: 'Google Gemini',
      description: 'Puissant pour les sujets complexes',
      badge: 'Avancé',
      color: 'info'
    },
    {
      value: 'local',
      name: 'Mon Modèle Local',
      description: 'Votre modèle personnel',
      badge: 'Personnalisé',
      color: 'warning'
    }
  ];

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth={false}
    >
      <StyledDialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RocketLaunchIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                ✨ Créer un Nouveau Cours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lancez votre parcours d'apprentissage personnalisé
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </StyledDialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <ModernStepper activeStep={step} sx={{ mb: 4 }}>
          {activeSteps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </ModernStepper>

        <Fade in={true} timeout={500}>
          <Box>
            {/* ÉTAPE 0 : Titre et Mode de création */}
            {step === 0 && (
              <Stack spacing={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Sur quel sujet veux-tu apprendre ?"
                  name="title"
                  value={courseData.title}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Ex: JavaScript, Photoshop, Marketing Digital..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem',
                    }
                  }}
                />

                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Choisissez votre type de cours
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {modes.map((mode) => (
                      <ModeCard
                        key={mode.value}
                        selected={courseData.creation_mode === mode.value}
                        onClick={() => handleModeSelect(mode.value)}
                        sx={{ flex: 1 }}
                      >
                        <Stack spacing={2} alignItems="center" textAlign="center">
                          <Box sx={{ color: 'primary.main' }}>
                            {mode.icon}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {mode.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {mode.description}
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                              {mode.features.map((feature) => (
                                <Chip
                                  key={feature}
                                  label={feature}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </ModeCard>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* ÉTAPE 1 : Choix du Modèle IA */}
            {step === 1 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SmartToyIcon sx={{ mr: 2, color: 'secondary.main', fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Choisissez votre moteur d'IA
                  </Typography>
                </Box>
                
                <Stack spacing={2}>
                  {models.map((model) => (
                    <ModelCard
                      key={model.value}
                      selected={courseData.model_choice === model.value}
                      onClick={() => handleModelSelect(model.value)}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Radio
                          checked={courseData.model_choice === model.value}
                          disabled={isLoading}
                          color="secondary"
                        />
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {model.name}
                            </Typography>
                            <Chip
                              label={model.badge}
                              size="small"
                              color={model.color}
                              variant="outlined"
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </ModelCard>
                  ))}
                </Stack>
              </Box>
            )}

            {/* ÉTAPE 2 : Formulaire de Personnalisation */}
            {step === 2 && courseData.creation_mode === 'adaptive' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  🎯 Personnalisation du cours
                </Typography>
                <DynamicPersonalizationForm 
                  formSchema={formSchema}
                  courseData={courseData}
                  setCourseData={setCourseData}
                />
              </Box>
            )}

            {/* Affichage du chargement */}
            {isLoading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {formMutation.isPending ? "🔍 Analyse du sujet en cours..." : "🚀 Création du cours..."}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cela peut prendre quelques instants
                </Typography>
              </Box>
            )}

            {/* Gestion des erreurs */}
            {(formMutation.isError || courseCreationMutation.isError) && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {formMutation.error?.message || courseCreationMutation.error?.message || "Une erreur est survenue."}
              </Alert>
            )}
          </Box>
        </Fade>

        {/* Boutons de navigation */}
        {!isLoading && (
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              disabled={step === 0}
              onClick={handleBackStep}
              sx={{ borderRadius: 3, px: 3 }}
            >
              Précédent
            </Button>
            <Button
              variant="contained"
              onClick={handleNextStep}
              disabled={!courseData.title.trim()}
              sx={{
                borderRadius: 3,
                px: 4,
                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                }
              }}
            >
              {step === 0 && 'Suivant'}
              {step === 1 && courseData.creation_mode === 'full' && '🚀 Lancer la création'}
              {step === 1 && courseData.creation_mode === 'adaptive' && 'Suivant'}
              {step === 2 && '✨ Créer le cours personnalisé'}
            </Button>
          </Stack>
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default CreateCourseModal;