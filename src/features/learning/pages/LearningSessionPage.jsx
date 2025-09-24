// Fichier: src/features/learning/pages/LearningSessionPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchLearningSession } from '../../capsules/api/capsulesApi';

import { Box, Typography, CircularProgress, Alert, Breadcrumbs, Link as MuiLink } from '@mui/material';
import AtomViewer from '../components/AtomViewer'; // <-- NOUVEL IMPORT

const LearningSessionPage = () => {
  const { capsuleId, granuleOrder, moleculeOrder } = useParams();
  const navigate = useNavigate();

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['learningSession', capsuleId, granuleOrder, moleculeOrder],
    queryFn: () => fetchLearningSession(capsuleId, granuleOrder, moleculeOrder),
    // On désactive le refetch automatique pour ne pas régénérer la leçon sans raison
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.generationStatus;
      return status === 'pending' ? 4000 : false;
    },
  });

  const atoms = session?.atoms ?? (Array.isArray(session) ? session : []);
  const generationStatus = session?.generationStatus;

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Préparation de votre leçon...</Typography>
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Impossible de charger la session d'apprentissage : {error.message}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component="button" onClick={() => navigate('/capsules')} underline="hover">
          Capsules
        </MuiLink>
        <MuiLink component="button" onClick={() => navigate(-1)} underline="hover">
          Plan du cours
        </MuiLink>
        <Typography color="text.primary">Leçon en cours</Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Niveau {granuleOrder} - Leçon {moleculeOrder}
      </Typography>

      {generationStatus === 'pending' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Les contenus sont en cours de génération. Cette page se mettra à jour automatiquement dès qu'ils seront prêts.
        </Alert>
      )}

      {atoms.length === 0 && generationStatus !== 'pending' ? (
        <Alert severity="warning">Aucun contenu disponible pour cette leçon pour le moment.</Alert>
      ) : (
        <AtomViewer atoms={atoms} />
      )}
    </Box>
  );
};

export default LearningSessionPage;
