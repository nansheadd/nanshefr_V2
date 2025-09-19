import * as React from 'react';
import { Typography, Link as MuiLink, List, ListItem, Alert } from '@mui/material';
import LegalLayout from './LegalLayout';
import { legalPlaceholders as C } from '../../config/legal';
import { useAppLanguage } from './_useAppLanguage';

export default function PrivacyPolicyPage() {
  const lang = useAppLanguage();
  const title = { fr: 'Politique de confidentialité', en: 'Privacy Policy', nl: 'Privacybeleid' };

  const APD_URL = 'https://www.autoriteprotectiondonnees.be/';
  const APD_COMPLAINT = 'https://www.autoriteprotectiondonnees.be/citoyen/agir/introduire-une-plainte';

  const content = {
    fr: (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          Nanshe est établie en Belgique. Cette politique applique le RGPD et la loi belge.
        </Alert>

        <Typography variant="h4">Responsable du traitement</Typography>
        <Typography>
          {C.companyName}, {C.companyAddress}. Contact : <MuiLink href={`mailto:${C.privacyEmail}`}>{C.privacyEmail}</MuiLink>
        </Typography>

        <Typography variant="h4">Données que nous traitons</Typography>
        <List>
          <ListItem>Compte : e‑mail, nom d’utilisateur, mot de passe haché.</ListItem>
          <ListItem>Abonnement & facturation : identifiants Stripe (token), statut, historique (les données de carte sont traitées par Stripe).</ListItem>
          <ListItem>Utilisation : progression d’apprentissage, événements techniques (logs), préférences (langue, thème).</ListItem>
          <ListItem>Cookies/analytics : déposés uniquement avec votre consentement (voir Politique cookies).</ListItem>
        </List>

        <Typography variant="h4">Finalités & bases légales</Typography>
        <List>
          <ListItem>Exécution du contrat : création et gestion du compte, fourniture des fonctionnalités, abonnement et paiement.</ListItem>
          <ListItem>Intérêt légitime : sécurité, prévention de la fraude, amélioration du service (mesures agrégées et non traçantes) ; logs techniques.</ListItem>
          <ListItem>Obligation légale : facturation et obligations fiscales/comptables.</ListItem>
          <ListItem>Consentement : analytics (Google Analytics 4) et tout suivi non nécessaire.</ListItem>
        </List>

        <Typography variant="h4">Sous‑traitants (principaux)</Typography>
        <List>
          <ListItem>Hébergement : {C.hostName} ({C.hostAddress}).</ListItem>
          <ListItem>Paiement : Stripe Payments Europe, Ltd. (UE). Certaines données peuvent être transférées hors EEE selon leur politique et mécanismes (SCC).</ListItem>
          <ListItem>Analytics : Google Ireland Ltd. (GA4), activé uniquement après consentement ; configuration respectueuse (anonymisation IP, conservation limitée).</ListItem>
        </List>

        <Typography variant="h4">Transferts hors UE</Typography>
        <Typography>
          Lorsque cela est nécessaire (ex. services cloud/Stripe/Google), nous utilisons les garanties du RGPD (clauses contractuelles types, mesures supplémentaires). Les détails sont disponibles sur demande.
        </Typography>

        <Typography variant="h4">Durées de conservation</Typography>
        <List>
          <ListItem>Compte : tant que le compte est actif puis suppression sous 24 mois d’inactivité (sauf obligations légales).</ListItem>
          <ListItem>Factures et documents comptables : 10 ans (obligation fiscale belge).</ListItem>
          <ListItem>Logs techniques : 12 mois.</ListItem>
          <ListItem>Cookies/mesure d’audience : selon consentement, durée maximale conforme aux recommandations (ex. 13 mois).</ListItem>
        </List>

        <Typography variant="h4">Vos droits</Typography>
        <Typography>
          Accès, rectification, effacement, limitation, portabilité, opposition (notamment au profilage à des fins marketing — que nous n’effectuons pas). Exercice via <MuiLink href={`mailto:${C.privacyEmail}`}>{C.privacyEmail}</MuiLink>.
        </Typography>

        <Typography variant="h4">Mineurs</Typography>
        <Typography>
          Le service est accessible aux mineurs. En Belgique, l’âge du consentement numérique est de 13 ans : en dessous, nous demandons l’accord d’un parent/tuteur. Des mesures raisonnables de vérification sont appliquées.
        </Typography>

        <Typography variant="h4">Réclamations</Typography>
        <Typography>
          Vous pouvez contacter l’Autorité de protection des données (APD) : <MuiLink href={APD_URL} target="_blank">autoriteprotectiondonnees.be</MuiLink> — Déposer une plainte : <MuiLink href={APD_COMPLAINT} target="_blank">formulaire en ligne</MuiLink>.
        </Typography>
      </>
    ),
    en: (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          Nanshe is established in Belgium. This policy applies the GDPR and Belgian law.
        </Alert>

        <Typography variant="h4">Controller</Typography>
        <Typography>
          {C.companyName}, {C.companyAddress}. Contact: <MuiLink href={`mailto:${C.privacyEmail}`}>{C.privacyEmail}</MuiLink>
        </Typography>

        <Typography variant="h4">Data we process</Typography>
        <List>
          <ListItem>Account: email, username, hashed password.</ListItem>
          <ListItem>Subscription & billing: Stripe identifiers (token), status, history (card data handled by Stripe).</ListItem>
          <ListItem>Usage: learning progress, technical events (logs), preferences (language, theme).</ListItem>
          <ListItem>Cookies/analytics: set only with your consent (see Cookies Policy).</ListItem>
        </List>

        <Typography variant="h4">Purposes & legal bases</Typography>
        <List>
          <ListItem>Contract: account creation & management, features, subscription & payment.</ListItem>
          <ListItem>Legitimate interests: security, fraud prevention, service improvement (aggregated, non‑tracking), technical logs.</ListItem>
          <ListItem>Legal obligation: invoicing & tax/accounting obligations.</ListItem>
          <ListItem>Consent: analytics (Google Analytics 4) and any non‑essential tracking.</ListItem>
        </List>

        <Typography variant="h4">Processors (key)</Typography>
        <List>
          <ListItem>Hosting: {C.hostName} ({C.hostAddress}).</ListItem>
          <ListItem>Payments: Stripe Payments Europe, Ltd. (EU). Some data may be transferred outside the EEA under SCCs.</ListItem>
          <ListItem>Analytics: Google Ireland Ltd. (GA4), only after consent; privacy‑friendly settings (IP anonymisation, limited retention).</ListItem>
        </List>

        <Typography variant="h4">International transfers</Typography>
        <Typography>
          Where necessary (e.g., cloud/Stripe/Google), we rely on GDPR safeguards (standard contractual clauses and supplementary measures). Details available on request.
        </Typography>

        <Typography variant="h4">Retention</Typography>
        <List>
          <ListItem>Account: while active, then deleted after 24 months of inactivity (unless legal obligations).</ListItem>
          <ListItem>Invoices & accounting records: 10 years (Belgian tax rule).</ListItem>
          <ListItem>Technical logs: 12 months.</ListItem>
          <ListItem>Cookies/analytics: per consent, with short retention (e.g., 13 months).</ListItem>
        </List>

        <Typography variant="h4">Your rights</Typography>
        <Typography>
          Access, rectification, erasure, restriction, portability, objection (including to marketing profiling — which we do not perform). Exercise via <MuiLink href={`mailto:${C.privacyEmail}`}>{C.privacyEmail}</MuiLink>.
        </Typography>

        <Typography variant="h4">Children</Typography>
        <Typography>
          Service available to minors. In Belgium the digital age of consent is 13; below that we require parental consent and apply reasonable verification steps.
        </Typography>

        <Typography variant="h4">Complaints</Typography>
        <Typography>
          Belgian Data Protection Authority (APD/GBA): <MuiLink href={APD_URL} target="_blank">dataprotectionauthority.be</MuiLink> — Lodge a complaint: <MuiLink href={APD_COMPLAINT} target="_blank">online form</MuiLink>.
        </Typography>
      </>
    ),
    nl: (
      <>
        <Alert severity="info" sx={{ mb: 2 }}>
          Nanshe is in België gevestigd. Dit beleid past de AVG en de Belgische wet toe.
        </Alert>

        <Typography variant="h4">Verwerkingsverantwoordelijke</Typography>
        <Typography>
          {C.companyName}, {C.companyAddress}. Contact: <MuiLink href={`mailto:${C.privacyEmail}`}>{C.privacyEmail}</MuiLink>
        </Typography>

        <Typography variant="h4">Welke gegevens verwerken wij</Typography>
        <List>
          <ListItem>Account: e‑mail, gebruikersnaam, gehashte wachtwoorden.</ListItem>
          <ListItem>Abonnement & facturatie: Stripe‑identifiers (token), status, historiek (kaartgegevens via Stripe).</ListItem>
          <ListItem>Gebruik: leerprogressie, technische logs, voorkeuren (taal, thema).</ListItem>
          <ListItem>Cookies/analytics: enkel na toestemming (zie Cookiebeleid).</ListItem>
        </List>

        <Typography variant="h4">Doeleinden & rechtsgronden</Typography>
        <List>
          <ListItem>Contract: aanmaken en beheren van het account, functies, abonnement en betaling.</ListItem>
          <ListItem>Gerechtvaardigd belang: beveiliging, fraudepreventie, verbetering van de service (geaggregeerd), technische logs.</ListItem>
          <ListItem>Wettelijke verplichting: facturatie en fiscale/boekhoudkundige verplichtingen.</ListItem>
          <ListItem>Toestemming: analytics (Google Analytics 4) en alle niet‑essentiële tracking.</ListItem>
        </List>

        <Typography variant="h4">Verwerkers (belangrijkste)</Typography>
        <List>
          <ListItem>Hosting: {C.hostName} ({C.hostAddress}).</ListItem>
          <ListItem>Betalingen: Stripe Payments Europe, Ltd. (EU). Bepaalde gegevens kunnen buiten de EER worden doorgegeven (SCC’s).</ListItem>
          <ListItem>Analytics: Google Ireland Ltd. (GA4), enkel na toestemming; privacyvriendelijke instellingen.</ListItem>
        </List>

        <Typography variant="h4">Doorgiften buiten de EU</Typography>
        <Typography>
          Waar nodig (cloud/Stripe/Google) baseren wij ons op AVG‑garanties (modelcontracten en aanvullende maatregelen). Details op aanvraag.
        </Typography>

        <Typography variant="h4">Bewaartermijnen</Typography>
        <List>
          <ListItem>Account: zolang het actief is, vervolgens verwijderd na 24 maanden inactiviteit (behoudens wettelijke verplichtingen).</ListItem>
          <ListItem>Facturen & boekhouddocumenten: 10 jaar (Belgische fiscale regel).</ListItem>
          <ListItem>Technische logs: 12 maanden.</ListItem>
          <ListItem>Cookies/analytics: conform toestemming, beperkte duur.</ListItem>
        </List>

        <Typography variant="h4">Uw rechten</Typography>
        <Typography>
          Recht op inzage, rectificatie, wissing, beperking, overdraagbaarheid en bezwaar. Uitoefenen via <MuiLink href={`mailto:${C.privacyEmail}`}>{C.privacyEmail}</MuiLink>.
        </Typography>

        <Typography variant="h4">Minderjarigen</Typography>
        <Typography>
          De dienst is toegankelijk voor minderjarigen. In België is de digitale toestemmingsleeftijd 13 jaar; daaronder vragen wij ouderlijke toestemming met redelijke verificatie.
        </Typography>

        <Typography variant="h4">Klachten</Typography>
        <Typography>
          Gegevensbeschermingsautoriteit (GBA/APD): <MuiLink href={APD_URL} target="_blank">autoriteprotectiondonnees.be</MuiLink> — Klacht indienen: <MuiLink href={APD_COMPLAINT} target="_blank">online formulier</MuiLink>.
        </Typography>
      </>
    ),
  };

  return (
    <LegalLayout title={title} updatedAt={new Date().toISOString()}>
      {content[lang]}
    </LegalLayout>
  );
}