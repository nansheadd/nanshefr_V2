// Fichier: src/features/courses/components/CreateCourseForm.jsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

// La fonction qui envoie la requête de création à l'API
const createCourse = async ({ courseData, token }) => {
  const { data } = await apiClient.post('/courses/', courseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const CreateCourseForm = () => {
  const [title, setTitle] = useState('');
  const [courseType, setCourseType] = useState('philosophy');
  const token = useAuthStore((state) => state.token);

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      console.log('Cours créé avec succès:', data);
      // Ici, on pourrait rediriger vers la page du nouveau cours, par exemple
      // navigate(`/courses/${data.id}`);
      alert(`Cours "${data.title}" créé avec succès !`);
    },
    onError: (error) => {
      console.error('Erreur lors de la création du cours:', error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const courseData = {
      title,
      course_type: courseType,
      description: `Un cours sur ${title}`, // On génère une description simple pour l'instant
    };
    mutation.mutate({ courseData, token });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}
    >
      <Typography variant="h6" gutterBottom>
        Générer un nouveau cours
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="title"
        label="Sujet du cours"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="course-type-label">Type de cours</InputLabel>
        <Select
          labelId="course-type-label"
          id="course-type"
          value={courseType}
          label="Type de cours"
          onChange={(e) => setCourseType(e.target.value)}
        >
          <MenuItem value="philosophy">Philosophie</MenuItem>
          <MenuItem value="math">Mathématiques</MenuItem>
          <MenuItem value="language">Langue</MenuItem>
          <MenuItem value="strategy_game">Jeu de Stratégie</MenuItem>
        </Select>
      </FormControl>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? <CircularProgress size={24} /> : 'Générer le plan'}
      </Button>

      {mutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {mutation.error.message}
        </Alert>
      )}
    </Box>
  );
};

export default CreateCourseForm;