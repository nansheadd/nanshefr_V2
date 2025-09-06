// Fichier: frontend/src/features/courses/components/ProactiveCoach.jsx
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Fonction pour envoyer la motivation à l'API
const postMotivation = ({ courseId, motivation }) => {
    return apiClient.post(`/courses/${courseId}/motivation`, { motivation });
};

const ProactiveCoach = ({ courseId, courseTitle }) => {
    const [motivation, setMotivation] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const mutation = useMutation({
        mutationFn: postMotivation,
        onSuccess: () => {
            setSubmitted(true); // Affiche le message de remerciement
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (motivation.trim()) {
            mutation.mutate({ courseId, motivation });
        }
    };

    if (submitted) {
        return (
            <Paper elevation={4} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, backgroundColor: 'success.light' }}>
                <SmartToyIcon sx={{ color: 'success.dark' }} />
                <Typography variant="body1" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                    Merci ! Je prends en compte votre objectif pour la suite.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
                <SmartToyIcon color="primary" />
                <Typography variant="h6" component="h3">
                    Juste une question pendant que je prépare votre cours sur "{courseTitle}"...
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Qu'est-ce qui vous motive à apprendre ce sujet ? Votre réponse m'aidera à mieux personnaliser votre parcours.
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    label="Votre motivation..."
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="Ex: 'Je prépare un voyage', 'Pour ma carrière professionnelle', 'Par simple curiosité'..."
                />
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={mutation.isPending}
                    startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {mutation.isPending ? 'Envoi...' : 'Partager mon objectif'}
                </Button>
            </form>
        </Paper>
    );
};

export default ProactiveCoach;