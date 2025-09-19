import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import apiClient from '../../../../api/axiosConfig';

const LiveCodeExecutorAtom = ({ atom }) => {
  if (!atom?.content) {
    return <Alert severity="warning">Session interactive indisponible.</Alert>;
  }

  const { language = 'python', instructions, starter_code: starterCode = '', hints = [], suggested_experiments: experiments = [] } = atom.content;
  const [code, setCode] = useState(starterCode);
  const [stdin, setStdin] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const executeMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/programming/execute', payload).then((res) => res.data),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err) => {
      setError(err?.response?.data?.detail || "Impossible d'exécuter ce code.");
      setResult(null);
    },
  });

  const handleRun = () => {
    if (!language || !language.toLowerCase().includes('python')) {
      setError("L'exécution intégrée est disponible uniquement pour Python pour le moment.");
      setResult(null);
      return;
    }
    setError(null);
    executeMutation.mutate({ language, code, stdin });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <TerminalIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>
          Atelier interactif
        </Typography>
        <Chip label={language} size="small" />
      </Stack>

      {instructions && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {instructions}
        </Typography>
      )}

      <TextField
        label="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        multiline
        minRows={10}
        fullWidth
        sx={{ fontFamily: 'Fira Code, monospace', mb: 2 }}
      />

      <TextField
        label="Entrée standard (facultatif)"
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        multiline
        minRows={3}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button variant="contained" onClick={handleRun} disabled={executeMutation.isLoading}>
        Exécuter
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Résultat (code de sortie {result.exit_code})
          </Typography>
          <Box component="pre" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 2, mt: 1 }}>
            {result.stdout || '<aucune sortie>'}
          </Box>
          {result.stderr && (
            <Box component="pre" sx={{ bgcolor: '#fee2e2', p: 2, borderRadius: 2, mt: 1, color: '#b91c1c' }}>
              {result.stderr}
            </Box>
          )}
        </Box>
      )}

      {hints.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2">Indications</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {hints.map((hint, index) => (
              <Chip key={index} label={hint} variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      {experiments.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2">Pour aller plus loin</Typography>
          <ul>
            {experiments.map((exp, index) => (
              <li key={index}>
                <Typography variant="body2">{exp}</Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Paper>
  );
};

export default LiveCodeExecutorAtom;
