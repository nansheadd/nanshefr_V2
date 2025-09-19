import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import apiClient from '../../../../api/axiosConfig';

const CodeChallengeAtom = ({ atom }) => {
  const queryClient = useQueryClient();
  const [code, setCode] = useState(atom?.content?.starter_code || '');
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!atom?.content) {
    return <Alert severity="warning">Challenge indisponible.</Alert>;
  }

  const { title, description, sample_tests: sampleTests = [], language, hints = [] } = atom.content;

  const submitMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/progress/log-answer', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsule'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['learningSession'], exact: false });
      setInfo({ severity: 'success', message: 'Soumission enregistrée !' });
    },
    onError: (err) => {
      const message = err?.response?.data?.detail || "Impossible d'enregistrer votre solution.";
      setInfo({ severity: 'error', message });
    },
    onSettled: () => setSubmitting(false),
  });

  const handleSubmit = () => {
    setSubmitting(true);
    submitMutation.mutate({
      atom_id: atom.id,
      is_correct: true,
      answer: {
        language,
        code,
        samples: sampleTests,
      },
    });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title || 'Challenge de code'}
        </Typography>
        {language && <Chip label={language} size="small" color="primary" />}
      </Stack>

      {description && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      {info && (
        <Alert severity={info.severity} sx={{ mb: 2 }} onClose={() => setInfo(null)}>
          {info.message}
        </Alert>
      )}

      <TextField
        label="Votre solution"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        multiline
        minRows={8}
        fullWidth
        sx={{ fontFamily: 'Fira Code, monospace' }}
      />

      {sampleTests.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Tests d'exemple
          </Typography>
          {sampleTests.map((test, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Entrée
              </Typography>
              <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>{test.input || '—'}</Box>
              <Typography variant="caption" color="text.secondary">
                Sortie attendue
              </Typography>
              <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>{test.output || '—'}</Box>
            </Paper>
          ))}
        </Box>
      )}

      {hints.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Indices
          </Typography>
          <Stack spacing={1}>
            {hints.map((hint, index) => (
              <Chip key={index} icon={<CheckCircleIcon />} label={hint} variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Button
        variant="contained"
        startIcon={<PlayArrowIcon />}
        onClick={handleSubmit}
        disabled={submitting}
      >
        Soumettre ma solution
      </Button>
    </Paper>
  );
};

export default CodeChallengeAtom;
