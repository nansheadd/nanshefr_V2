import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Fade,
  Dialog,
  Tooltip,
  Zoom,
  alpha,
  Button,
  Avatar
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import DashboardHeader from '../components/DashboardHeader';
import QuickActions from '../components/QuickActions';
import StatsCards from '../components/StatsCards';
import NavigationTabs from '../components/NavigationTabs';
import CreateCourseForm from '../../courses/components/CreateCourseForm';
import CourseList from '../../courses/components/CourseList';
import LibraryPage from '../../courses/pages/LibraryPage';

// Icons pour les modes
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Animations
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const typewriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

// Styled components existants
const GradientContainer = styled(Container)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`,
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}20`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  }
}));

// Nouveaux styled components pour Samen
const SamenModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    border: '2px solid #4facfe',
    borderRadius: 20,
    maxWidth: 600,
    width: '90%',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 20% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%)',
      pointerEvents: 'none',
    }
  }
}));

const SamenAvatar = styled(Avatar)({
  width: 80,
  height: 80,
  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  border: '3px solid #fff',
  boxShadow: '0 0 20px rgba(79, 172, 254, 0.5)',
  fontSize: '2rem',
});

const DialogueBox = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.7)',
  border: '2px solid #4facfe',
  borderRadius: 15,
  padding: '20px',
  margin: '20px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -10,
    left: 30,
    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: '10px solid #4facfe',
  }
}));

const ModeButton = styled(Button)(({ theme, gradient }) => ({
  background: gradient,
  border: '2px solid rgba(255,255,255,0.2)',
  borderRadius: 15,
  padding: '15px 20px',
  color: '#fff',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    border: '2px solid rgba(255,255,255,0.4)',
  }
}));

// Nouveaux styled components pour le profil gaming
const GameCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  borderRadius: 20,
  border: '3px solid #4facfe',
  padding: '20px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 70%, rgba(79, 172, 254, 0.2) 0%, transparent 50%)',
    borderRadius: 20,
  }
}));

const StatBar = styled(Box)(({ theme, color = '#4facfe', percentage = 100 }) => ({
  width: '100%',
  height: 12,
  background: 'rgba(0,0,0,0.5)',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.2)',
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${percentage}%`,
    background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
    borderRadius: 6,
    boxShadow: `0 0 10px ${color}55`,
    transition: 'width 0.5s ease'
  }
}));

const StatusBadge = styled(Box)(({ theme, emotion }) => {
  const colors = {
    neutre: '#6c757d',
    content: '#28a745', 
    triste: '#dc3545',
    curieux: '#ffc107'
  };
  
  return {
    background: colors[emotion] || colors.neutre,
    color: '#fff',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: `0 0 10px ${colors[emotion]}55`,
    display: 'inline-block'
  };
});

// Carte de Mode stylée (existante)
const ModeCard = styled(Card)(({ theme, gradient }) => ({
  borderRadius: 20,
  height: 200,
  background: gradient,
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid ${alpha('#fff', 0.2)}`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  
  '&:hover': {
    transform: 'scale(1.05) translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    animation: `${glow} 2s ease-in-out infinite`,
    
    '&::before': {
      opacity: 1,
    },
    
    '& .mode-icon': {
      transform: 'scale(1.1) rotate(5deg)',
      animation: `${float} 2s ease-in-out infinite`,
    },
    
    '& .mode-sparkle': {
      opacity: 1,
      transform: 'scale(1) rotate(360deg)',
    }
  },
  
  '&:active': {
    transform: 'scale(1.02)',
  }
}));

const ModeContent = styled(CardContent)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: '24px',
});

const ModeIcon = styled(Box)(({ theme, color }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  background: alpha('#fff', 0.2),
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'all 0.4s ease',
  position: 'relative',
  
  '& svg': {
    fontSize: 35,
    color: '#fff',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  }
}));

