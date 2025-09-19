import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, Divider, Chip, Paper, Button, Alert, Stack, TextField } from '@mui/material';
import {
  FormatQuote as QuoteIcon,
  Code as CodeIcon,
  FiberManualRecord as BulletIcon
} from '@mui/icons-material';
import apiClient from '../../../../api/axiosConfig';

const InlineCode = ({ children, ...props }) => (
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
  >
    {children}
  </Box>
);

const MarkdownCodeBlock = ({ className = '', children }) => {
  const language = className?.replace('language-', '') || 'texte';
  const normalizedLanguage = language.toLowerCase();
  const isPython = normalizedLanguage.includes('python');
  const initialCode = useMemo(() => {
    const raw = React.Children.toArray(children).join('');
    return raw.replace(/\n$/, '');
  }, [children]);

  const [code, setCode] = useState(initialCode);
  const [stdin, setStdin] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setStdin('');
    setResult(null);
    setError(null);
    setCopied(false);
  }, [initialCode]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const executeMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/programming/execute', payload).then((res) => res.data),
    onSuccess: (data) => {
      setResult({
        stdout: data?.stdout ?? '',
        stderr: data?.stderr ?? '',
        exit_code: data?.exit_code ?? 0,
        timed_out: Boolean(data?.timed_out ?? data?.timeout)
      });
      setError(null);
    },
    onError: (err) => {
      setError(err?.response?.data?.detail || "Impossible d'exécuter ce code.");
      setResult(null);
    }
  });

  const handleRun = () => {
    if (!isPython) {
      setError("L'exécution intégrée est disponible uniquement pour Python dans cette leçon.");
      return;
    }
    setError(null);
    setResult(null);
    executeMutation.mutate({ language: 'python', code, stdin });
  };

  const handleReset = () => {
    setCode(initialCode);
    setStdin('');
    setResult(null);
    setError(null);
  };

  const handleCopy = async () => {
    const textToCopy = isPython ? code : initialCode;
    try {
      setError(null);
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
      } else {
        setError("La copie n'est pas supportée dans cet environnement.");
        setCopied(false);
      }
    } catch {
      setError("Impossible de copier le code.");
      setCopied(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        my: 2,
        borderRadius: 2,
        bgcolor: 'grey.900',
        color: '#f8f8f2',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CodeIcon sx={{ fontSize: 20, color: '#f8f8f2' }} />
          <Typography variant="subtitle2" sx={{ color: '#f8f8f2' }}>
            {isPython ? 'Atelier de code' : 'Exemple de code'}
          </Typography>
          <Chip
            label={language}
            size="small"
            sx={{ bgcolor: 'grey.800', color: '#f8f8f2', fontWeight: 600 }}
          />
          {copied && (
            <Typography variant="caption" sx={{ color: 'success.main' }}>
              Copié !
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleCopy}
            sx={{ borderColor: '#4b5563', color: '#f8f8f2', textTransform: 'none' }}
          >
            Copier
          </Button>
          {isPython && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleReset}
              disabled={code === initialCode && stdin === '' && !result && !error}
              sx={{ borderColor: '#4b5563', color: '#f8f8f2', textTransform: 'none' }}
            >
              Réinitialiser
            </Button>
          )}
        </Stack>
      </Stack>

      {isPython ? (
        <>
          <TextField
            value={code}
            onChange={(e) => setCode(e.target.value)}
            multiline
            minRows={8}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'Fira Code, monospace',
                bgcolor: 'grey.950',
                color: '#f8f8f2'
              },
              '& fieldset': {
                borderColor: '#4b5563'
              },
              '&:hover fieldset': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.light'
              }
            }}
          />
          <TextField
            label="Entrée standard (facultatif)"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            variant="outlined"
            sx={{
              mt: 2,
              '& .MuiInputBase-root': {
                bgcolor: 'grey.950',
                color: '#f8f8f2'
              },
              '& fieldset': {
                borderColor: '#4b5563'
              },
              '&:hover fieldset': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.light'
              }
            }}
          />
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleRun}
              disabled={executeMutation.isPending}
            >
              {executeMutation.isPending ? 'Exécution...' : 'Exécuter'}
            </Button>
            {result?.timed_out && (
              <Typography variant="caption" sx={{ color: 'warning.light' }}>
                L'exécution a dépassé la limite de temps.
              </Typography>
            )}
          </Stack>
        </>
      ) : (
        <Box
          component="pre"
          sx={{
            bgcolor: 'grey.950',
            p: 2,
            borderRadius: 2,
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: '#f8f8f2',
            overflowX: 'auto',
            whiteSpace: 'pre'
          }}
        >
          {initialCode || '// Exemple non fourni'}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#e5e7eb' }}>
            Résultat (code de sortie {result.exit_code})
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 1,
              bgcolor: 'grey.950',
              p: 2,
              borderRadius: 2,
              fontFamily: 'Fira Code, monospace',
              color: '#f8f8f2',
              whiteSpace: 'pre-wrap'
            }}
          >
            {result.stdout || '<aucune sortie>'}
          </Box>
          {result.stderr && (
            <Box
              component="pre"
              sx={{
                mt: 1,
                bgcolor: '#fee2e2',
                p: 2,
                borderRadius: 2,
                fontFamily: 'Fira Code, monospace',
                color: '#b91c1c',
                whiteSpace: 'pre-wrap'
              }}
            >
              {result.stderr}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

const markdownComponents = {
  h1: (props) => (
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
  
  h2: (props) => (
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
  
  h3: (props) => (
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
  
  p: (props) => (
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
  
  li: (props) => (
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
  
  ul: (props) => (
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
  
  blockquote: (props) => (
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

  pre: (props) => <>{props.children}</>,

  code: ({ inline, className, children, ...props }) => {
    const content = React.Children.toArray(children).join('');
    const isInline = inline ?? !content.includes('\n');

    if (isInline) {
      return (
        <InlineCode className={className} {...props}>
          {children}
        </InlineCode>
      );
    }

    return <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>;
  },

  hr: () => (
    <Divider
      sx={{
        my: 4,
        background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
      }} 
    />
  ),
  
  strong: (props) => (
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
  
  em: (props) => (
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
      data-coach-section="lesson"
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
