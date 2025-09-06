import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const LessonDisplay = ({ content }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Leçon : Introduction
      </Typography>
      <Box sx={{ '& h1': { typography: 'h4' }, '& h2': { typography: 'h5' }, '& p': { typography: 'body1' } }}>
        <ReactMarkdown>{content.lesson_text}</ReactMarkdown>
      </Box>
    </Paper>
  );
};

export default LessonDisplay;