import React, { useEffect, useRef, useState } from 'react';
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

const CodeChallengeAtom = ({ atom, onReward }) => {
  const queryClient = useQueryClient();
  const safeAtom = atom ?? {};
  const [code, setCode] = useState(safeAtom?.content?.starter_code || '');
  const [info, setInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [testsSummary, setTestsSummary] = useState(null);
  const [testResults, setTestResults] = useState([]);

  const progressStatus = safeAtom?.progress_status || 'not_started';
  const rewardRef = useRef(progressStatus === 'completed');

  useEffect(() => {
    rewardRef.current = progressStatus === 'completed';
  }, [progressStatus]);

  const content = safeAtom.content ?? {};
  const { title, description, sample_tests: sampleTests = [], language, hints = [] } = content;
  const hasContent = Boolean(atom?.content);

  const submitMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/progress/log-answer', payload).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['capsule'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['learningSession'], exact: false });

      const samplesCount = variables?.answer?.samples?.length ?? 0;
      const testsMessage = samplesCount === 0
        ? "Aucun test d'exemple fourni."
        : variables?.is_correct
          ? "Tous les tests d'exemple ont réussi."
          : "Certains tests d'exemple ont échoué.";

      setInfo({
        severity: variables?.is_correct ? 'success' : 'warning',
        message: `${testsMessage} Soumission enregistrée !`,
      });

      if (variables?.is_correct) {
        if (!rewardRef.current) {
          onReward?.({ xp: data?.xp_awarded });
        }
        rewardRef.current = true;
      }
    },
    onError: (err) => {
      const message = err?.response?.data?.detail || "Impossible d'enregistrer votre solution.";
      setInfo({ severity: 'error', message });
    },
    onSettled: () => setSubmitting(false),
  });

  const normalizeOutput = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value.replace(/\r\n/g, '\n').trimEnd();
    }
    try {
      return String(value).replace(/\r\n/g, '\n').trimEnd();
    } catch {
      return '';
    }
  };

  const handleSubmit = async () => {
    if (!language || !language.toLowerCase().includes('python')) {
      setInfo({
        severity: 'warning',
        message: "L'exécution intégrée est disponible uniquement pour Python pour le moment.",
      });
      return;
    }

    setSubmitting(true);
    setInfo({ severity: 'info', message: "Exécution des tests d'exemple..." });
    setTestsSummary(null);
    setTestResults([]);

    let results = [];

    const hasSampleTests = sampleTests.length > 0;

    if (hasSampleTests) {
      try {
        results = await Promise.all(
          sampleTests.map(async (test) => {
            const rawInput = test?.input ?? '';
            const stdin =
              typeof rawInput === 'string'
                ? rawInput
                : rawInput === null || rawInput === undefined
                  ? ''
                  : JSON.stringify(rawInput);
            const response = await apiClient
              .post('/programming/execute', { language, code, stdin })
              .then((res) => res.data);

            const rawStdout = response?.stdout ?? '';
            const stdout =
              typeof rawStdout === 'string'
                ? rawStdout
                : rawStdout === null || rawStdout === undefined
                  ? ''
                  : String(rawStdout);
            const rawStderr = response?.stderr ?? '';
            const stderr =
              typeof rawStderr === 'string'
                ? rawStderr
                : rawStderr === null || rawStderr === undefined
                  ? ''
                  : String(rawStderr);
            const exitCode = response?.exit_code;
            const timedOut = Boolean(response?.timed_out ?? response?.timeout);

            const rawExpected = test?.output ?? '';
            const expected =
              typeof rawExpected === 'string'
                ? rawExpected
                : rawExpected === null || rawExpected === undefined
                  ? ''
                  : JSON.stringify(rawExpected);
            const normalizedExpected = normalizeOutput(expected);
            const normalizedStdout = normalizeOutput(stdout);

            const executionError = Boolean(stderr) || timedOut || (typeof exitCode === 'number' && exitCode !== 0);
            const passed = !executionError && normalizedStdout === normalizedExpected;

            return {
              input: stdin,
              expected,
              output: stdout,
              stderr,
              exitCode,
              timedOut,
              passed,
            };
          }),
        );
      } catch (err) {
        const message = err?.response?.data?.detail || "Impossible d'exécuter ce code.";
        setInfo({ severity: 'error', message });
        setSubmitting(false);
        return;
      }
    }

    setTestResults(results);

    const isCorrect = hasSampleTests ? results.every((res) => res.passed) : true;

    if (hasSampleTests) {
      setTestsSummary({
        severity: isCorrect ? 'success' : 'error',
        message: isCorrect
          ? "Tous les tests d'exemple ont réussi !"
          : "Certains tests d'exemple ont échoué. Consultez les résultats ci-dessous.",
      });
    } else {
      setTestsSummary({ severity: 'info', message: "Aucun test d'exemple fourni." });
    }

    try {
      await submitMutation.mutateAsync({
        atom_id: safeAtom.id,
        is_correct: isCorrect,
        answer: {
          language,
          code,
          samples: sampleTests,
        },
      });
    } catch {
      // L'erreur est déjà gérée par la mutation via onError
    }
  };

  if (!hasContent) {
    return <Alert severity="warning">Challenge indisponible.</Alert>;
  }

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

      {testsSummary && (
        <Alert severity={testsSummary.severity} sx={{ mb: 2 }} onClose={() => setTestsSummary(null)}>
          {testsSummary.message}
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

      {testResults.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Résultats des tests d'exemple
          </Typography>
          <Stack spacing={2}>
            {testResults.map((result, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor: result.passed ? 'success.light' : 'error.light',
                  borderLeftWidth: 4,
                  borderLeftStyle: 'solid',
                  borderLeftColor: result.passed ? 'success.main' : 'error.main',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label={result.passed ? 'Réussi' : 'Échec'}
                    color={result.passed ? 'success' : 'error'}
                    size="small"
                  />
                  <Typography variant="body2" fontWeight={600}>
                    Test #{index + 1}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Entrée
                </Typography>
                <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 1 }}>
                  {result.input || '—'}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Sortie attendue
                </Typography>
                <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 1 }}>
                  {result.expected || '—'}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Sortie obtenue
                </Typography>
                <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, mb: 1 }}>
                  {result.output || '—'}
                </Box>
                {result.stderr && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      Sortie d'erreur
                    </Typography>
                    <Box component="pre" sx={{ bgcolor: '#fee2e2', p: 1, borderRadius: 1, color: '#b91c1c', mb: 1 }}>
                      {result.stderr}
                    </Box>
                  </>
                )}
                {typeof result.exitCode === 'number' && (
                  <Typography variant="caption" color="text.secondary">
                    Code de sortie : {result.exitCode}
                  </Typography>
                )}
                {result.timedOut && (
                  <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                    Temps limite dépassé
                  </Typography>
                )}
              </Paper>
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
