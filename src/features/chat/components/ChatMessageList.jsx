import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import ChatMessageItem from './ChatMessageItem';

const ChatMessageList = ({ messages, status, currentUsername }) => {
  const bottomRef = useRef(null);
  const isLoading = status === 'connecting';

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasMessages = Array.isArray(messages) && messages.length > 0;

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
      {isLoading && !hasMessages && (
        <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
          <CircularProgress size={20} />
        </Stack>
      )}
      {hasMessages ? (
        <Stack spacing={1.5} sx={{ pb: 1 }}>
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id || `${message.username}-${message.createdAt}`}
              message={message}
              isOwn={Boolean(currentUsername) && message.username === currentUsername}
            />
          ))}
          <Box ref={bottomRef} />
        </Stack>
      ) : (
        !isLoading && (
          <Stack spacing={1} sx={{ py: 4, alignItems: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Aucun message pour le moment.</Typography>
            <Typography variant="body2">Soyez la première personne à lancer la discussion !</Typography>
          </Stack>
        )
      )}
    </Box>
  );
};

export default ChatMessageList;
