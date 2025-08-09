// Fichier: src/features/learning/components/DiscussionComponent.jsx (FINAL INTERACTIF)
import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../api/axiosConfig';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Stack, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Fonctions d'appel à l'API, séparées pour plus de clarté
const submitFirstAnswer = (answerData) => apiClient.post('/progress/answer', answerData).then(res => res.data);
const continueConversation = ({ answerLogId, ...payload }) => apiClient.post(`/progress/discussion/${answerLogId}/continue`, payload).then(res => res.data);

// Sous-composant pour afficher un message de chat
const ChatMessage = ({ author, message }) => (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 1.5, 
        mb: 1, 
        alignSelf: author === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: author === 'user' ? 'primary.light' : 'grey.200',
        maxWidth: '80%',
      }}
    >
        <Stack direction="row" spacing={1} alignItems="center">
            {author === 'user' ? <AccountCircleIcon /> : <AutoAwesomeIcon color="primary" />}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{message}</Typography>
        </Stack>
    </Paper>
);

const DiscussionComponent = ({ component, submittedAnswer }) => {
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState([]);
    const [currentUserInput, setCurrentUserInput] = useState('');
    const [isCompleted, setIsCompleted] = useState(submittedAnswer?.status === 'correct');
    const chatEndRef = useRef(null);

    // Synchronise l'état des messages avec les données venant du serveur
    useEffect(() => {
        if (submittedAnswer?.ai_feedback?.history) {
            setMessages(submittedAnswer.ai_feedback.history);
        } else if (submittedAnswer) {
            // Cas initial : juste après la première soumission, avant que l'IA n'ait répondu
            setMessages([{ author: 'user', message: submittedAnswer.user_answer_json.text }]);
        } else {
            setMessages([]);
        }
        setIsCompleted(submittedAnswer?.status === 'correct');
    }, [submittedAnswer]);

    // Fait défiler le chat vers le bas à chaque nouveau message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mutation pour le premier message
    const firstMessageMutation = useMutation({
        mutationFn: submitFirstAnswer,
        onSuccess: () => {
            // Rafraîchit les données du chapitre pour obtenir la réponse de l'IA
            queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
        }
    });

    // Mutation pour les messages suivants
    const continueMutation = useMutation({
        mutationFn: continueConversation,
        onSuccess: () => {
            // Rafraîchit les données du chapitre pour obtenir la réponse de l'IA
            queryClient.invalidateQueries({ queryKey: ['chapter', component.chapter_id] });
        }
    });

    const isLoading = firstMessageMutation.isLoading || continueMutation.isLoading;

    const handleSend = () => {
        if (!currentUserInput.trim()) return;

        // Affichage optimiste : affiche le message de l'utilisateur instantanément
        const newMessages = [...messages, { author: 'user', message: currentUserInput }];
        setMessages(newMessages); 
        
        if (!submittedAnswer) {
            // S'il n'y a pas de réponse soumise, c'est le premier message
            firstMessageMutation.mutate({ 
                component_id: component.id, 
                user_answer_json: { text: currentUserInput } 
            });
        } else {
            // Sinon, on continue la conversation en utilisant l'ID de la réponse existante
            continueMutation.mutate({
                answerLogId: submittedAnswer.id,
                history: messages,
                user_message: currentUserInput
            });
        }
        setCurrentUserInput('');
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                {component.content_json.prompt || "Lancez la discussion"}
            </Typography>
            
            <Stack sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1, height: '300px', overflowY: 'auto', bgcolor: 'background.paper' }}>
                {messages.map((msg, index) => <ChatMessage key={index} author={msg.author} message={msg.message} />)}
                {isLoading && <CircularProgress size={24} sx={{ alignSelf: 'center', my: 1 }} />}
                <div ref={chatEndRef} />
            </Stack>

            {isCompleted ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Discussion terminée et validée ! Vous pouvez passer à la suite.
                </Alert>
            ) : (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField 
                        fullWidth 
                        variant="outlined" 
                        placeholder="Écrivez votre message..." 
                        value={currentUserInput} 
                        onChange={(e) => setCurrentUserInput(e.target.value)} 
                        disabled={isLoading}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleSend} 
                        disabled={isLoading || !currentUserInput}
                    >
                        Envoyer
                    </Button>
                </Stack>
            )}
        </Box>
    );
};

export default DiscussionComponent;