import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  Avatar,
  Chip,
  AppBar,
  Toolbar,
  Fade,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import Badge from '../components/Badge';
import Footer from '../components/Footer'; // Import du vrai footer

// Animations simplifiées
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styles optimisés
const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6, 0),
  },
  animation: `${fadeIn} 0.8s ease-out`
}));

const Hero = styled(Section)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.default, 0.95)} 0%, 
    ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
  position: 'relative',
  overflow: 'hidden'
}));

const GText = styled(Typography)({
  background: 'linear-gradient(135deg, #1976d2, #9c27b0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800
});

const GButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
  borderRadius: 12,
  padding: '12px 28px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 20px rgba(25, 118, 210, 0.25)',
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(25, 118, 210, 0.35)'
  }
}));

const FCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  background: '#fff',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 35px rgba(0,0,0,0.12)'
  }
}));

const Nav = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
}));

const ScrollArrow = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 32,
  left: '50%',
  transform: 'translateX(-50%)',
  cursor: 'pointer',
  animation: `${float} 2s infinite`,
  color: theme.palette.primary.main,
  opacity: 0.7,
  transition: 'opacity 0.3s',
  '&:hover': { opacity: 1 }
}));

const NansheHomepage = () => {
  const [typed, setTyped] = useState('');
  const [showBadge, setShowBadge] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const text = "L'IA qui s'adapte à votre rythme";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setTyped(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowBadge(true), 500);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: AutoAwesomeIcon, title: "Contenu IA", desc: "Cours personnalisés générés instantanément", color: '#1976d2' },
    { icon: SmartToyIcon, title: "Coach IA", desc: "Mentor intelligent qui s'adapte à vous", color: '#9c27b0' },
    { icon: EmojiEventsIcon, title: "Gamification", desc: "Apprenez en jouant avec badges et niveaux", color: '#ed6c02' },
    { icon: PeopleIcon, title: "Communauté", desc: "Connexions intelligentes entre apprenants", color: '#0288d1' }
  ];

  const stats = [
    { num: "1M+", label: "Cours" },
    { num: "50K+", label: "Apprenants" },
    { num: "95%", label: "Réussite" },
    { num: "24/7", label: "Support IA" }
  ];

  const scrollDown = () => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <Nav position="fixed" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 800 }}>
            <GText component="span">Nanshe</GText>
          </Typography>
          <Stack direction="row" spacing={2}>
            {!isMobile && (
              <Button component={Link} to="/login" startIcon={<LoginIcon />} sx={{ color: 'text.primary' }}>
                Connexion
              </Button>
            )}
            <GButton component={Link} to="/register" size={isMobile ? "small" : "medium"}>
              {isMobile ? "Commencer" : "Commencer Gratuitement"}
            </GButton>
          </Stack>
        </Toolbar>
      </Nav>

      {/* Hero */}
      <Hero>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Typography variant={isMobile ? "h3" : "h2"} sx={{ fontWeight: 800 }}>
                  Apprenez avec <GText component="span">Nanshe</GText>
                </Typography>
                <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" sx={{ minHeight: '2em' }}>
                  {typed}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Plateforme d'e-learning IA qui génère du contenu personnalisé et gamifie votre parcours.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <GButton onClick={() => navigate('/register')} size="large">
                    Démarrer l'Aventure
                  </GButton>
                  <Button variant="outlined" onClick={() => navigate('/login')} size="large" sx={{ borderRadius: 3 }}>
                    J'ai un compte
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Box sx={{ 
                  width: isMobile ? 150 : 200,
                  height: isMobile ? 150 : 200,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  boxShadow: '0 20px 40px rgba(25, 118, 210, 0.25)',
                  animation: `${float} 4s infinite`
                }}>
                  <SchoolIcon sx={{ fontSize: isMobile ? 60 : 80, color: '#fff' }} />
                </Box>
                {showBadge && !isMobile && (
                  <Fade in timeout={1000}>
                    <Box sx={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)' }}>
                      <Badge
                        name="Premier Pas"
                        description="Découvrez l'IA !"
                        earned={true}
                        tier="gold"
                        xpPoints={100}
                        rarity="epic"
                      />
                    </Box>
                  </Fade>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
        <ScrollArrow onClick={scrollDown}>
          <KeyboardArrowDownIcon sx={{ fontSize: 32 }} />
        </ScrollArrow>
      </Hero>

      {/* Stats */}
      <Section sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {stats.map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 800, mb: 1 }}>
                    <GText>{s.num}</GText>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Features */}
      <Section sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, mb: 2 }}>
              Révolutionnez votre <GText component="span">apprentissage</GText>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              IA et gamification pour transformer l'éducation
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <FCard>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: alpha(f.color, 0.1), 
                      mx: 'auto', 
                      mb: 2 
                    }}>
                      <f.icon sx={{ color: f.color, fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </Box>
                </FCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* Gamification */}
      <Section>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="Gamification" sx={{ bgcolor: alpha('#ed6c02', 0.1), color: '#ed6c02', mb: 2 }} />
              <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, mb: 3 }}>
                L'apprentissage devient une <GText>aventure</GText>
              </Typography>
              <Stack spacing={2}>
                {['Badges tutoriels interactifs', 'Progression visible en temps réel', 'Récompenses sociales'].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ animation: `${float} 4s infinite` }}>
                <Badge
                  name="Maître IA"
                  description="25 cours IA complétés"
                  earned={false}
                  progress={{ current: 18, target: 25 }}
                  tier="diamond"
                  xpPoints={500}
                  rarity="legendary"
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* CTA */}
      <Section sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 700, mb: 3 }}>
            Prêt à révolutionner votre <GText>apprentissage ?</GText>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Rejoignez des milliers d'apprenants qui transforment leur façon d'apprendre avec l'IA.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <GButton size="large" onClick={() => navigate('/register')}>
              Commencer Gratuitement
            </GButton>
            <Button variant="outlined" size="large" onClick={() => navigate('/demo')} sx={{ borderRadius: 3 }}>
              Voir la Démo
            </Button>
          </Stack>
        </Container>
      </Section>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default NansheHomepage;