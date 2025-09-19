import * as React from 'react';
import { Container, Box, Typography, Divider, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { useAppLanguage } from './_useAppLanguage';


interface LegalLayoutProps {
title: { fr: string; en: string; nl: string };
updatedAt?: string; // ISO date string
children: React.ReactNode;
}


export default function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
const lang = useAppLanguage();
const t = {
fr: { home: 'Accueil', updated: 'Dernière mise à jour' },
en: { home: 'Home', updated: 'Last updated' },
nl: { home: 'Start', updated: 'Laatst bijgewerkt' }
}[lang];


const formattedDate = updatedAt
? new Date(updatedAt).toLocaleDateString(lang === 'nl' ? 'nl-BE' : lang === 'fr' ? 'fr-BE' : 'en-BE', {
year: 'numeric', month: 'long', day: 'numeric'
})
: undefined;


return (
<Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
<Breadcrumbs sx={{ mb: 2 }}>
<MuiLink underline="hover" color="inherit" href="/">
{t.home}
</MuiLink>
<Typography color="text.primary">{title[lang]}</Typography>
</Breadcrumbs>


<Typography variant="h3" fontWeight={800} gutterBottom>
{title[lang]}
</Typography>
{formattedDate && (
<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
{t.updated}: {formattedDate}
</Typography>
)}
<Divider sx={{ mb: 3 }} />
<Box sx={{ '& h4': { mt: 3 }, '& p': { mt: 1 }, '& ul': { pl: 3 }, '& li': { mb: 0.5 } }}>
{children}
</Box>
</Container>
);
}