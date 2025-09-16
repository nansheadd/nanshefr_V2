import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, Divider, Chip, Paper, Button, Alert, Stack } from '@mui/material';
import { 
  FormatQuote as QuoteIcon,
  Code as CodeIcon,
  FiberManualRecord as BulletIcon 
} from '@mui/icons-material';
import apiClient from '../../../../api/axiosConfig';

const markdownComponents = {
  h1: ({ node, ...props }) => (
    <Typography 
      variant="h4" 
      gutterBottom 
      sx={{ 
        fontWeight: 700,
        color: 'primary.main',
        mb: 3,
        pb: 1,
        borderBottom: '3px solid',
        borderColor: 'primary.light',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -3,
          left: 0,
          width: 60,
          height: 3,
          bgcolor: 'primary.main',
          borderRadius: 2
        }
      }} 
      {...props} 
    />
  ),
  
  h2: ({ node, ...props }) => (
    <Typography 
      variant="h5" 
      gutterBottom 
      sx={{ 
        fontWeight: 600,
        color: 'text.primary',
        mt: 4,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '"▎"',
          color: 'primary.main',
          mr: 1,
          fontSize: '1.5rem'
        }
      }} 
      {...props} 
    />
  ),
  
  h3: ({ node, ...props }) => (
    <Typography 
      variant="h6" 
      gutterBottom 
      sx={{ 
        fontWeight: 600,
        color: 'text.secondary',
        mt: 3,
        mb: 1.5
      }} 
      {...props} 
    />
  ),
  
  p: ({ node, ...props }) => (
    <Typography 
      variant="body1" 
      paragraph 
      sx={{ 
        lineHeight: 1.8,
        color: 'text.primary',
        mb: 2.5,
        fontSize: '1.05rem'
      }} 
      {...props} 
    />
  ),
  
  li: ({ node, ...props }) => (
    <Box 
      component="li" 
      sx={{ 
        mb: 1.5,
        ml: -1,
        display: 'flex',
        alignItems: 'flex-start'
      }}
    >
      <BulletIcon 
        sx={{ 
          fontSize: 8, 
          color: 'primary.main', 
          mt: 1,
          mr: 1.5,
          flexShrink: 0
        }} 
      />
      <Typography 
        variant="body1" 
        component="span" 
        sx={{ lineHeight: 1.8 }}
        {...props} 
      />
    </Box>
  ),
  
  ul: ({ node, ...props }) => (
    <Box 
      component="ul" 
      sx={{ 
        listStyle: 'none',
        pl: 2,
        mb: 3
      }} 
      {...props} 
    />
  ),
  
  blockquote: ({ node, ...props }) => (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        p: 3,
        my: 3,
        borderLeft: '4px solid',
        borderColor: 'primary.main',
        bgcolor: 'primary.lighter',
        background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
        '& p': {
          mb: 0,
          fontStyle: 'italic',
          color: 'text.secondary'
        }
      }}
    >
      <QuoteIcon 
        sx={{ 
          position: 'absolute',
          top: 10,
          left: 10,
          fontSize: 40,
          color: 'primary.main',
          opacity: 0.1
        }} 
      />
      <Box sx={{ pl: 2 }} {...props} />
    </Paper>
  ),
  
  code: ({ node, inline, ...props }) => 
    inline ? (
      <Box
        component="code"
        sx={{
          px: 1,
          py: 0.5,
          mx: 0.5,
          borderRadius: 1,
          bgcolor: 'grey.100',
          color: 'secondary.main',
          fontFamily: 'monospace',
          fontSize: '0.9em',
          border: '1px solid',
          borderColor: 'grey.300'
        }}
        {...props}
      />
    ) : (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          my: 2,
          borderRadius: 2,
          bgcolor: 'grey.900',
          overflow: 'auto',
          position: 'relative',
          '& code': {
            color: '#f8f8f2',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: 1.6
          }
        }}
      >
        <CodeIcon 
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: 20,
            color: 'grey.600'
          }} 
        />
        <code {...props} />
      </Paper>
    ),
  
  hr: () => (
    <Divider 
      sx={{ 
        my: 4,
        background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
      }} 
    />
  ),
  
  strong: ({ node, ...props }) => (
    <Box
      component="strong"
      sx={{
        fontWeight: 700,
        color: 'primary.dark',
        background: 'linear-gradient(180deg, transparent 60%, rgba(102,126,234,0.2) 60%)'
      }}
      {...props}
    />
  ),
  
  em: ({ node, ...props }) => (
    <Box
      component="em"
      sx={{
        fontStyle: 'italic',
        color: 'text.secondary'
      }}
      {...props}
    />
  ),
};

const LessonAtom = ({ atom }) => {
  const { content = {}, is_locked: isLocked, progress_status: progressStatus } = atom || {};
  const queryClient = useQueryClient();
  const [info, setInfo] = useState(null);
  const [localStatus, setLocalStatus] = useState(progressStatus);

  useEffect(() => {
    setLocalStatus(progressStatus);
  }, [progressStatus]);

  const completeMutation = useMutation({
    mutationFn: () => apiClient.post(`/progress/atom/${atom.id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsule'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['learningSession'], exact: false });
      setLocalStatus('completed');
      setInfo({ severity: 'success', message: 'Leçon validée !' });
    },
    onError: (err) => {
      setInfo({ severity: 'error', message: err?.response?.data?.detail || "Impossible de valider la leçon." });
    }
  });

  const resetMutation = useMutation({
    mutationFn: () => apiClient.post(`/progress/atom/${atom.id}/reset`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsule'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['learningSession'], exact: false });
      setLocalStatus('not_started');
      setInfo({ severity: 'info', message: 'Leçon réinitialisée. Vous pouvez recommencer.' });
    },
    onError: (err) => {
      setInfo({ severity: 'error', message: err?.response?.data?.detail || "Impossible de réinitialiser la leçon." });
    }
  });

  const completed = localStatus === 'completed';
  const lessonText = content.lesson_text || content.text || '';

  if (!lessonText) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: 'grey.50',
          border: '2px dashed',
          borderColor: 'grey.300'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Contenu de la leçon non disponible.
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        position: 'relative',
        '& > *:first-of-type': {
          mt: 0
        },
        '& > *:last-child': {
          mb: 0
        }
      }}
    >
      {/* Decorative element */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
          zIndex: -1
        }}
      />
      
      {info && (
        <Alert severity={info.severity} sx={{ mb: 2 }} onClose={() => setInfo(null)}>
          {info.message}
        </Alert>
      )}

      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Terminez les activités précédentes pour déverrouiller cette leçon.
        </Alert>
      )}

      <ReactMarkdown components={markdownComponents}>
        {lessonText}
      </ReactMarkdown>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          disabled={isLocked || completed || completeMutation.isLoading}
          onClick={() => completeMutation.mutate()}
        >
          {completed ? 'Leçon validée' : 'Marquer comme lue'}
        </Button>
        {!isLocked && (completed || localStatus === 'in_progress') && (
          <Button
            variant="outlined"
            disabled={resetMutation.isLoading}
            onClick={() => resetMutation.mutate()}
          >
            Réinitialiser
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default LessonAtom;
