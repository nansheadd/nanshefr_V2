import React, { useState } from 'react';
import { Alert, Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const TrueFalseAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const statement = content.statement || content.prompt || atom?.title;
  const explanation = content.explanation;
  const correctAnswer = typeof content.correct_answer === 'boolean'
    ? content.correct_answer
    : String(content.correct_answer).toLowerCase() === 'true';

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
    const isTrue = value === 'true';
    const isCorrect = isTrue === correctAnswer;
    submitAnswer(isCorrect, { answer: isTrue });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {statement}
      </Typography>

      <FormControl component="fieldset" disabled={disabled || isLoading} sx={{ mt: 2 }}>
        <RadioGroup value={value} onChange={(event) => setValue(event.target.value)}>
          <FormControlLabel value="true" control={<Radio />} label="Vrai" />
          <FormControlLabel value="false" control={<Radio />} label="Faux" />
        </RadioGroup>
      </FormControl>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || isLoading || !value}
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
          {result.feedback || (result.is_correct ? 'Exact !' : 'Pas tout à fait, revois la notion.')} 
        </Alert>
      )}

      {result?.is_correct === false && explanation && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {explanation}
        </Alert>
      )}
    </Box>
  );
};

export default TrueFalseAtom;
