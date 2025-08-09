import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Button, Typography, LinearProgress, Paper, Stack } from '@mui/material';

const fetchCourseStats = async (courseId) => {
  const { data } = await apiClient.get(`/users/me/performance/${courseId}`);
  return data;
};

const CourseStats = ({ courseId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['courseStats', courseId],
    queryFn: () => fetchCourseStats(courseId),
  });

  if (isLoading) return <Typography>Chargement des statistiques...</Typography>;
  if (!stats || stats.length === 0) {
    return <Typography>Commencez les exercices pour voir vos statistiques !</Typography>;
  }

  return (
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6" gutterBottom>Ma Maîtrise des Sujets</Typography>
      <Stack spacing={2}>
        {stats.map((stat) => (
          <Box key={stat.topic_category}>
            <Typography variant="body2">{stat.topic_category}</Typography>
            <LinearProgress 
              variant="determinate" 
              value={stat.mastery_score * 100} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="caption" color="text.secondary">
              Maîtrise : {Math.round(stat.mastery_score * 100)}%
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default CourseStats;