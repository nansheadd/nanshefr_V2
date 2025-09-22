import React, { useMemo, useState } from 'react';
import { Box, Button, Stack, TextField, Typography, Alert } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const normalize = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const extractSegments = (text) => {
  if (!text) {
    return { segments: [], blankCount: 0 };
  }
  const regex = /\{\{(\d+)\}\}/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  const seen = new Set();
  while ((match = regex.exec(text)) !== null) {
    const index = match.index;
    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    const blankIndex = Number(match[1]) - 1;
    seen.add(blankIndex);
    parts.push({ type: 'blank', index: blankIndex });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return { segments: parts, blankCount: seen.size || parts.filter((p) => p.type === 'blank').length };
};

const FillInBlankAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const prompt = content.prompt || content.instruction || atom?.title;
  const baseText = content.text || content.template || '';
  const blanks = useMemo(() => {
    if (Array.isArray(content.blanks)) {
      return content.blanks;
    }
    if (Array.isArray(content.answers)) {
      return content.answers.map((answer) => ({ answers: Array.isArray(answer) ? answer : [answer] }));
    }
    return [];
  }, [content.blanks, content.answers]);

  const { segments, blankCount } = extractSegments(baseText);
  const totalBlanks = blankCount || blanks.length || (content.blank_count ?? 0);
  const [values, setValues] = useState(() => Array.from({ length: totalBlanks }, () => ''));
  const [result, setResult] = useState(null);

  const { submitAnswer, resetProgress, logAnswerMutation, resetMutation, isLoading } = useAtomAnswer({
    atom,
    onReward,
    onResult: (data) => setResult(data),
    onReset: () => {
      setValues(Array.from({ length: totalBlanks }, () => ''));
      setResult(null);
    },
  });

  const completed = atom?.progress_status === 'completed';
  const showReset = completed || Boolean(result?.is_correct);
  const disabled = showReset;

  const handleChange = (index, value) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = () => {
    if (logAnswerMutation.isPending) return;
    const answersToCheck = blanks.length ? blanks : values.map(() => null);
    const isCorrect = values.every((value, idx) => {
      const expected = answersToCheck[idx];
      if (!expected) return Boolean(value.trim());
      const acceptable = Array.isArray(expected.answers)
        ? expected.answers
        : Array.isArray(expected)
        ? expected
        : [expected.answer || expected];
      return acceptable.some((ans) => normalize(ans) === normalize(value));
    });

    submitAnswer(isCorrect, { filled_blanks: values });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {prompt}
      </Typography>

      <Box sx={{ mt: 2, mb: 3 }}>
        {segments.length ? (
          <Typography component="span" sx={{ display: 'inline', whiteSpace: 'pre-wrap' }}>
            {segments.map((segment, idx) => {
              if (segment.type === 'text') {
                return (
                  <Typography key={`text-${idx}`} component="span" sx={{ display: 'inline' }}>
                    {segment.value}
                  </Typography>
                );
              }
              const blankIndex = segment.index ?? idx;
              return (
                <TextField
                  key={`blank-${idx}`}
                  variant="outlined"
                  size="small"
                  value={values[blankIndex] || ''}
                  onChange={(event) => handleChange(blankIndex, event.target.value)}
                  disabled={disabled || isLoading}
                  sx={{ width: 160, mx: 1 }}
                />
              );
            })}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {values.map((value, index) => (
              <TextField
                key={index}
                label={`Réponse ${index + 1}`}
                value={value}
                onChange={(event) => handleChange(index, event.target.value)}
                disabled={disabled || isLoading}
                fullWidth
              />
            ))}
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || isLoading || values.some((val) => !val.trim())}
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
          {result.feedback || (result.is_correct ? 'Excellent !' : 'Essaie encore, certains champs sont incorrects.')}
        </Alert>
      )}
    </Box>
  );
};

export default FillInBlankAtom;
