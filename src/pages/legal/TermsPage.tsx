import * as React from 'react';
import { Typography, List, ListItem, Link as MuiLink } from '@mui/material';
import LegalLayout from './LegalLayout';
import { legalPlaceholders as C } from '../../config/legal';
import { useAppLanguage } from './_useAppLanguage';

export default function TermsPage() {
  const lang = useAppLanguage();
  const title = { fr: 'Conditions générales (CGU/CGV)', en: 'Terms of Service & Sale', nl: 'Algemene voorwaarden' };

  const MEDIATION_FR = 'https://mediationconsommateur.be/';
  const MEDIATION_EN = 'https://consumerombudsman.be/contact/';

  const block = {
    fr: (
      <>
        <Typography variant="h4">Objet</Typography>
        <Typography>Les présentes régissent l’accès et l’utilisation de Nanshe, ainsi que la vente des abonnements.</Typography>

        <Typography variant="h4">Compte & accès</Typography>
        <List>
          <ListItem>Création d’un compte nominatif ; vous êtes responsable de la confidentialité de vos identifiants.</ListItem>
          <ListItem>Usage autorisé : personnel et non commercial (sauf accord écrit).</ListItem>
          <ListItem>Contenus générés : vous conservez vos droits, vous nous concédez une licence technique d’hébergement et d’affichage.</ListItem>
        </List>

        <Typography variant="h4">Abonnements & prix</Typography>
        <List>
          <ListItem>Prix TTC en euros, détaillés lors de la commande. Les offres et prix peuvent évoluer.</ListItem>
          <ListItem>Renouvellement : mensuel/annuel, reconduction tacite ; vous pouvez annuler à tout moment avant l’échéance.</ListItem>
          <ListItem>Paiement sécurisé via Stripe ; nous ne stockons pas vos données de carte.</ListItem>
        </List>

        <Typography variant="h4">Droit de rétractation (B2C)</Typography>
        <List>
          <ListItem>14 jours pour se rétracter à compter de la souscription.</ListItem>
          <ListItem>Si vous demandez l’exécution immédiate et que le service est pleinement fourni avant la fin du délai, vous reconnaissez perdre votre droit de rétractation.</ListItem>
          <ListItem>En cas d’exécution partielle, un prorata peut être retenu.</ListItem>
        </List>

        <Typography variant="h4">Garanties & responsabilité</Typography>
        <List>
          <ListItem>Service « en l’état » ; meilleure disponibilité raisonnable.</ListItem>
          <ListItem>Nous n’excluons pas nos responsabilités impératives prévues par la loi.</ListItem>
        </List>

        <Typography variant="h4">Résiliation</Typography>
        <Typography>Vous pouvez résilier depuis votre compte. Les sommes déjà échues restent dues.</Typography>

        <Typography variant="h4">Médiation & litiges</Typography>
        <Typography>
          En cas de litige de consommation, vous pouvez recourir au <MuiLink href={MEDIATION_FR} target="_blank">Service de Médiation pour le Consommateur</MuiLink>. Droit applicable : droit belge. Tribunaux compétents : Bruxelles, sauf règle impérative contraire.
        </Typography>
      </>
    ),
    en: (
      <>
        <Typography variant="h4">Scope</Typography>
        <Typography>These terms govern access and use of Nanshe and the sale of subscriptions.</Typography>

        <Typography variant="h4">Account & access</Typography>
        <List>
          <ListItem>One personal account; you are responsible for safeguarding your credentials.</ListItem>
          <ListItem>Permitted use: personal, non‑commercial (unless agreed otherwise in writing).</ListItem>
          <ListItem>User content: you retain your rights; you grant us a technical licence to host and display.</ListItem>
        </List>

        <Typography variant="h4">Subscriptions & prices</Typography>
        <List>
          <ListItem>Prices in EUR, VAT included, shown at checkout. Offers/prices may change.</ListItem>
          <ListItem>Auto‑renew monthly/annually; you may cancel any time before the renewal date.</ListItem>
          <ListItem>Payments via Stripe; we do not store your card data.</ListItem>
        </List>

        <Typography variant="h4">Right of withdrawal (B2C)</Typography>
        <List>
          <ListItem>14 days from subscription.</ListItem>
          <ListItem>If you request immediate performance and the service is fully delivered before the end of the period, you acknowledge losing the withdrawal right.</ListItem>
          <ListItem>For partial performance, a pro‑rata may apply.</ListItem>
        </List>

        <Typography variant="h4">Warranties & liability</Typography>
        <List>
          <ListItem>Service provided “as is”; reasonable best efforts for availability.</ListItem>
          <ListItem>We do not exclude mandatory liabilities under applicable law.</ListItem>
        </List>

        <Typography variant="h4">Termination</Typography>
        <Typography>You can terminate in your account settings. Amounts already due remain payable.</Typography>

        <Typography variant="h4">Consumer mediation & disputes</Typography>
        <Typography>
          For consumer disputes you may contact the <MuiLink href={MEDIATION_EN} target="_blank">Consumer Mediation Service (Belgium)</MuiLink>. Governing law: Belgian law. Competent courts: Brussels, unless mandatory rules provide otherwise.
        </Typography>
      </>
    ),
    nl: (
      <>
        <Typography variant="h4">Toepassing</Typography>
        <Typography>Deze voorwaarden regelen de toegang en het gebruik van Nanshe en de verkoop van abonnementen.</Typography>

        <Typography variant="h4">Account & toegang</Typography>
        <List>
          <ListItem>Persoonlijk account; u bent verantwoordelijk voor uw inloggegevens.</ListItem>
          <ListItem>Toegelaten gebruik: persoonlijk en niet‑commercieel (behalve anders schriftelijk overeengekomen).</ListItem>
          <ListItem>Gebruikersinhoud: u behoudt uw rechten; u verleent ons een technische licentie voor hosting en weergave.</ListItem>
        </List>

        <Typography variant="h4">Abonnementen & prijzen</Typography>
        <List>
          <ListItem>Prijzen in EUR (incl. btw) worden getoond bij de bestelling. Aanbod/prijzen kunnen wijzigen.</ListItem>
          <ListItem>Automatische verlenging per maand/jaar; u kunt vóór de verlengingsdatum opzeggen.</ListItem>
          <ListItem>Betalingen via Stripe; wij bewaren uw kaartgegevens niet.</ListItem>
        </List>

        <Typography variant="h4">Herroepingsrecht (B2C)</Typography>
        <List>
          <ListItem>14 dagen vanaf de inschrijving.</ListItem>
          <ListItem>Als u onmiddellijke uitvoering vraagt en de dienst volledig is geleverd vóór het einde van deze termijn, verliest u uw herroepingsrecht.</ListItem>
          <ListItem>Bij gedeeltelijke uitvoering kan een evenredig bedrag worden aangerekend.</ListItem>
        </List>

        <Typography variant="h4">Waarborgen & aansprakelijkheid</Typography>
        <List>
          <ListItem>Dienst “as is”; redelijke inspanningen voor beschikbaarheid.</ListItem>
          <ListItem>Wij sluiten geen dwingende aansprakelijkheden uit.</ListItem>
        </List>

        <Typography variant="h4">Beëindiging</Typography>
        <Typography>U kunt beëindigen via uw account. Reeds vervallen bedragen blijven verschuldigd.</Typography>

        <Typography variant="h4">Consumentenbemiddeling & geschillen</Typography>
        <Typography>
          Bij consumentengeschillen kunt u contact opnemen met de <MuiLink href={MEDIATION_EN} target="_blank">Consumentenombudsdienst</MuiLink>. Toepasselijk recht: Belgisch recht. Bevoegde rechtbanken: Brussel, behoudens dwingende regels.
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