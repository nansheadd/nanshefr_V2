import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, Typography, Select, FormControl, InputLabel } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const shuffle = (array) => {
  const items = [...array];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const MatchingAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const prompt = content.prompt || content.instruction || atom?.title;
  const pairs = useMemo(() => {
    if (Array.isArray(content.pairs)) return content.pairs;
    if (Array.isArray(content.left) && Array.isArray(content.right)) {
      return content.left.map((left, index) => ({ left, right: content.right[index] }));
    }
    if (content.mapping && typeof content.mapping === 'object') {
      return Object.entries(content.mapping).map(([left, right]) => ({ left, right }));
    }
    return [];
  }, [content.pairs, content.left, content.right, content.mapping]);

  const options = useMemo(() => shuffle(pairs.map((pair) => pair.right)), [pairs]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const { submitAnswer, resetProgress, logAnswerMutation, resetMutation, isLoading } = useAtomAnswer({
    atom,
    onReward,
    onResult: (data) => setResult(data),
    onReset: () => {
      setAnswers({});
      setResult(null);
    },
  });

  const completed = atom?.progress_status === 'completed';
  const showReset = completed || Boolean(result?.is_correct);
  const disabled = showReset;

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (logAnswerMutation.isPending) return;
    const isCorrect = pairs.every((pair, index) => {
      const selected = answers[index];
      return selected && selected === pair.right;
    });
    submitAnswer(isCorrect, { associations: answers });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {prompt}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {pairs.map((pair, index) => (
          <Paper key={pair.left} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ flex: 1 }}>{pair.left}</Typography>
            <FormControl sx={{ minWidth: 220 }} size="small" disabled={disabled || isLoading}>
              <InputLabel id={`matching-${atom.id}-${index}`}>Associer</InputLabel>
              <Select
                labelId={`matching-${atom.id}-${index}`}
                value={answers[index] || ''}
                label="Associer"
                onChange={(event) => handleChange(index, event.target.value)}
              >
                {options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || isLoading || pairs.some((_, index) => !answers[index])}
        >
          Valider
        </Button>
        {showReset && (
          <Button variant="outlined" onClick={resetProgress} disabled={resetMutation.isPending}>
            Réinitialiser
          </Button>
        )}
      </Stack>

      {result && (
        <Alert severity={result.is_correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.feedback || (result.is_correct ? 'Bravo pour ces associations !' : 'Certaines associations sont incorrectes.')}
        </Alert>
      )}
    </Box>
  );
};

export default MatchingAtom;
