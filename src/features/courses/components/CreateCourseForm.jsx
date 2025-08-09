// Fichier: src/features/courses/components/CreateCourseForm.jsx (VERSION AVEC CHOIX DU MODÈLE À L'ÉTAPE 2)
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import { Box, Button, TextField, Typography, CircularProgress, Alert, Stepper, Step, StepLabel, Paper, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import DynamicPersonalizationForm from './DynamicPersonalizationForm';

// Fonctions API (inchangées)
const getPersonalizationForm = async (courseData) => {
  const { data } = await apiClient.post('/courses/personalization-form', courseData);
  return data;
};
const createCourse = async (courseData) => {
  const { data } = await apiClient.post('/courses/', courseData);
  return data;
};


const CreateCourseForm = () => {
  const [step, setStep] = useState(0);
  const [courseData, setCourseData] = useState({
    title: '',
    model_choice: 'openai_gpt4o_mini', // On garde une valeur par défaut
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
        setStep(1); // Pas de questions, on passe directement au choix du modèle
      } else {
        setStep(2); // On passe à l'étape de personnalisation
      }
    }
  });

  const courseCreationMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'my-courses'] });
      navigate(`/courses/${data.id}`);
    },
  });
  
  const handleNextStep = () => {
    if (step === 0) { // Après titre et mode
      setStep(1);
    } else if (step === 1) { // Après choix du modèle
      if (courseData.creation_mode === 'adaptive') {
        formMutation.mutate({ title: courseData.title, model_choice: courseData.model_choice });
      } else {
        courseCreationMutation.mutate(courseData);
      }
    } else if (step === 2) { // Après personnalisation
      courseCreationMutation.mutate(courseData);
    }
  };
  
  const handleBackStep = () => {
      setStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };
  
  const steps = ['Configuration', 'Moteur IA', 'Personnalisation', 'Création'];
  // On ajuste le nombre d'étapes si le cours n'est pas adaptatif
  const activeSteps = courseData.creation_mode === 'adaptive' ? steps : [steps[0], steps[1], steps[3]];

  const isLoading = formMutation.isPending || courseCreationMutation.isPending;

  return (
    <Paper component="form" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h6" gutterBottom>Lancer un nouveau cours</Typography>
      <Stepper activeStep={step} sx={{ my: 3 }}>
        {activeSteps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* ÉTAPE 0 : Titre et Mode de création */}
      {step === 0 && (
        <Box>
          <TextField
            margin="normal" required fullWidth name="title" label="Sur quel sujet veux-tu apprendre ?"
            value={courseData.title} onChange={handleChange} autoFocus disabled={isLoading}
          />
          <FormControl component="fieldset" margin="normal">
            <FormLabel>Type de cours</FormLabel>
            <RadioGroup row name="creation_mode" value={courseData.creation_mode} onChange={handleChange}>
              <FormControlLabel value="full" control={<Radio disabled={isLoading} />} label="De A à Z (Classique)" />
              <FormControlLabel value="adaptive" control={<Radio disabled={isLoading} />} label="Adapté à mon niveau" />
            </RadioGroup>
          </FormControl>
        </Box>
      )}
      
      {/* ÉTAPE 1 : Choix du Modèle IA */}
      {step === 1 && (
        <FormControl component="fieldset" margin="normal">
          <FormLabel component="legend">Choisir le moteur d'IA pour la création</FormLabel>
          <RadioGroup row name="model_choice" value={courseData.model_choice} onChange={handleChange}>
            <FormControlLabel value="openai_gpt4o_mini" control={<Radio disabled={isLoading} />} label="OpenAI GPT-4o Mini (Recommandé)" />
            <FormControlLabel value="gemini" control={<Radio disabled={isLoading} />} label="Google Gemini" />
            <FormControlLabel value="local" control={<Radio disabled={isLoading} />} label="Mon Modèle (Local)" />
          </RadioGroup>
        </FormControl>
      )}

      {/* ÉTAPE 2 : Formulaire de Personnalisation Dynamique */}
      {step === 2 && courseData.creation_mode === 'adaptive' && (
        <DynamicPersonalizationForm 
          formSchema={formSchema}
          courseData={courseData}
          setCourseData={setCourseData} 
        />
      )}
      
      {/* Affichage du chargement */}
      {isLoading && (
        <Box sx={{ textAlign: 'center', my: 2 }}>
            <CircularProgress />
            <Typography>
              {formMutation.isPending ? "Analyse du sujet..." : "Création du cours..."}
            </Typography>
        </Box>
      )}
      
      {/* Gestion des erreurs */}
      {(formMutation.isError || courseCreationMutation.isError) && 
        <Alert severity="error" sx={{ mt: 2 }}>
            {formMutation.error?.message || courseCreationMutation.error?.message || "Une erreur est survenue."}
        </Alert>
      }
      
      {/* Boutons de navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button disabled={step === 0 || isLoading} onClick={handleBackStep}>
          Précédent
        </Button>
        {!isLoading && (
          <Button type="submit">
            {step === 0 && 'Suivant'}
            {step === 1 && courseData.creation_mode === 'full' && 'Lancer la création'}
            {step === 1 && courseData.creation_mode === 'adaptive' && 'Suivant'}
            {step === 2 && 'Créer le cours personnalisé'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};
export default CreateCourseForm;