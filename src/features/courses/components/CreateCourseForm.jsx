import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';
import { useAuth } from '../../../hooks/useAuth';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';

const createCourse = async (courseData) => {
  const { data } = await apiClient.post('/courses/', courseData);
  return data;
};

const CreateCourseForm = () => {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate(`/courses/${data.id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ title });
  };

  if (!isAuthenticated) return null;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Lancer un nouveau cours</Typography>
      <TextField
        margin="normal" required fullWidth id="title" label="Sur quel sujet veux-tu apprendre ?"
        value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={mutation.isPending}>
        {mutation.isPending ? <CircularProgress size={24} /> : "Analyser le sujet & Créer le plan"}
      </Button>
      {mutation.isError && <Alert severity="error" sx={{ mt: 2 }}>{mutation.error.message}</Alert>}
    </Box>
  );
};

export default CreateCourseForm;