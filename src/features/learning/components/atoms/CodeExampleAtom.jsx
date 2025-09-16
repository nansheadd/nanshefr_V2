import React from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Alert, Chip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const CodeExampleAtom = ({ atom }) => {
  if (!atom?.content) {
    return <Alert severity="warning">Exemple de code non disponible.</Alert>;
  }

  const { description, code, language, explanation } = atom.content;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code || '');
    } catch (e) {
      console.error('Impossible de copier le code', e);
    }
  };

  return (
    <Paper
      sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}
      elevation={0}
      data-coach-section="lesson"
    >
      {description && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}

      <Box sx={{ position: 'relative', mb: 2 }}>
        <Tooltip title="Copier le code">
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            p: 3,
            borderRadius: 2,
            overflowX: 'auto',
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.95rem',
          }}
        >
          <code>
            {code || '// Exemple non fourni'}
          </code>
        </Box>
      </Box>

      {explanation && (
        <Typography variant="body2" color="text.secondary">
          {explanation}
        </Typography>
      )}

      {language && (
        <Chip label={language} size="small" sx={{ mt: 2 }} />
      )}
    </Paper>
  );
};

export default CodeExampleAtom;
