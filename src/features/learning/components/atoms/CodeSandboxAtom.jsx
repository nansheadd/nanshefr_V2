import React from 'react';
import {
  Alert,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ChecklistRtlOutlinedIcon from '@mui/icons-material/ChecklistRtlOutlined';

const CodeSandboxAtom = ({ atom }) => {
  const content = atom?.content;
  if (!content) {
    return <Alert severity="warning">Instructions de sandbox indisponibles.</Alert>;
  }

  const {
    title,
    language,
    difficulty,
    progression_stage: progressionStage,
    workspace = {},
    security = {},
    checklist = [],
  } = content;

  const setupSteps = workspace?.setup_steps || [];
  const commands = workspace?.commands_to_try || [];
  const securityGuidelines = security?.safe_usage_guidelines || [];

  const renderList = (items, IconComponent = ChecklistRtlOutlinedIcon) => (
    <List dense>
      {items.map((item, index) => (
        <ListItem key={index} sx={{ px: 0 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <IconComponent fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title || 'Espace de pratique sécurisé'}
        </Typography>
        {language && <Chip label={language} size="small" color="primary" />}
        {difficulty && <Chip label={difficulty} size="small" variant="outlined" />}
        {progressionStage?.label && <Chip label={progressionStage.label} size="small" variant="outlined" />}
      </Stack>

      {workspace?.recommended_mode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Mode recommandé : {workspace.recommended_mode}
        </Alert>
      )}

      {setupSteps.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalOutlinedIcon fontSize="small" color="primary" />
            Étapes de mise en route
          </Typography>
          {renderList(setupSteps)}
        </Box>
      )}

      {commands.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalOutlinedIcon fontSize="small" color="primary" />
            Commandes à tester
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 2,
              fontFamily: 'Fira Code, monospace',
              fontSize: '0.95rem',
            }}
          >
            {commands.join('\n')}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {securityGuidelines.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldOutlinedIcon fontSize="small" color="primary" />
            Guidelines de sécurité
          </Typography>
          {renderList(securityGuidelines, ShieldOutlinedIcon)}
        </Box>
      )}

      {checklist.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChecklistRtlOutlinedIcon fontSize="small" color="primary" />
            Checklist avant de démarrer
          </Typography>
          {renderList(checklist)}
        </Box>
      )}
    </Paper>
  );
};

export default CodeSandboxAtom;
