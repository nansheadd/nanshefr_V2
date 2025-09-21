import React from 'react';
import {
  Alert,
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';

const CodeProjectBriefAtom = ({ atom }) => {
  const content = atom?.content;
  if (!content) {
    return <Alert severity="warning">Brief de projet indisponible.</Alert>;
  }

  const {
    title,
    summary,
    language,
    difficulty,
    progression_stage: progressionStage,
    objectives = [],
    milestones = [],
    deliverables = [],
    extension_ideas: extensions = [],
  } = content;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {title || 'Projet de validation'}
        </Typography>
        {language && <Chip label={language} size="small" color="primary" />}
        {difficulty && <Chip label={difficulty} size="small" variant="outlined" />}
        {progressionStage?.label && <Chip label={progressionStage.label} size="small" variant="outlined" />}
      </Stack>

      {summary && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {summary}
        </Alert>
      )}

      {objectives.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChecklistOutlinedIcon fontSize="small" color="primary" />
            Objectifs pédagogiques
          </Typography>
          <List dense>
            {objectives.map((objective, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AssignmentTurnedInOutlinedIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary={objective} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {milestones.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineOutlinedIcon fontSize="small" color="primary" />
            Jalons proposés
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {milestones.map((milestone, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    {milestone.label || `Étape ${index + 1}`}
                  </Typography>
                  <List dense>
                    {(milestone.steps || []).map((step, stepIndex) => (
                      <ListItem key={stepIndex} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <ChecklistOutlinedIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={step} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {deliverables.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentTurnedInOutlinedIcon fontSize="small" color="primary" />
            Livrables attendus
          </Typography>
          <List dense>
            {deliverables.map((deliverable, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText primary={deliverable} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {extensions.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiObjectsOutlinedIcon fontSize="small" color="primary" />
              Pour aller plus loin
            </Typography>
            <List dense>
              {extensions.map((idea, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText primary={idea} />
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default CodeProjectBriefAtom;
