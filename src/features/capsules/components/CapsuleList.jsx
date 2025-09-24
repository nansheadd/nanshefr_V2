import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, 
  IconButton, Chip, Fade, alpha, TextField, InputAdornment, Button,
  Paper, CardActions, Container, Skeleton, Stack, Collapse,
  Badge, Tooltip, Zoom
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Icons
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

// Domain Icons
import LanguageIcon from '@mui/icons-material/Language';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessIcon from '@mui/icons-material/Business';
import ComputerIcon from '@mui/icons-material/Computer';
import BrushIcon from '@mui/icons-material/Brush';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import CreateCapsuleModal from './CreateCapsuleModal';
import { useI18n } from '../../../i18n/I18nContext';
import {
  enrollInCapsule,
  fetchPublicCapsules,
} from '../api/capsulesApi';

const DOMAIN_CONFIG = {
  languages: {
    icon: LanguageIcon,
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    labelKey: 'capsuleList.domains.languages.label',
    descriptionKey: 'capsuleList.domains.languages.description',
  },
  social_sciences: {
    icon: AccountBalanceIcon,
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #1976d2 100%)',
    labelKey: 'capsuleList.domains.social_sciences.label',
    descriptionKey: 'capsuleList.domains.social_sciences.description',
  },
  natural_sciences: {
    icon: ScienceIcon,
    color: '#FF5722',
    gradient: 'linear-gradient(135deg, #FF5722 0%, #e64a19 100%)',
    labelKey: 'capsuleList.domains.natural_sciences.label',
    descriptionKey: 'capsuleList.domains.natural_sciences.description',
  },
  mathematics: {
    icon: CalculateIcon,
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #7b1fa2 100%)',
    labelKey: 'capsuleList.domains.mathematics.label',
    descriptionKey: 'capsuleList.domains.mathematics.description',
  },
  economics: {
    icon: BusinessIcon,
    color: '#FFC107',
    gradient: 'linear-gradient(135deg, #FFC107 0%, #ffa000 100%)',
    labelKey: 'capsuleList.domains.economics.label',
    descriptionKey: 'capsuleList.domains.economics.description',
  },
  personal_development: {
    icon: PsychologyIcon,
    color: '#E91E63',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #c2185b 100%)',
    labelKey: 'capsuleList.domains.personal_development.label',
    descriptionKey: 'capsuleList.domains.personal_development.description',
  },
  programming: {
    icon: ComputerIcon,
    color: '#607D8B',
    gradient: 'linear-gradient(135deg, #607D8B 0%, #455a64 100%)',
    labelKey: 'capsuleList.domains.programming.label',
    descriptionKey: 'capsuleList.domains.programming.description',
  },
  arts: {
    icon: BrushIcon,
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #f57c00 100%)',
    labelKey: 'capsuleList.domains.arts.label',
    descriptionKey: 'capsuleList.domains.arts.description',
  },
  music: {
    icon: MusicNoteIcon,
    color: '#3F51B5',
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #303f9f 100%)',
    labelKey: 'capsuleList.domains.music.label',
    descriptionKey: 'capsuleList.domains.music.description',
  },
  gaming: {
    icon: SportsEsportsIcon,
    color: '#00BCD4',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #0097a7 100%)',
    labelKey: 'capsuleList.domains.gaming.label',
    descriptionKey: 'capsuleList.domains.gaming.description',
  },
  others: {
    icon: SchoolIcon,
    color: '#9E9E9E',
    gradient: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
    labelKey: 'capsuleList.domains.others.label',
    descriptionKey: 'capsuleList.domains.others.description',
  },
};

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 28,
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'scale(1.02)',
    }
  }
}));

const DomainCard = styled(Card)(() => ({
  borderRadius: 20,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    '& .domain-icon': {
      animation: `${pulse} 0.6s ease-in-out`,
    },
    '& .expand-icon': {
      transform: 'rotate(180deg)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'inherit',
  }
}));

const CapsuleCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  animation: `${slideIn} 0.5s ease-out`,
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.shadows[8],
  }
}));

const StatsChip = styled(Chip)(() => ({
  fontWeight: 'bold',
  borderRadius: 12,
  backdropFilter: 'blur(10px)',
}));

const DomainBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 14,
    top: 14,
    padding: '0 6px',
    fontWeight: 'bold',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[2],
  }
}));

