import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button,
  Divider,
  Chip,
  LinearProgress,
  Container,
  Fade,
  Alert,
  Breadcrumbs,
  Link,
  Card,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';
import HomeIcon from '@mui/icons-material/Home';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const LessonComponent = () => {
  const { capsuleId, levelOrder, chapterIndex } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    // Récupérer la leçon depuis sessionStorage
    const storedLesson = sessionStorage.getItem('currentLesson');
    if (storedLesson) {
      const parsedLesson = JSON.parse(storedLesson);
      setLesson(parsedLesson);
      
      // Calculer le temps de lecture estimé (200 mots par minute)
      const wordCount = parsedLesson.lesson_text?.split(' ').length || 0;
      setReadingTime(Math.ceil(wordCount / 200));
    }
  }, []);

  useEffect(() => {
    // Simuler la progression de lecture en fonction du scroll
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollPosition / documentHeight) * 100;
      setProgress(Math.min(scrollPercentage, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToCapsule = () => {
    navigate(`/capsule/${capsuleId}`);
  };

  const handleNextChapter = () => {
    // TODO: Implémenter la navigation vers le chapitre suivant
    const nextChapterIndex = parseInt(chapterIndex) + 1;
    navigate(`/capsule/${capsuleId}/level/${levelOrder}/chapter/${nextChapterIndex}`);
  };

  const handlePreviousChapter = () => {
    // TODO: Implémenter la navigation vers le chapitre précédent
    const prevChapterIndex = parseInt(chapterIndex) - 1;
    if (prevChapterIndex >= 0) {
      navigate(`/capsule/${capsuleId}/level/${levelOrder}/chapter/${prevChapterIndex}`);
    }
  };

  if (!lesson) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Aucune leçon trouvée. Retournez au plan de cours pour sélectionner un chapitre.
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackToCapsule}
          sx={{ mt: 2 }}
        >
          Retour au plan
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Barre de progression fixe en haut */}
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1200,
          height: 6,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            backgroundColor: 'primary.main'
          }
        }} 
      />

      {/* Header fixe avec navigation */}
      <Paper 
        elevation={2} 
        sx={{ 
          position: 'sticky', 
          top: 6, 
          zIndex: 1100,
          borderRadius: 0,
          bgcolor: 'background.paper'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 2,
            px: { xs: 2, md: 0 }
          }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                underline="hover"
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <HomeIcon fontSize="small" />
                Accueil
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleBackToCapsule();
                }}
              >
                Capsule
              </Link>
              <Typography color="text.primary">
                Niveau {levelOrder} - Chapitre {parseInt(chapterIndex) + 1}
              </Typography>
            </Breadcrumbs>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                icon={<TimerIcon />}
                label={`${readingTime} min`}
                size="small"
                variant="outlined"
              />
              {progress === 100 && (
                <Chip 
                  icon={<CheckCircleIcon />}
                  label="Terminé"
                  size="small"
                  color="success"
                />
              )}
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToCapsule}
                variant="outlined"
                size="small"
              >
                Plan du cours
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Contenu principal */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Fade in={true} timeout={600}>
          <Box>
            {/* En-tête de la leçon */}
            <Card sx={{ mb: 4, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <MenuBookIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Niveau {levelOrder} • Chapitre {parseInt(chapterIndex) + 1}
                    </Typography>
                    {lesson.meta?.title && (
                      <Typography variant="h4" fontWeight="bold" color="primary.dark">
                        {lesson.meta.title}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {lesson.meta?.description && (
                  <Typography variant="body1" color="text.secondary">
                    {lesson.meta.description}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Contenu Markdown */}
            <Paper 
              elevation={1}
              sx={{ 
                p: { xs: 3, md: 5 },
                minHeight: '60vh',
                // Styles pour le markdown
                '& h1': { 
                  fontSize: '2rem',
                  fontWeight: 700,
                  mt: 4,
                  mb: 2,
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  pb: 1
                },
                '& h2': { 
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  mt: 4,
                  mb: 2,
                  color: 'primary.dark'
                },
                '& h3': { 
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  mt: 3,
                  mb: 1,
                  color: 'text.primary'
                },
                '& p': { 
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  mb: 2,
                  color: 'text.primary'
                },
                '& ul, & ol': { 
                  pl: 4,
                  mb: 2,
                  '& li': {
                    mb: 1,
                    fontSize: '1.05rem',
                    lineHeight: 1.7
                  }
                },
                '& blockquote': { 
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  pl: 3,
                  py: 1,
                  my: 3,
                  bgcolor: 'grey.50',
                  borderRadius: '0 8px 8px 0',
                  '& p': {
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    mb: 0
                  }
                },
                '& code': {
                  bgcolor: 'grey.100',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  color: 'error.dark'
                },
                '& pre': {
                  bgcolor: 'grey.900',
                  p: 2,
                  borderRadius: 2,
                  overflow: 'auto',
                  my: 3,
                  '& code': {
                    bgcolor: 'transparent',
                    color: 'white',
                    px: 0,
                    py: 0
                  }
                },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  my: 3,
                  '& th, & td': {
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 2,
                    textAlign: 'left'
                  },
                  '& th': {
                    bgcolor: 'grey.100',
                    fontWeight: 600
                  }
                },
                '& hr': {
                  my: 4,
                  borderColor: 'divider'
                }
              }}
            >
              <Markdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {lesson.lesson_text}
              </Markdown>
            </Paper>

            {/* Navigation entre chapitres */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 4,
              gap: 2
            }}>
              <Button
                startIcon={<NavigateBeforeIcon />}
                onClick={handlePreviousChapter}
                variant="outlined"
                disabled={parseInt(chapterIndex) === 0}
                sx={{ flex: 1 }}
              >
                Chapitre précédent
              </Button>
              
              <Button
                endIcon={<NavigateNextIcon />}
                onClick={handleNextChapter}
                variant="contained"
                sx={{ flex: 1 }}
              >
                Chapitre suivant
              </Button>
            </Box>

            {/* Bouton de retour flottant */}
            <IconButton
              onClick={handleBackToCapsule}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                boxShadow: 3,
                zIndex: 1000
              }}
            >
              <HomeIcon />
            </IconButton>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default LessonComponent;