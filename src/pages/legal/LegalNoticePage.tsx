import * as React from 'react';
import { Typography, Link as MuiLink, List, ListItem } from '@mui/material';
import LegalLayout from './LegalLayout';
import { legalPlaceholders as C } from '../../config/legal';
import { useAppLanguage } from './_useAppLanguage';

export default function LegalNoticePage() {
  const lang = useAppLanguage();
  const title = {
    fr: 'Mentions légales',
    en: 'Legal Notice',
    nl: 'Wettelijke vermeldingen',
  };

  const block = {
    fr: (
      <>
        <Typography variant="h4">Éditeur du site</Typography>
        <List>
          <ListItem>Entreprise : <strong>{C.companyName}</strong> ({C.companyForm})</ListItem>
          <ListItem>Siège : {C.companyAddress}</ListItem>
          <ListItem>{C.companyBCE} — {C.companyVAT}</ListItem>
          <ListItem>Contact : <MuiLink href={`mailto:${C.contactEmail}`}>{C.contactEmail}</MuiLink>{C.phone ? ` — ${C.phone}` : ''}</ListItem>
        </List>

        <Typography variant="h4">Hébergeur</Typography>
        <List>
          <ListItem>{C.hostName}</ListItem>
          <ListItem>{C.hostAddress}</ListItem>
          <ListItem>{C.hostPhone}</ListItem>
        </List>

        <Typography variant="h4">Propriété intellectuelle</Typography>
        <Typography>
          Sauf mention contraire, l’ensemble des contenus (textes, interfaces, éléments graphiques, logos) est protégé et demeure la propriété de {C.companyName}. Toute réutilisation nécessite une autorisation écrite. Les marques et contenus de tiers restent la propriété de leurs titulaires.
        </Typography>

        <Typography variant="h4">Contact juridique</Typography>
        <Typography>
          Pour toute question légale : <MuiLink href={`mailto:${C.legalEmail}`}>{C.legalEmail}</MuiLink>
        </Typography>
      </>
    ),
    en: (
      <>
        <Typography variant="h4">Publisher</Typography>
        <List>
          <ListItem>Company: <strong>{C.companyName}</strong> ({C.companyForm})</ListItem>
          <ListItem>Registered office: {C.companyAddress}</ListItem>
          <ListItem>{C.companyBCE} — {C.companyVAT}</ListItem>
          <ListItem>Contact: <MuiLink href={`mailto:${C.contactEmail}`}>{C.contactEmail}</MuiLink>{C.phone ? ` — ${C.phone}` : ''}</ListItem>
        </List>

        <Typography variant="h4">Hosting provider</Typography>
        <List>
          <ListItem>{C.hostName}</ListItem>
          <ListItem>{C.hostAddress}</ListItem>
          <ListItem>{C.hostPhone}</ListItem>
        </List>

        <Typography variant="h4">Intellectual property</Typography>
        <Typography>
          Unless stated otherwise, all content (texts, UI elements, graphics, logos) is protected and owned by {C.companyName}. Any reuse requires prior written permission. Third‑party trademarks and content remain the property of their respective owners.
        </Typography>

        <Typography variant="h4">Legal contact</Typography>
        <Typography>
          Questions: <MuiLink href={`mailto:${C.legalEmail}`}>{C.legalEmail}</MuiLink>
        </Typography>
      </>
    ),
    nl: (
      <>
        <Typography variant="h4">Uitgever</Typography>
        <List>
          <ListItem>Onderneming: <strong>{C.companyName}</strong> ({C.companyForm})</ListItem>
          <ListItem>Maatschappelijke zetel: {C.companyAddress}</ListItem>
          <ListItem>{C.companyBCE} — {C.companyVAT}</ListItem>
          <ListItem>Contact: <MuiLink href={`mailto:${C.contactEmail}`}>{C.contactEmail}</MuiLink>{C.phone ? ` — ${C.phone}` : ''}</ListItem>
        </List>

        <Typography variant="h4">Hostingleverancier</Typography>
        <List>
          <ListItem>{C.hostName}</ListItem>
          <ListItem>{C.hostAddress}</ListItem>
          <ListItem>{C.hostPhone}</ListItem>
        </List>

        <Typography variant="h4">Intellectuele eigendom</Typography>
        <Typography>
          Tenzij anders vermeld, zijn alle inhoud en elementen (teksten, UI, grafische elementen, logo’s) beschermd en eigendom van {C.companyName}. Hergebruik vereist voorafgaande schriftelijke toestemming. Merken en inhoud van derden blijven eigendom van hun respectieve houders.
        </Typography>

        <Typography variant="h4">Juridisch contact</Typography>
        <Typography>
          Vragen: <MuiLink href={`mailto:${C.legalEmail}`}>{C.legalEmail}</MuiLink>
        </Typography>
      </>
    ),
  };

  return (
    <LegalLayout title={title} updatedAt={new Date().toISOString()}>
      {block[lang]}
    </LegalLayout>
  );
}