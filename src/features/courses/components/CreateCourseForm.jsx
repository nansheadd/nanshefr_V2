// Fichier: src/features/courses/components/CreateCourseForm.jsx (CORRIGÉ)
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import useAuthStore from '../../../store/authStore';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';

// La fonction API ne change pas de signature pour le moment
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
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      console.log('Cours créé avec succès:', data);
      navigate(`/courses/${data.id}`);
    },
    onError: (error) => {
      console.error('Erreur lors de la création du cours:', error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // On n'envoie que le titre ! Le backend s'occupe du reste.
    const courseData = { title };
    mutation.mutate({ courseData, token });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lancer un nouveau cours
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="title"
        label="Sur quel sujet veux-tu apprendre ?"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={mutation.isPending}>
        {mutation.isPending ? <CircularProgress size={24} /> : "Analyser le sujet & Créer le plan"}
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