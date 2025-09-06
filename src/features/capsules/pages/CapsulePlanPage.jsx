import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert, 
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import apiClient from '../../../api/axiosConfig';

const fetchCapsuleDetails = async (capsuleId) => {
  const { data } = await apiClient.get(`/capsules/${capsuleId}`);
  return data;
};

const CapsulePlanPage = () => {
  const { domain, area, id: capsuleId } = useParams();
  const navigate = useNavigate();
  
  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const [selectedChapter, setSelectedChapter] = useState(null);

  const { data: capsule, isLoading, isError } = useQuery({
    queryKey: ['capsule', domain, area, capsuleId],
    queryFn: () => fetchCapsuleDetails(domain, area, capsuleId),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.generation_status === 'pending' ? 3000 : false;
    },
    enabled: !!capsuleId, 
  });

  // Mutation pour créer un chapitre
  const createChapterMutation = useMutation({
    mutationFn: async ({ levelOrder, chapterIndex }) => {
      const response = await apiClient.post(`/capsules/${capsuleId}/level/${levelOrder}/molecule/${chapterIndex}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Rediriger vers la page de la leçon
      if (data && data.lesson) {
        // Stocker la leçon dans sessionStorage pour la récupérer sur la nouvelle page
        sessionStorage.setItem('currentLesson', JSON.stringify(data.lesson));
        
        // Naviguer vers la nouvelle route
        navigate(`/capsule/${capsuleId}/level/${variables.levelOrder}/chapter/${variables.chapterIndex}`);
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la création du chapitre:', error);
    }
  });

  const handleStartLevel = (levelOrder) => {
    // Démarrer au premier chapitre du niveau
    handleChapterClick(levelOrder, 0, capsule?.learning_plan_json?.levels?.[levelOrder-1]?.chapters?.[0]?.chapter_title);
  };

  const toggleLevelExpansion = (levelOrder) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelOrder)) {
      newExpanded.delete(levelOrder);
    } else {
      newExpanded.add(levelOrder);
    }
    setExpandedLevels(newExpanded);
  };

  const handleChapterClick = (levelOrder, chapterIndex, chapterTitle) => {
    setSelectedChapter({ levelOrder, chapterIndex, chapterTitle });
    createChapterMutation.mutate({ levelOrder, chapterIndex });
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
  
  if (isError) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">Impossible de charger les détails de la capsule.</Alert>
    </Box>
  );

  if (!capsule) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Chargement de la capsule...</Typography>
      </Box>
    );
  }

  const isGenerating = capsule?.generation_status === 'pending';
  const learningPlan = capsule?.learning_plan_json;

  return (
    <Box sx={{ p: 3, maxWidth: '900px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {capsule.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {capsule.domain} • {capsule.area}
        </Typography>
      </Box>
      
      {/* Statut de génération */}
      {isGenerating && (
        <Box sx={{ mb: 4 }}>
          <Alert severity="info">
            <Typography>Génération du plan de cours en cours...</Typography>
          </Alert>
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
      )}

      {/* Plan d'apprentissage */}
      {learningPlan && (
        <>
          {/* Vue d'ensemble */}
          {learningPlan.overview && (
            <Card sx={{ mb: 4, bgcolor: 'background.paper', boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vue d'ensemble
                </Typography>
                <Typography variant="body2" paragraph>
                  {learningPlan.overview.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Chip label={`${learningPlan.levels?.length || 0} niveaux`} size="small" />
                  <Chip 
                    label={`${learningPlan.levels?.reduce((acc, level) => acc + (level.chapters?.length || 0), 0)} chapitres`} 
                    size="small" 
                  />
                  <Chip label={learningPlan.overview.duree_estimee} size="small" color="primary" />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Bouton principal */}
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => handleStartLevel(1)}
            sx={{ mb: 4, width: '100%', py: 1.5 }}
          >
            Commencer l'apprentissage
          </Button>
          
          {/* Liste des niveaux avec chapitres */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Programme détaillé
          </Typography>
          
          {learningPlan.levels?.map((level) => {
            const chapters = level.chapters || [];
            const isExpanded = expandedLevels.has(level.level_order);
            
            return (
              <Card 
                key={level.level_order} 
                sx={{ 
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ pb: isExpanded ? 0 : 2 }}>
                  {/* En-tête du niveau */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleLevelExpansion(level.level_order)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={`Niveau ${level.level_order}`} 
                        color="primary" 
                        variant="outlined"
                        size="small"
                      />
                      <Typography variant="h6">
                        {level.level_title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {chapters.length} chapitre{chapters.length > 1 ? 's' : ''}
                      </Typography>
                      <IconButton size="small">
                        {isExpanded ? <KeyboardArrowDownIcon /> : <ChevronRightIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Liste des chapitres (collapsible) */}
                  <Collapse in={isExpanded}>
                    <List sx={{ mt: 2 }}>
                      {chapters.map((chapter, chapterIndex) => (
                        <ListItem 
                          key={chapterIndex}
                          disablePadding
                          sx={{ 
                            borderLeft: '3px solid transparent',
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderLeftColor: 'primary.main',
                              bgcolor: 'action.hover'
                            },
                            ...(selectedChapter?.levelOrder === level.level_order && 
                                selectedChapter?.chapterIndex === chapterIndex && {
                              borderLeftColor: 'primary.main',
                              bgcolor: 'primary.50'
                            })
                          }}
                        >
                          <ListItemButton 
                            onClick={() => handleChapterClick(
                              level.level_order, 
                              chapterIndex, 
                              chapter.chapter_title
                            )}
                            disabled={createChapterMutation.isLoading}
                          >
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {level.level_order}.{chapterIndex + 1}
                                  </Typography>
                                  <Typography variant="body1">
                                    {chapter.chapter_title}
                                  </Typography>
                                  {createChapterMutation.isLoading && 
                                   selectedChapter?.levelOrder === level.level_order && 
                                   selectedChapter?.chapterIndex === chapterIndex && (
                                    <CircularProgress size={16} />
                                  )}
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </CardContent>

                {/* Actions du niveau */}
                {!isExpanded && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartLevel(level.level_order);
                      }}
                    >
                      Démarrer ce niveau
                    </Button>
                  </Box>
                )}
              </Card>
            );
          })}
        </>
      )}
    </Box>
  );
};

export default CapsulePlanPage;
