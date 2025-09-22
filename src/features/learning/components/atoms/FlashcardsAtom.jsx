import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import useAtomAnswer from '../../hooks/useAtomAnswer';

const FlashcardsAtom = ({ atom, onReward }) => {
  const content = atom?.content ?? {};
  const prompt = content.prompt || content.instruction || 'Cartes mémoire';
  const cards = useMemo(() => {
    if (Array.isArray(content.cards)) return content.cards;
    if (Array.isArray(content.items)) return content.items;
    return [];
  }, [content.cards, content.items]);

  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState(new Set());
  const [result, setResult] = useState(null);

  const { submitAnswer, resetProgress, resetMutation, isLoading } = useAtomAnswer({
    atom,
    onReward,
    onResult: (data) => setResult(data),
    onReset: () => {
      setIndex(0);
      setIsFlipped(false);
      setMastered(new Set());
      setResult(null);
    },
  });

  const completed = atom?.progress_status === 'completed';
  const showReset = completed || Boolean(result?.is_correct);
  const disabled = showReset;

  if (!cards.length) {
    return (
      <Alert severity="info">Aucune flashcard disponible pour le moment.</Alert>
    );
  }

  const currentCard = cards[index];

  const goNext = () => {
    setIsFlipped(false);
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const handleMarkKnown = () => {
    const nextSet = new Set(mastered);
    nextSet.add(index);
    setMastered(nextSet);
    if (nextSet.size === cards.length) {
      submitAnswer(true, { mastered: [...nextSet] });
    } else {
      goNext();
    }
  };

  const handleMarkReview = () => {
    goNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {prompt}
      </Typography>

      <Card
        sx={{
          mt: 2,
          borderRadius: 3,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'default' : 'pointer',
          position: 'relative',
          background: isFlipped ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : 'linear-gradient(135deg, #0f766e, #14b8a6)',
          color: '#fff',
          transition: 'transform 0.4s ease',
        }}
        onClick={() => !disabled && setIsFlipped((prev) => !prev)}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="overline" sx={{ letterSpacing: 1 }}>
            {isFlipped ? 'Réponse' : 'Question'}
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {isFlipped ? currentCard.back || currentCard.answer : currentCard.front || currentCard.question}
          </Typography>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleMarkKnown} disabled={disabled || isLoading}>
          Je connais
        </Button>
        <Button variant="outlined" onClick={handleMarkReview} disabled={disabled || isLoading}>
          À revoir
        </Button>
        {showReset && (
          <Button variant="text" onClick={resetProgress} disabled={resetMutation.isPending}>
            Réinitialiser
          </Button>
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Carte {index + 1} / {cards.length}
      </Typography>

      {result && (
        <Alert severity={result.is_correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.feedback || (result.is_correct ? 'Toutes les cartes sont maîtrisées !' : 'Encore un effort sur certaines cartes.')} 
        </Alert>
      )}
    </Box>
  );
};

export default FlashcardsAtom;
