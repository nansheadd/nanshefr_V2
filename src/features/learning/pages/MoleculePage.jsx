import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { 
  Container, Box, Typography, CircularProgress, Alert, 
  Breadcrumbs, Link, Fade, Skeleton, Chip, LinearProgress 
} from '@mui/material';
import { 
  Home as HomeIcon, 
  School as SchoolIcon,
  AutoStories as BookIcon 
} from '@mui/icons-material';
import AtomViewer from '../components/AtomViewer';

const MoleculePage = () => {
  const { moleculeId } = useParams();
  const activityLogRef = React.useRef(null);

  const { data: atoms, isLoading, isError, error } = useQuery({
    queryKey: ['atoms', moleculeId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/capsules/molecules/${moleculeId}/atoms`);
      return data;
    },
  });

  const sendEndActivity = React.useCallback((logId) => {
    if (!logId) return;
    const baseURL = apiClient.defaults.baseURL || '';
    const buildUrl = (path) => (baseURL.startsWith('http') ? `${baseURL}${path}` : `${window.location.origin}${baseURL}${path}`);
    const endpoint = buildUrl('/progress/activity/end');
    const payload = JSON.stringify({ log_id: logId });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      apiClient.post('/progress/activity/end', { log_id: logId }).catch(() => {});
    }
  }, []);

  React.useEffect(() => {
    if (!atoms || atoms.length === 0) {
      return () => {};
    }

    const targetAtom = atoms.find((atom) => atom?.capsule_id);
    if (!targetAtom) {
      return () => {};
    }

    let cancelled = false;

    const startActivity = async () => {
      try {
        const { data } = await apiClient.post('/progress/activity/start', {
          capsule_id: targetAtom.capsule_id,
          atom_id: targetAtom.id,
        });
        if (!cancelled && data?.log_id) {
          activityLogRef.current = data.log_id;
        }
      } catch (err) {
        console.warn('Impossible de démarrer le suivi de session', err);
      }
    };

    startActivity();

    const beforeUnloadHandler = () => {
      if (activityLogRef.current) {
        sendEndActivity(activityLogRef.current);
      }
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);

    return () => {
      cancelled = true;
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      if (activityLogRef.current) {
        sendEndActivity(activityLogRef.current);
        activityLogRef.current = null;
      }
    };
  }, [atoms, sendEndActivity]);

  // Loading state amélioré
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={30} />
          <Skeleton variant="text" width="100%" height={50} sx={{ mt: 3 }} />
        </Box>
        <LinearProgress sx={{ borderRadius: 2 }} />
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={200} />
        </Box>
      </Container>
    );
  }

  // Error state amélioré
  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)',
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          <Typography variant="h6" gutterBottom>Oops! Quelque chose s'est mal passé</Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Fade in timeout={800}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Breadcrumbs amélioré */}
        <Breadcrumbs 
          aria-label="breadcrumb" 
          sx={{ 
            mb: 4,
            '& .MuiBreadcrumbs-separator': { mx: 1.5 },
            '& .MuiLink-root': {
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-1px)' }
            }
          }}
        >
          <Link 
            component={RouterLink} 
            underline="hover" 
            color="inherit" 
            to="/dashboard"
            sx={{ fontWeight: 500 }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Typography 
            color="primary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              fontWeight: 600 
            }}
          >
            <BookIcon fontSize="small" />
            Leçon
          </Typography>
        </Breadcrumbs>
        
        {/* Header avec gradient */}
        <Box 
          sx={{ 
            mb: 5,
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.25)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(50px, -50px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 40 }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Session d'Apprentissage
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Chip 
              label={`${atoms?.length || 0} éléments`} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600 
              }} 
            />
            <Chip 
              label="En cours" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600 
              }} 
            />
          </Box>
        </Box>

        {/* Content */}
        {atoms && atoms.length > 0 ? (
          <Fade in timeout={1000}>
            <Box>
              <AtomViewer atoms={atoms} />
            </Box>
          </Fade>
        ) : (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
              bgcolor: 'info.lighter',
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
          >
            <Typography variant="h6">Contenu en préparation</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Le contenu de cette leçon sera bientôt disponible. Revenez plus tard!
            </Typography>
          </Alert>
        )}
      </Container>
    </Fade>
  );
};

export default MoleculePage;
