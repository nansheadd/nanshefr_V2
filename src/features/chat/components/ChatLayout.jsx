import React from 'react';
import { Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ChatProvider } from '../context/ChatProvider';
import useChatRoomsQuery from '../hooks/useChatRoomsQuery';
import ChatSidebar from './ChatSidebar';

const ChatLayout = () => {
  const roomsQuery = useChatRoomsQuery();

  return (
    <ChatProvider>
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: { xs: 'auto', md: '70vh' },
          width: '100%',
        }}
      >
        <ChatSidebar
          rooms={roomsQuery.data}
          isLoading={roomsQuery.isLoading}
          error={roomsQuery.error}
        />
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
          <Outlet context={{ rooms: roomsQuery.data, roomsQuery }} />
        </Box>
      </Paper>
    </ChatProvider>
  );
};

export default ChatLayout;
