import * as React from 'react';
import { Typography, TextField, Button, Stack, Alert } from '@mui/material';
import LegalLayout from './LegalLayout';
import { useAppLanguage } from './_useAppLanguage';

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
      send: 'Envoyer le signalement'
    },
    en: {
      intro: 'Use this form to notify us of potentially illegal content under Art. 16 DSA.',
      url: 'Exact URL of the content',
      reason: 'Why is this content illegal? (explanation and, if possible, legal basis)',
      name: 'Your name (optional for specific serious offences)',
      email: 'Your email for follow‑up',
      goodFaith: 'I declare in good faith that this information is accurate.',
      send: 'Submit report'
    },
    nl: {
      intro: 'Gebruik dit formulier om mogelijk onwettige inhoud te melden volgens art. 16 DSA.',
      url: 'Exacte URL van de inhoud',
      reason: 'Waarom is deze inhoud onwettig? (uitleg en indien mogelijk rechtsgrond)',
      name: 'Uw naam (optioneel voor bepaalde zware strafbare feiten)',
      email: 'Uw e‑mail voor opvolging',
      goodFaith: 'Ik verklaar te goeder trouw dat deze informatie correct is.',
      send: 'Melding verzenden'
    }
  }[lang];

  return (
    <LegalLayout title={title} updatedAt={new Date().toISOString()}>
      <Alert severity="info" sx={{ mb: 2 }}>{labels.intro}</Alert>
      <Stack spacing={2} component="form" onSubmit={(e)=>{e.preventDefault(); alert('Merci ! Nous accusons réception.');}}>
        <TextField label={labels.url} required fullWidth />
        <TextField label={labels.reason} required fullWidth multiline minRows={4} />
        <TextField label={labels.name} fullWidth />
        <TextField label={labels.email} type="email" required fullWidth />
        <TextField label={labels.goodFaith} required fullWidth />
        <Button type="submit" variant="contained">{labels.send}</Button>
      </Stack>
    </LegalLayout>
  );
}