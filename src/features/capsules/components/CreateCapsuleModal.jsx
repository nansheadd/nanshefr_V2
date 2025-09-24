import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Autocomplete,
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
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText,
  Tooltip,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useI18n } from '../../../i18n/I18nContext';
import {
  classifyCapsuleTopic as classifyCapsuleTopicRequest,
  createCapsule as createCapsuleRequest,
  createCapsuleFromPdf as createCapsuleFromPdfRequest,
  fetchClassificationOptions as fetchClassificationOptionsRequest,
  submitClassificationFeedback as submitClassificationFeedbackRequest,
} from '../api/capsulesApi';

const CreateCapsuleModal = ({ open, onClose, onCreated, onStatus, currentUser }) => {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [topic, setTopic] = useState('');
  const [classification, setClassification] = useState(null);
  const [finalDomain, setFinalDomain] = useState('');
  const [finalArea, setFinalArea] = useState('');
  const [finalSkill, setFinalSkill] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState({ phase: 'idle' });
  const [creationMode, setCreationMode] = useState('topic');
  const [capsuleTitle, setCapsuleTitle] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const fileInputRef = useRef(null);

  const rawStatus = (currentUser?.subscription_status ?? '').toString().toLowerCase();
  const normalizedStatus = rawStatus.includes('.') ? rawStatus.split('.').pop() : rawStatus;
  const isPremiumUser = Boolean(currentUser?.is_superuser || normalizedStatus === 'premium');
  const pdfEnabled = false;
  const pdfHelperText = pdfEnabled
    ? (!isPremiumUser ? t('createCapsule.modes.pdfLocked') : '')
    : t('createCapsule.modes.pdfComingSoon');

  const classificationOptionsQuery = useQuery({
    queryKey: ['classification-options'],
    queryFn: fetchClassificationOptionsRequest,
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });

  const classifyMutation = useMutation({
    mutationFn: classifyCapsuleTopicRequest,
    onMutate: () => {
      const next = { phase: 'classifying' };
      setStatus(next);
      onStatus?.(next);
    },
    onSuccess: (data) => {
      setClassification(data);
      setFinalDomain(data.domain || '');
      setFinalArea(data.area || '');
      setFinalSkill(data.main_skill || '');
      setCapsuleTitle((prev) => prev || (data.main_skill ? data.main_skill.charAt(0).toUpperCase() + data.main_skill.slice(1) : topic.trim()));
      void classificationOptionsQuery.refetch();
      setErrorMessage('');
      const next = { phase: 'classification_done', classification: data };
      setStatus(next);
      onStatus?.(next);
    },
    onError: (error) => {
      const message = error?.response?.data?.detail || t('createCapsule.errors.classification');
      setErrorMessage(message);
      const next = { phase: 'error', message };
      setStatus(next);
      onStatus?.(next);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: submitClassificationFeedbackRequest,
    onSuccess: (data) => {
      if (data?.taxonomy) {
        queryClient.setQueryData(['classification-options'], data.taxonomy);
      }
    },
    onError: (error) => {
      const message = error?.response?.data?.detail || t('createCapsule.errors.feedback');
      setErrorMessage(message);
    },
  });

  const resetForm = () => {
    setTopic('');
    setClassification(null);
    setFinalDomain('');
    setFinalArea('');
    setFinalSkill('');
    setCapsuleTitle('');
    setPdfFile(null);
    setPdfError('');
    setCreationMode('topic');
  };

  const handleCreationSuccess = (capsule, phase = 'created') => {
    resetForm();
    queryClient.invalidateQueries({ queryKey: ['capsules'] });
    queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    const next = { phase, capsule };
    setStatus(next);
    onStatus?.(next);
    if (onCreated) onCreated(capsule);
  };

  const handleCreationError = (error) => {
    const message = error?.response?.data?.detail || t('createCapsule.errors.creation');
    setErrorMessage(message);
    const next = { phase: 'error', message };
    setStatus(next);
    onStatus?.(next);
  };

  const createMutation = useMutation({
    mutationFn: createCapsuleRequest,
    onMutate: () => {
      const next = { phase: 'creating' };
      setStatus(next);
      onStatus?.(next);
    },
    onSuccess: (capsule) => {
      handleCreationSuccess(capsule);
    },
    onError: handleCreationError,
  });

  const createFromPdfMutation = useMutation({
    mutationFn: createCapsuleFromPdfRequest,
    onMutate: () => {
      const next = { phase: 'creating_pdf' };
      setStatus(next);
      onStatus?.(next);
    },
    onSuccess: (capsule) => {
      handleCreationSuccess(capsule, 'created_pdf');
    },
    onError: handleCreationError,
  });

  useEffect(() => {
    if (!open) {
      resetForm();
      setErrorMessage('');
      classifyMutation.reset();
      createMutation.reset();
      createFromPdfMutation.reset();
      const next = { phase: 'idle' };
      setStatus(next);
      onStatus?.(next);
    }
  }, [open, classifyMutation, createMutation, createFromPdfMutation, onStatus]);

  useEffect(() => {
    if (open && classification) {
      void classificationOptionsQuery.refetch();
    }
  }, [open, classification, classificationOptionsQuery]);

  const handleModeChange = (_, value) => {
    if (!value) return;
    if (value === 'pdf') {
      if (!pdfEnabled) {
        setErrorMessage(t('createCapsule.modes.pdfComingSoon'));
        return;
      }
      if (!isPremiumUser) {
        setErrorMessage(t('createCapsule.modes.pdfLocked'));
        return;
      }
    }
    setCreationMode(value);
    if (value === 'topic') {
      setPdfError('');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setPdfError(t('createCapsule.errors.invalidPdf'));
      setPdfFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfError(t('createCapsule.errors.pdfTooBig'));
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
    setPdfError('');
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setPdfError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClassify = () => {
    if (!topic.trim()) {
      setErrorMessage(t('createCapsule.errors.topicRequired'));
      return;
    }
    classifyMutation.mutate(topic.trim());
  };

  const handleCreate = async () => {
    const trimmedTopic = topic.trim();
    const busy = createMutation.isLoading || createFromPdfMutation.isLoading || feedbackMutation.isLoading;
    if (!classification || !trimmedTopic || busy) {
      if (!classification) {
        setErrorMessage(t('createCapsule.errors.classificationRequired'));
      }
      return;
    }
    if (creationMode === 'pdf') {
      if (!pdfEnabled) {
        setErrorMessage(t('createCapsule.modes.pdfComingSoon'));
        return;
      }
      if (!isPremiumUser) {
        setErrorMessage(t('createCapsule.modes.pdfLocked'));
        return;
      }
      if (!pdfFile) {
        setPdfError(t('createCapsule.errors.pdfMissing'));
        return;
      }
    }
    setErrorMessage('');
    const predicted = classification ?? {};
    const finalClassification = {
      domain: finalDomain.trim() || predicted.domain || 'others',
      area: finalArea.trim() || predicted.area || 'generic',
      main_skill: finalSkill.trim() || predicted.main_skill || finalDomain.trim() || predicted.domain || 'unknown',
    };
    const classificationChanged = (
      finalClassification.domain !== (predicted.domain || '') ||
      finalClassification.area !== (predicted.area || '') ||
      finalClassification.main_skill !== (predicted.main_skill || '')
    );

    try {
      await feedbackMutation.mutateAsync({
        input_text: trimmedTopic,
        predicted_domain: predicted.domain,
        predicted_area: predicted.area,
        predicted_skill: predicted.main_skill,
        is_correct: !classificationChanged,
        final_domain: finalClassification.domain,
        final_area: finalClassification.area,
        final_skill: finalClassification.main_skill,
        notes: classificationChanged ? 'Correction utilisateur depuis le modal de création' : null,
        metadata: null,
      });
    } catch {
      return;
    }

    const resolvedTitle =
      capsuleTitle.trim() || finalClassification.main_skill || trimmedTopic || t('createCapsule.defaults.autoTitle');

    if (creationMode === 'pdf' && pdfEnabled) {
      createFromPdfMutation.mutate({
        file: pdfFile,
        metadata: {
          title: resolvedTitle,
          ...finalClassification,
        },
      });
    } else {
      createMutation.mutate({
        main_skill: finalClassification.main_skill,
        domain: finalClassification.domain,
        area: finalClassification.area,
        topic: trimmedTopic,
        title: resolvedTitle,
      });
    }
  };

  const isBusy = classifyMutation.isLoading || createMutation.isLoading || createFromPdfMutation.isLoading || feedbackMutation.isLoading;

  const domainsData = useMemo(
    () => classificationOptionsQuery.data?.domains ?? [],
    [classificationOptionsQuery.data]
  );
  const domainOptions = useMemo(() => domainsData.map((entry) => entry.domain), [domainsData]);
  const currentAreas = useMemo(() => {
    const match = domainsData.find((entry) => entry.domain === finalDomain);
    return match ? match.areas : [];
  }, [domainsData, finalDomain]);

  const classificationChanged = useMemo(() => {
    if (!classification) return false;
    return (
      (finalDomain || '') !== (classification.domain || '') ||
      (finalArea || '') !== (classification.area || '') ||
      (finalSkill || '') !== (classification.main_skill || '')
    );
  }, [classification, finalDomain, finalArea, finalSkill]);

  return (
    <Dialog open={open} onClose={isBusy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        {t('createCapsule.dialog.title')}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('createCapsule.dialog.description')}
        </Typography>

        <ToggleButtonGroup
          value={creationMode}
          exclusive
          onChange={handleModeChange}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="topic" disabled={isBusy}>{t('createCapsule.modes.topic')}</ToggleButton>
          <ToggleButton value="pdf" disabled>
            {`${t('createCapsule.modes.pdf')} (${t('common.soon')})`}
          </ToggleButton>
        </ToggleButtonGroup>
        {pdfHelperText && (
          <FormHelperText sx={{ mb: 2 }}>{pdfHelperText}</FormHelperText>
        )}

        <TextField
          fullWidth
          label={creationMode === 'pdf' ? t('createCapsule.labels.documentTopic') : t('createCapsule.labels.topic')}
          placeholder={t('createCapsule.placeholders.topic')}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isBusy}
        />

        {creationMode === 'pdf' && pdfEnabled && (
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px dashed', borderColor: pdfError ? 'error.main' : 'divider' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Stack spacing={1} alignItems="flex-start">
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
              >
                {pdfFile ? t('createCapsule.file.replace') : t('createCapsule.file.choose')}
              </Button>
            {pdfFile && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">{pdfFile.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('createCapsule.file.size', {
                    size: (pdfFile.size / 1024 / 1024).toFixed(2),
                  })}
                </Typography>
                <Tooltip title={t('createCapsule.file.remove')}>
                  <IconButton size="small" onClick={handleRemoveFile} disabled={isBusy}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
            <Typography variant="caption" color="text.secondary">
              {t('createCapsule.file.info')}
            </Typography>
            {pdfError && (
              <FormHelperText error>{pdfError}</FormHelperText>
            )}
            </Stack>
          </Box>
        )}

        {isBusy && <LinearProgress sx={{ mt: 2 }} />}

        {status.phase === 'classifying' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('capsuleList.statusMessages.classifying')}
          </Alert>
        )}
        {(status.phase === 'creating' || status.phase === 'creating_pdf') && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('capsuleList.statusMessages.creating')}
          </Alert>
        )}
        {(status.phase === 'created' || status.phase === 'created_pdf') && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('capsuleList.statusMessages.created')}
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
              {t('createCapsule.classification.suggested')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${t('createCapsule.chips.skill')}: ${classification.main_skill}`} color="primary" />
              <Chip label={`${t('createCapsule.chips.domain')}: ${classification.domain}`} />
              <Chip label={`${t('createCapsule.chips.area')}: ${classification.area}`} />
              <Chip label={`${t('createCapsule.chips.confidence')}: ${(classification.confidence * 100).toFixed(0)}%`} variant="outlined" />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('createCapsule.classification.adjustmentHint')}
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label={t('createCapsule.labels.title')}
                value={capsuleTitle}
                onChange={(e) => setCapsuleTitle(e.target.value)}
                disabled={isBusy}
                placeholder={t('createCapsule.placeholders.title')}
              />
              <Autocomplete
                freeSolo
                options={domainOptions}
                value={finalDomain}
                onChange={(_, value) => setFinalDomain(value || '')}
                onInputChange={(_, value) => setFinalDomain(value || '')}
                renderInput={(params) => (
                  <TextField {...params} label={t('createCapsule.labels.domain')} placeholder={t('createCapsule.placeholders.domain')} disabled={isBusy} />
                )}
              />
              <Autocomplete
                freeSolo
                options={currentAreas}
                value={finalArea}
                onChange={(_, value) => setFinalArea(value || '')}
                onInputChange={(_, value) => setFinalArea(value || '')}
                renderInput={(params) => (
                  <TextField {...params} label={t('createCapsule.labels.area')} placeholder={t('createCapsule.placeholders.area')} disabled={isBusy} />
                )}
              />
              <TextField
                label={t('createCapsule.labels.mainSkill')}
                value={finalSkill}
                onChange={(e) => setFinalSkill(e.target.value)}
                disabled={isBusy}
              />
            </Stack>

            <Alert severity={classificationChanged ? 'warning' : 'success'} sx={{ mt: 2 }}>
              {classificationChanged
                ? t('createCapsule.classification.warning')
                : t('createCapsule.classification.validated')}
            </Alert>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('createCapsule.classification.feedbackHint')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isBusy}>
          {t('common.cancel')}
        </Button>
        {!classification ? (
          <Button onClick={handleClassify} variant="contained" disabled={isBusy}>
            {t('createCapsule.buttons.classify')}
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={
              isBusy ||
              !finalDomain.trim() ||
              !finalArea.trim() ||
              !finalSkill.trim()
            }
          >
            {t('createCapsule.buttons.create')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateCapsuleModal;
