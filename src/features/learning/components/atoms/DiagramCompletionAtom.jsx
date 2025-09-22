import React, { useState } from 'react';
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const DiagramCompletionAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const title = content.title || content.prompt || atom?.title;
  const description = content.description;
  const slots = Array.isArray(content.slots) ? content.slots : [];

  const [answers, setAnswers] = useState(() => {
    const initial = {};
    slots.forEach((slot) => {
      initial[slot.id || slot.label] = '';
    });
    return initial;
  });
  const [result, setResult] = useState(null);

  const { submitAnswer, resetProgress, resetMutation, isLoading } = useAtomAnswer({
    atom,
    onReward,
    onResult: (data) => setResult(data),
    onReset: () => {
      const resetValues = {};
      slots.forEach((slot) => {
        resetValues[slot.id || slot.label] = '';
      });
      setAnswers(resetValues);
      setResult(null);
    },
  });

  const completed = atom?.progress_status === 'completed';
  const showReset = completed || Boolean(result?.is_correct);
  const disabled = showReset;

  const handleChange = (slotId, value) => {
    setAnswers((prev) => ({ ...prev, [slotId]: value }));
  };

  const handleSubmit = () => {
    if (isLoading) return;
    const isCorrect = slots.every((slot) => {
      const slotId = slot.id || slot.label;
      const expected = slot.correct_option ?? slot.answer;
      const selected = answers[slotId];
      if (!expected) return Boolean(selected);
      if (Array.isArray(expected)) {
        return expected.includes(selected);
      }
      return selected === expected;
    });
    submitAnswer(isCorrect, { placements: answers });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      <Stack spacing={2}>
        {slots.map((slot, index) => {
          const slotId = slot.id || slot.label || `${index}`;
          const options = Array.isArray(slot.options) ? slot.options : slot.choices || [];
          return (
            <Paper key={slotId} sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {slot.label || `Élément ${index + 1}`}
              </Typography>
              <FormControl fullWidth size="small" disabled={disabled || isLoading}>
                <InputLabel id={`slot-${atom.id}-${slotId}`}>Sélectionner</InputLabel>
                <Select
                  labelId={`slot-${atom.id}-${slotId}`}
                  value={answers[slotId] || ''}
                  label="Sélectionner"
                  onChange={(event) => handleChange(slotId, event.target.value)}
                >
                  {options.map((option) => (
                    <MenuItem key={option.value || option} value={option.value || option}>
                      {option.label || option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || isLoading || slots.some((slot, index) => {
            const slotId = slot.id || slot.label || `${index}`;
            return !answers[slotId];
          })}
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
          {result.feedback || (result.is_correct ? 'Schéma complété !' : 'Certains éléments ne sont pas au bon endroit.')} 
        </Alert>
      )}
    </Box>
  );
};

export default DiagramCompletionAtom;
