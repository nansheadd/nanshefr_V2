import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  Stack,
  LinearProgress
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import apiClient from '../../../api/axiosConfig';

const classifyTopic = async (text) => {
  const { data } = await apiClient.post('/capsules/classify-topic/', { text });
  return data;
};

const createCapsule = async (payload) => {
  const { data } = await apiClient.post('/capsules/', payload);
  return data;
};

const CreateCapsuleModal = ({ open, onClose, onCreated, onStatus }) => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState('');
  const [classification, setClassification] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState({ phase: 'idle' });

  const classifyMutation = useMutation({
    mutationFn: classifyTopic,
    onMutate: () => {
      const next = { phase: 'classifying' };
      setStatus(next);
      onStatus?.(next);
    },
    onSuccess: (data) => {
      setClassification(data);
      setErrorMessage('');
      const next = { phase: 'classification_done', classification: data };
      setStatus(next);
      onStatus?.(next);
    },
    onError: (error) => {
      const message = error?.response?.data?.detail || "Impossible de classifier ce sujet pour le moment.";
      setErrorMessage(message);
      const next = { phase: 'error', message };
      setStatus(next);
      onStatus?.(next);
    },
  });

  const createMutation = useMutation({
    mutationFn: createCapsule,
    onMutate: () => {
      const next = { phase: 'creating' };
      setStatus(next);
      onStatus?.(next);
    },
    onSuccess: (capsule) => {
      setTopic('');
      setClassification(null);
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['capsules'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      const next = { phase: 'created', capsule };
      setStatus(next);
      onStatus?.(next);
      if (onCreated) onCreated(capsule);
    },
    onError: (error) => {
      const message = error?.response?.data?.detail || "La création de la capsule a échoué.";
      setErrorMessage(message);
      const next = { phase: 'error', message };
      setStatus(next);
      onStatus?.(next);
    },
  });

  useEffect(() => {
    if (!open) {
      setClassification(null);
      setErrorMessage('');
      classifyMutation.reset();
      createMutation.reset();
      const next = { phase: 'idle' };
      setStatus(next);
      onStatus?.(next);
    }
  }, [open]);

  const handleClassify = () => {
    if (!topic.trim()) {
      setErrorMessage('Décrivez rapidement le sujet de votre capsule.');
      return;
    }
    classifyMutation.mutate(topic.trim());
  };

  const handleCreate = () => {
    const trimmedTopic = topic.trim();
    if (!classification || !trimmedTopic) {
      return;
    }
    createMutation.mutate({
      main_skill: classification.main_skill,
      domain: classification.domain,
      area: classification.area,
      topic: trimmedTopic,
    });
  };

  const isBusy = classifyMutation.isLoading || createMutation.isLoading;

  return (
    <Dialog open={open} onClose={isBusy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        Générer une nouvelle capsule
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Donnez un sujet ou une compétence que vous souhaitez apprendre. L'IA va classifier
          automatiquement la capsule et générer un plan d'apprentissage personnalisé.
        </Typography>
        <TextField
          fullWidth
          label="Sujet ou compétence"
          placeholder="Ex: apprendre le japonais en voyage, maîtriser React, notions de stoïcisme..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isBusy}
        />

        {isBusy && <LinearProgress sx={{ mt: 2 }} />}

        {status.phase === 'classifying' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Classification du sujet en cours...
          </Alert>
        )}
        {status.phase === 'creating' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Génération de la capsule en cours. Tu peux fermer cette fenêtre si tu le souhaites, nous t'enverrons une notification lorsque tout sera prêt.
          </Alert>
        )}
        {status.phase === 'created' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Capsule créée avec succès !
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {classification && (
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Classification suggérée
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Compétence : ${classification.main_skill}`} color="primary" />
              <Chip label={`Domaine : ${classification.domain}`} />
              <Chip label={`Aire : ${classification.area}`} />
              <Chip label={`Confiance : ${(classification.confidence * 100).toFixed(0)}%`} variant="outlined" />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Vous pourrez adapter la capsule une fois créée.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isBusy}>
          Annuler
        </Button>
        {!classification ? (
          <Button onClick={handleClassify} variant="contained" disabled={isBusy}>
            Classifier le sujet
          </Button>
        ) : (
          <Button onClick={handleCreate} variant="contained" disabled={isBusy}>
            Créer la capsule
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateCapsuleModal;
