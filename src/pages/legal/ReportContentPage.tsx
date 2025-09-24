import * as React from 'react';
import { TextField, Button, Stack, Alert, Checkbox, FormControlLabel } from '@mui/material';
import LegalLayout from './LegalLayout';
import { useAppLanguage } from './_useAppLanguage';
import { buildApiUrl } from '../../config/api';

export default function ReportContentPage() {
  const lang = useAppLanguage();
  const title = {
    fr: 'Signaler un contenu illicite (DSA)',
    en: 'Report illegal content (DSA)',
    nl: 'Onwettige inhoud melden (DSA)'
  };

  const labels = {
    fr: {
      intro: "Ce formulaire permet de nous notifier un contenu potentiellement illicite conformément à l’art. 16 DSA.",
      url: 'URL précise du contenu',
      reason: 'Pourquoi ce contenu serait-il illicite ? (explications et, si possible, base légale)',
      name: 'Votre nom (facultatif si l’infraction concerne des infractions graves spécifiques)',
      email: 'Votre e‑mail pour le suivi',
      goodFaith: 'Je déclare de bonne foi que ces informations sont exactes.',
      send: 'Envoyer le signalement',
      success: 'Merci ! Nous accusons réception de votre signalement.',
      genericError: 'Impossible d’envoyer le signalement. Merci de réessayer plus tard.'
    },
    en: {
      intro: 'Use this form to notify us of potentially illegal content under Art. 16 DSA.',
      url: 'Exact URL of the content',
      reason: 'Why is this content illegal? (explanation and, if possible, legal basis)',
      name: 'Your name (optional for specific serious offences)',
      email: 'Your email for follow‑up',
      goodFaith: 'I declare in good faith that this information is accurate.',
      send: 'Submit report',
      success: 'Thanks! We have recorded your report.',
      genericError: 'We could not submit your report. Please try again later.'
    },
    nl: {
      intro: 'Gebruik dit formulier om mogelijk onwettige inhoud te melden volgens art. 16 DSA.',
      url: 'Exacte URL van de inhoud',
      reason: 'Waarom is deze inhoud onwettig? (uitleg en indien mogelijk rechtsgrond)',
      name: 'Uw naam (optioneel voor bepaalde zware strafbare feiten)',
      email: 'Uw e‑mail voor opvolging',
      goodFaith: 'Ik verklaar te goeder trouw dat deze informatie correct is.',
      send: 'Melding verzenden',
      success: 'Bedankt! We hebben je melding ontvangen.',
      genericError: 'Je melding kon niet worden verstuurd. Probeer het later opnieuw.'
    }
  }[lang];

  const [url, setUrl] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [goodFaith, setGoodFaith] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload = {
      url: url.trim(),
      reason: reason.trim(),
      name: name.trim() || undefined,
      email: email.trim(),
      good_faith: goodFaith,
      lang
    };

    try {
      const response = await fetch(buildApiUrl('/legal/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Active l'envoi du cookie access_token si l'utilisateur est authentifié
        credentials: 'include'
      });

      if (!response.ok) {
        let detail = labels.genericError;
        try {
          const json = await response.json();
          if (typeof json?.detail === 'string') {
            detail = json.detail;
          }
        } catch {}
        throw new Error(detail);
      }

      const json = await response.json();
      setSuccessMsg(typeof json?.message === 'string' ? json.message : labels.success);
      setUrl('');
      setReason('');
      setName('');
      setGoodFaith(false);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : labels.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalLayout title={title} updatedAt={new Date().toISOString()}>
      <Alert severity="info" sx={{ mb: 2 }}>{labels.intro}</Alert>
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      <Stack spacing={2} component="form" onSubmit={handleSubmit}>
        <TextField
          label={labels.url}
          required
          fullWidth
          value={url}
          type="url"
          onChange={(event) => setUrl(event.target.value)}
        />
        <TextField
          label={labels.reason}
          required
          fullWidth
          multiline
          minRows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <TextField
          label={labels.name}
          fullWidth
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label={labels.email}
          type="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              required
              checked={goodFaith}
              onChange={(event) => setGoodFaith(event.target.checked)}
            />
          }
          label={labels.goodFaith}
        />
        <Button type="submit" variant="contained" disabled={submitting || !goodFaith}>
          {submitting ? '...' : labels.send}
        </Button>
      </Stack>
    </LegalLayout>
  );
}
