import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const formatDate = (value) => {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return null;
  }
};

const FeatureVoteCard = ({
  feature,
  onVote,
  votingDisabled = false,
  showVoteButton = true,
  actionSlot = null,
}) => {
  const {
    title,
    description,
    votes,
    userHasVoted,
    statusLabel,
    statusColor,
    categoryLabel,
    tags,
    createdAt,
  } = feature;

  const formattedDate = formatDate(createdAt);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderWidth: userHasVoted ? 2 : 1,
        borderColor: (theme) => (userHasVoted ? theme.palette.primary.main : theme.palette.divider),
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
            <Box sx={{ flex: 1 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip
                    label={statusLabel}
                    color={statusColor === 'default' ? 'default' : statusColor}
                    size="small"
                    variant={statusColor === 'default' ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip label={categoryLabel} size="small" variant="outlined" />
                  {tags?.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                )}
              </Stack>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, mx: 1 }} />

            <Stack
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{ minWidth: { xs: '100%', sm: 160 } }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {userHasVoted ? (
                  <ThumbUpAltIcon color="primary" />
                ) : (
                  <ThumbUpAltOutlinedIcon color="action" />
                )}
                <Typography variant="h5" component="span" sx={{ fontWeight: 700 }}>
                  {votes}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {votes > 1 ? 'votes' : 'vote'}
              </Typography>
              {showVoteButton && (
                <Tooltip title={userHasVoted ? 'Retirer mon vote' : 'Je soutiens cette idée'}>
                  <span>
                    <Button
                      fullWidth
                      variant={userHasVoted ? 'contained' : 'outlined'}
                      color="primary"
                      startIcon={<HowToVoteIcon />}
                      onClick={onVote}
                      disabled={votingDisabled}
                    >
                      {userHasVoted ? 'Je me retire' : 'Je vote'}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {formattedDate && (
            <Typography variant="caption" color="text.secondary">
              Proposée le {formattedDate}
            </Typography>
          )}

          {actionSlot}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FeatureVoteCard;