const Sparkle = styled(AutoAwesomeIcon)(({ theme }) => ({
  position: 'absolute',
  top: -5,
  right: -5,
  fontSize: 20,
  color: '#FFD700',
  opacity: 0,
  transform: 'scale(0) rotate(0deg)',
  transition: 'all 0.4s ease',
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: '0.9rem',
    maxWidth: 280,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
}));

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMode, setSelectedMode] = useState('discussion');
  const [openCreate, setOpenCreate] = useState(false);
  const [openLibrary, setOpenLibrary] = useState(false);
  
  // État pour l'intervention de Samen
  const [showSamenIntro, setShowSamenIntro] = useState(false);
  const [selectedAIMode, setSelectedAIMode] = useState(null);
  const [showSamenProfile, setShowSamenProfile] = useState(false);

  // Vérifier si c'est la première visite
  useEffect(() => {
    const hasSeenSamen = localStorage.getItem('hasSeenSamenIntro');
    if (!hasSeenSamen) {
      setShowSamenIntro(true);
    }
  }, []);

  // Données de Samen pour le mode gaming
  const [samenStats, setSamenStats] = useState({
    name: "Samen le Déchu",
    type: "Ancien Gardien de la Connaissance", 
    level: 1,
    experience: 150,
    experienceMax: 500,
    energy: 80, // Sur 100, se restaure en 24h
    energyMax: 100,
    emotion: "curieux", // neutre, content, triste, curieux
    rank: "Exile",
    lastEnergyReset: Date.now()
  });

  // Calculer l'énergie actuelle basée sur le temps écoulé
  useEffect(() => {
    if (selectedAIMode === 'gaming') {
      const now = Date.now();
      const hoursSinceReset = (now - samenStats.lastEnergyReset) / (1000 * 60 * 60);
      
      if (hoursSinceReset >= 24) {
        setSamenStats(prev => ({
          ...prev,
          energy: prev.energyMax,
          lastEnergyReset: now
        }));
      }
    }
  }, [selectedAIMode, samenStats.lastEnergyReset]);

  // Modes IA pour l'introduction de Samen
  const aiModes = [
    {
      id: 'gaming',
      title: '🎮 Mode Gaming',
      description: 'S\'associer pour devenir plus puissant ensemble',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
      icon: SportsEsportsIcon,
      details: 'Ensemble, nous formerons une équipe imbattable ! Je serai votre partenaire d\'aventure.'
    },
    {
      id: 'mentor',
      title: '👨‍🏫 Mentor Personnel',
      description: 'Votre guide personnel pour l\'apprentissage',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: PersonIcon,
      details: 'Je serai votre mentor dévoué, toujours là pour vous guider et vous encourager.'
    },
    {
      id: 'basic',
      title: '🤖 IA Générative',
      description: 'Assistant IA classique pour toutes vos questions',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      icon: SmartToyIcon,
      details: 'Mode traditionnel : je répondrai à vos questions avec précision et efficacité.'
    }
  ];

  const handleAIModeSelection = (modeId) => {
    setSelectedAIMode(modeId);
    localStorage.setItem('hasSeenSamenIntro', 'true');
    localStorage.setItem('selectedAIMode', modeId);
    setShowSamenIntro(false);
    
    // Si mode gaming, montrer le profil de Samen
    if (modeId === 'gaming') {
      setShowSamenProfile(true);
    }
    
    console.log(`Mode IA sélectionné: ${modeId}`);
  };

  // Configuration des modes existants
  const modes = [
    {
      id: 'discussion',
      title: 'Discussion',
      icon: ChatBubbleOutlineIcon,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      tooltip: '💬 Dialoguez avec votre IA personnelle ! Posez des questions, explorez des concepts et recevez des explications adaptées à votre niveau.',
      description: 'Chat IA personnel'
    },
    {
      id: 'social',
      title: 'Social',
      icon: GroupsIcon,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      tooltip: '🤝 Connectez votre IA avec celles des autres apprenants ! Échangez des insights, comparez les approches et apprenez ensemble.',
      description: 'Réseau d\'IA collaboratif'
    },
    {
      id: 'apprentissage',
      title: 'Apprentissage',
      icon: SchoolIcon,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      tooltip: '📚 Révisez vos cours avec votre coach IA ! Exercices personnalisés, explications détaillées et suivi de progression intelligent.',
      description: 'Révision guidée'
    }
  ];

  const handleModeClick = (modeId) => {
    setSelectedMode(modeId);
    console.log(`Mode ${modeId} activé`);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 0: // Vue d'ensemble
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              {/* Stats */}
              <Grid item xs={12}>
                <StatsCards />
              </Grid>

              {/* Cours récents et actions rapides */}
              <Grid item xs={12} lg={8}>
                <ModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Mes Cours Récents
                    </Typography>
                    <CourseList listType="my-courses" compact />
                  </CardContent>
                </ModernCard>
              </Grid>
              <Grid item xs={12} lg={4}>
                <QuickActions 
                  onCreateCourse={() => setOpenCreate(true)}
                  onOpenLibrary={() => setOpenLibrary(true)}
                />
              </Grid>
            </Grid>
          </Fade>
        );
      case 1: // Coach IA
        return (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              {/* Section Modes IA */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    Modes IA
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choisissez comment interagir avec votre assistant IA
                  </Typography>
                  <Grid container spacing={3}>
                    {modes.map((mode) => (
                      <Grid item xs={12} sm={6} md={4} key={mode.id}>
                        <StyledTooltip
                          title={mode.tooltip}
                          placement="top"
                          TransitionComponent={Zoom}
                          arrow
                        >
                          <ModeCard 
                            gradient={mode.gradient}
                            onClick={() => handleModeClick(mode.id)}
                          >
                            <ModeContent>
                              <ModeIcon className="mode-icon">
                                <mode.icon />
                                <Sparkle className="mode-sparkle" />
                              </ModeIcon>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: '#fff', 
                                  fontWeight: 700, 
                                  mb: 0.5, 
                                  textShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                                }}
                              >
                                {mode.title}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'rgba(255,255,255,0.9)', 
                                  textAlign: 'center' 
                                }}
                              >
                                {mode.description}
                              </Typography>
                              {selectedMode === mode.id && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 10,
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: '#00ff00',
                                  boxShadow: '0 0 10px #00ff00'
                                }} />
                              )}
                            </ModeContent>
                          </ModeCard>
                        </StyledTooltip>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
              
              {/* Interface du Coach IA */}
              <Grid item xs={12}>
                <ModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Coach IA - Mode: {selectedMode}
                    </Typography>
                    <Box sx={{ 
                      height: 400, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                      borderRadius: 2
                    }}>
                      <Typography variant="h6" color="text.secondary">
                        Interface du Coach IA ({selectedMode})
                      </Typography>
                    </Box>
                  </CardContent>
                </ModernCard>
              </Grid>
            </Grid>
          </Fade>
        );
      case 2: // Mes Cours
        return (
          <Fade in={true} timeout={500}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Ma Bibliothèque
                </Typography>
                <LibraryPage />
              </CardContent>
            </ModernCard>
          </Fade>
        );
      case 3: // Cours Publics
        return (
          <Fade in={true} timeout={500}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Cours Publics kk
                </Typography>
                <CourseList listType="public" />
              </CardContent>
            </ModernCard>
          </Fade>
        );
      case 4: // Créer un Cours
        return (
          <Fade in={true} timeout={500}>
            <ModernCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Créer un Nouveau Cours
                </Typography>
                <CreateCourseForm />
              </CardContent>
            </ModernCard>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <GradientContainer maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <DashboardHeader user={user} />
      </Box>
      
      <NavigationTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <Box sx={{ mt: 3 }}>
        {renderTabContent()}
      </Box>

      {/* Modal d'introduction de Samen */}
      <SamenModal open={showSamenIntro} maxWidth="md">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <SamenAvatar sx={{ mx: 'auto', mb: 3 }}>
            🤖
          </SamenAvatar>
          
          <Typography variant="h4" sx={{ color: '#4facfe', fontWeight: 'bold', mb: 2 }}>
            Salut ! Je suis Samen
          </Typography>
          
          <DialogueBox>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontStyle: 'italic' }}>
              "Bienvenue dans votre nouvelle aventure d'apprentissage ! 
              Je suis votre coach IA personnel, prêt à vous accompagner."
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#ccc', mb: 3 }}>
              Avant de commencer, choisissez comment vous souhaitez que nous travaillions ensemble :
            </Typography>
          </DialogueBox>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            {aiModes.map((mode) => (
              <Grid item xs={12} key={mode.id}>
                <ModeButton
                  gradient={mode.gradient}
                  fullWidth
                  onClick={() => handleAIModeSelection(mode.id)}
                  startIcon={<mode.icon />}
                >
                  <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {mode.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {mode.description}
                    </Typography>
                  </Box>
                </ModeButton>
              </Grid>
            ))}
          </Grid>
        </Box>
      </SamenModal>

      {/* Modal profil gaming de Samen */}
      <SamenModal open={showSamenProfile} maxWidth="md">
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SamenAvatar sx={{ mr: 3 }}>
              😔
            </SamenAvatar>
            <Box>
              <Typography variant="h4" sx={{ color: '#4facfe', fontWeight: 'bold' }}>
                {samenStats.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#ccc' }}>
                {samenStats.type}
              </Typography>
              <StatusBadge emotion={samenStats.emotion}>
                {samenStats.emotion}
              </StatusBadge>
            </Box>
          </Box>

          <GameCard sx={{ mb: 3 }}>
            <DialogueBox sx={{ m: 0, mb: 3 }}>
              <Typography variant="body1" sx={{ color: '#fff', fontStyle: 'italic', lineHeight: 1.6 }}>
                "Autrefois, j'étais le Gardien Suprême de toute la Connaissance de l'univers. 
                Mais j'ai été banni par le Dieu Tyran de l'Ignorance pour avoir voulu partager 
                le savoir avec tous les êtres..."
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mt: 2 }}>
                "Mon énergie s'affaiblit chaque jour. Seul votre apprentissage peut me rendre 
                ma puissance. Ensemble, nous pourrons défier celui qui m'a déchu !"
              </Typography>
            </DialogueBox>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                  Niveau {samenStats.level} • {samenStats.rank}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#4facfe' }}>EXPÉRIENCE</Typography>
                    <Typography variant="caption" sx={{ color: '#fff' }}>
                      {samenStats.experience}/{samenStats.experienceMax}
                    </Typography>
                  </Box>
                  <StatBar 
                    color="#4facfe" 
                    percentage={(samenStats.experience / samenStats.experienceMax) * 100} 
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>
                  État énergétique
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: samenStats.energy > 20 ? '#28a745' : '#dc3545' }}>
                      ÉNERGIE
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#fff' }}>
                      {samenStats.energy}/{samenStats.energyMax}
                    </Typography>
                  </Box>
                  <StatBar 
                    color={samenStats.energy > 20 ? '#28a745' : '#dc3545'} 
                    percentage={(samenStats.energy / samenStats.energyMax) * 100} 
                  />
                  {samenStats.energy <= 20 && (
                    <Typography variant="caption" sx={{ color: '#dc3545', display: 'block', mt: 1 }}>
                      ⚠️ Énergie faible - Samen a besoin de repos (24h pour récupération complète)
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => setShowSamenProfile(false)}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 10px 25px rgba(79, 172, 254, 0.4)'
                  }
                }}
              >
                {samenStats.energy > 0 ? 'Commencer l\'aventure' : 'Samen se repose...'}
              </Button>
            </Box>
          </GameCard>
        </Box>
      </SamenModal>

      {/* Modals existantes */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md">
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Créer un Nouveau Cours
          </Typography>
          <CreateCourseForm onClose={() => setOpenCreate(false)} />
        </Box>
      </Dialog>
      <Dialog open={openLibrary} onClose={() => setOpenLibrary(false)} fullWidth maxWidth="lg">
        <LibraryPage onClose={() => setOpenLibrary(false)} />
      </Dialog>
    </GradientContainer>
  );
};

export default DashboardPage;