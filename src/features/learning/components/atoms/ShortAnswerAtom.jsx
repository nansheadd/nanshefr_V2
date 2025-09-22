import React, { useMemo, useState } from 'react';
import { Box, Button, Stack, TextField, Alert, Typography } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const normalizeAnswer = (value, caseSensitive = false, trim = true) => {
  if (typeof value !== 'string') return '';
  let output = trim ? value.trim() : value;
  if (!caseSensitive) {
    output = output.toLowerCase();
  }
  return output;
};

const ShortAnswerAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const prompt = content.prompt || content.question || atom?.title;
  const acceptableAnswers = useMemo(() => {
    const answers = content.acceptable_answers || content.answers || content.correct_answers || [];
    if (typeof answers === 'string') {
      return [answers];
    }
    return Array.isArray(answers) ? answers : [];
  }, [content.acceptable_answers, content.answers, content.correct_answers]);
  const caseSensitive = Boolean(content.case_sensitive);
  const trim = content.trim_whitespace !== false;

  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);

  const { submitAnswer, resetProgress, logAnswerMutation, resetMutation, isLoading } = useAtomAnswer({
    atom,
    onReward,
    onResult: (data) => setResult(data),
    onReset: () => {
      setValue('');
      setResult(null);
    },
  });

  const completed = atom?.progress_status === 'completed';
  const showReset = completed || Boolean(result?.is_correct);
  const disabled = showReset;

  const handleSubmit = () => {
    if (!value || logAnswerMutation.isPending) return;
    const normalizedUser = normalizeAnswer(value, caseSensitive, trim);
    const isCorrect = acceptableAnswers.some((ans) => normalizeAnswer(ans, caseSensitive, trim) === normalizedUser);
    submitAnswer(isCorrect, { response: value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {prompt}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Ta réponse"
          multiline={Boolean(content.multiline)}
          minRows={content.multiline ? 3 : undefined}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled || isLoading}
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={disabled || isLoading || !value.trim()}
          >
            Valider
          </Button>
          {showReset && (
            <Button variant="outlined" onClick={resetProgress} disabled={resetMutation.isPending}>
              Réinitialiser
            </Button>
          )}
        </Stack>
      </Stack>

      {result && (
        <Alert severity={result.is_correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.feedback || (result.is_correct ? 'Bonne réponse !' : 'Ce n\'est pas encore ça.')} 
        </Alert>
      )}
    </Box>
  );
};

export default ShortAnswerAtom;