const CapsuleList = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDomains, setExpandedDomains] = useState(new Set());
  const [bookmarkedCapsules, setBookmarkedCapsules] = useState(new Set());
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [creationStatus, setCreationStatus] = useState({ phase: 'idle' });

  useEffect(() => {
    if (location.state?.openCreate) {
      setCreateModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Fetch public capsules
  const {
    data: capsuleResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['capsules', 'public'],
    queryFn: fetchPublicCapsules,
    enabled: isAuthenticated,
  });

  const capsules = useMemo(() => capsuleResponse?.items ?? [], [capsuleResponse]);

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: (capsuleId) => enrollInCapsule(capsuleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capsules', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['capsules', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['my-capsules'] });
    },
  });

  // Group capsules by domain
  const capsulesByDomain = useMemo(() => {
    if (!capsules) return {};
    
    const grouped = {};
    capsules.forEach(capsule => {
      const domain = capsule.domain || 'others';
      if (!grouped[domain]) {
        grouped[domain] = [];
      }
      grouped[domain].push(capsule);
    });
    
    return grouped;
  }, [capsules]);

  // Filter domains based on search
  const filteredDomains = useMemo(() => {
    if (!searchQuery) return Object.keys(capsulesByDomain);

    const query = searchQuery.toLowerCase();
    return Object.keys(capsulesByDomain).filter((domain) => {
      const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.others;
      const label = t(config.labelKey).toLowerCase();
      if (domain.toLowerCase().includes(query) || label.includes(query)) {
        return true;
      }
      return capsulesByDomain[domain].some((capsule) =>
        capsule.title.toLowerCase().includes(query) ||
        capsule.area?.toLowerCase().includes(query)
      );
    });
  }, [capsulesByDomain, searchQuery, t]);

  // Filter capsules within a domain based on search
  const getFilteredCapsules = (domain) => {
    if (!searchQuery) return capsulesByDomain[domain] || [];
    
    const query = searchQuery.toLowerCase();
    return (capsulesByDomain[domain] || []).filter(capsule =>
      capsule.title.toLowerCase().includes(query) ||
      capsule.area?.toLowerCase().includes(query) ||
      domain.toLowerCase().includes(query)
    );
  };

  // Toggle domain expansion
  const toggleDomain = (domain) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedDomains(newExpanded);
  };

  // Toggle bookmark
  const toggleBookmark = (capsuleId, event) => {
    event.stopPropagation();
    const newBookmarks = new Set(bookmarkedCapsules);
    if (newBookmarks.has(capsuleId)) {
      newBookmarks.delete(capsuleId);
    } else {
      newBookmarks.add(capsuleId);
    }
    setBookmarkedCapsules(newBookmarks);
  };

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {t('errors.generic')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography
          variant="h3"
          gutterBottom 
          fontWeight="bold"
          sx={{ 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#2196F3' }} />
          {t('capsuleList.title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {t('capsuleList.subtitle')}
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setCreateModalOpen(true)}
          sx={{ mb: 4 }}
        >
          {t('capsuleList.createButton')}
        </Button>

        {/* Search Bar */}
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <SearchBar
            fullWidth
            placeholder={t('capsuleList.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Quick Stats */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <StatsChip
            label={`${Object.keys(capsulesByDomain).length} ${t('capsuleList.stats.domains')}`}
            color="primary"
            variant="outlined"
          />
          <StatsChip
            label={`${capsules?.length || 0} ${t('capsuleList.stats.capsules')}`}
            color="secondary"
            variant="outlined"
          />
          <StatsChip
            label={`${expandedDomains.size} ${t('capsuleList.stats.expanded')}`}
            variant="outlined"
          />
        </Stack>
      </Box>

      {creationStatus.phase === 'classifying' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('capsuleList.statusMessages.classifying')}
        </Alert>
      )}
      {creationStatus.phase === 'creating' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('capsuleList.statusMessages.creating')}
        </Alert>
      )}
      {creationStatus.phase === 'created' && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setCreationStatus({ phase: 'idle' })}>
          {t('capsuleList.statusMessages.created')}
        </Alert>
      )}
      {creationStatus.phase === 'error' && creationStatus.message && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setCreationStatus({ phase: 'idle' })}>
          {creationStatus.message}
        </Alert>
      )}

      {/* Domains Grid */}
      <Grid container spacing={3}>
        {isLoading ? (
          // Loading skeletons
          [...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          ))
        ) : filteredDomains.length > 0 ? (
          filteredDomains.map((domain, index) => {
            const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.others;
            const Icon = config.icon;
            const domainCapsules = getFilteredCapsules(domain);
            const isExpanded = expandedDomains.has(domain);
            const label = t(config.labelKey);
            const description = t(config.descriptionKey);

            return (
              <Grid item xs={12} key={domain}>
                <Fade in timeout={200 + index * 50}>
                  <Box>
                    {/* Domain Card */}
                    <DomainBadge badgeContent={domainCapsules.length}>
                      <DomainCard
                        onClick={() => toggleDomain(domain)}
                        sx={{
                          background: config.gradient,
                          color: 'white',
                          mb: isExpanded ? 2 : 0,
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item>
                              <Box
                                className="domain-icon"
                                sx={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(255,255,255,0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Icon sx={{ fontSize: 36 }} />
                              </Box>
                            </Grid>
                            <Grid item xs>
                              <Typography variant="h5" fontWeight="bold">
                                {label}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {description}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <IconButton 
                                className="expand-icon"
                                sx={{ 
                                  color: 'white',
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                  transition: 'transform 0.3s',
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                }}
                              >
                                <ExpandMoreIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </DomainCard>
                    </DomainBadge>

                    {/* Capsules List - Collapsible */}
                    <Collapse in={isExpanded} timeout="auto">
                      <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                        <Grid container spacing={2}>
                          {domainCapsules.map((capsule, capsuleIndex) => (
                            <Grid item xs={12} sm={6} md={4} key={capsule.id}>
                              <Zoom in timeout={300 + capsuleIndex * 50}>
                                <CapsuleCard>
                                  <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                      <Typography 
                                        variant="h6" 
                                        component={RouterLink}
                                        to={`/capsules/${capsule.domain}/${capsule.area}/${capsule.id}`}
                                        sx={{ 
                                          textDecoration: 'none',
                                          color: 'text.primary',
                                          flex: 1,
                                          fontWeight: 600,
                                          '&:hover': { 
                                            color: config.color,
                                          }
                                        }}
                                      >
                                        {capsule.title}
                                      </Typography>
                                      <IconButton 
                                        size="small"
                                        onClick={(e) => toggleBookmark(capsule.id, e)}
                                      >
                                        {bookmarkedCapsules.has(capsule.id) ? 
                                          <BookmarkIcon color="primary" /> : 
                                          <BookmarkBorderIcon />
                                        }
                                      </IconButton>
                                    </Box>

                                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                      {capsule.area && (
                                        <Chip 
                                          label={capsule.area} 
                                          size="small" 
                                          variant="outlined"
                                          sx={{ borderColor: config.color, color: config.color }}
                                        />
                                      )}
                                      {capsule.main_skill && (
                                        <Chip 
                                          label={capsule.main_skill} 
                                          size="small"
                                          sx={{ 
                                            backgroundColor: alpha(config.color, 0.1),
                                            color: config.color,
                                            fontWeight: 500
                                          }}
                                        />
                                      )}
                                    </Stack>

                                    {capsule.description && (
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ 
                                          mb: 2,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                        }}
                                      >
                                        {capsule.description}
                                      </Typography>
                                    )}
                                  </CardContent>
                                  
                                  <CardActions sx={{ px: 2, pb: 2 }}>
                                    <Button
                                      fullWidth
                                      variant="contained"
                                      size="small"
                                      endIcon={<ArrowForwardIcon />}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        enrollMutation.mutate(capsule.id);
                                      }}
                                      disabled={enrollMutation.isPending}
                                      sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        background: config.gradient,
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                        }
                                      }}
                                    >
                                      {t('capsuleList.actions.enroll')}
                                    </Button>
                                  </CardActions>
                                </CapsuleCard>
                              </Zoom>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Collapse>
                  </Box>
                </Fade>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {t('capsuleList.noResults.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? t('capsuleList.noResults.search') : t('capsuleList.noResults.empty')}
              </Typography>
              {searchQuery && (
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => setSearchQuery('')}
                  startIcon={<ClearIcon />}
                >
                  {t('capsuleList.noResults.reset')}
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      <CreateCapsuleModal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onStatus={(status) => setCreationStatus(status)}
        onCreated={(capsule) => {
          setCreateModalOpen(false);
          setCreationStatus({ phase: 'created' });
          navigate(`/capsule/${capsule.domain}/${capsule.area}/${capsule.id}/plan`);
        }}
        currentUser={user}
      />
    </Container>
  );
};

export default CapsuleList;
