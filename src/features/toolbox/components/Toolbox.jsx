// src/features/toolbox/components/Toolbox.jsx
import React, { useState } from 'react';
import { Box, Fab, Stack, IconButton, Grow, Paper, Tooltip, Slide, Badge } from '@mui/material';
import { styled, useTheme, alpha, keyframes } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';
import CoachIA from './CoachIA';

// Animation pour le FAB principal
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.4); }
  50% { box-shadow: 0 0 30px rgba(25, 118, 210, 0.8); }
`;

const StyledFab = styled(Fab)(({ theme, isActive }) => ({
  background: isActive 
    ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`
    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: 'white',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.6)}`,
    animation: `${pulse} 2s infinite`,
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  ...(isActive && {
    animation: `${glow} 2s infinite`,
  })
}));

const ToolboxContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(0.5),
  borderRadius: 32,
  background: `rgba(255, 255, 255, 0.95)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
}));

const ToolButton = styled(IconButton)(({ theme, isActive }) => ({
  borderRadius: '50%',
  transition: 'all 0.3s ease-in-out',
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  background: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.15),
    color: theme.palette.primary.main,
    transform: 'scale(1.1)',
  }
}));

const Toolbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const theme = useTheme();

  const toggleTool = (toolName) => {
    if (activeTool === toolName) {
      setActiveTool(null);
    } else {
      setActiveTool(toolName);
      setIsOpen(false);
    }
  };

  const handleFabClick = () => {
    if (activeTool) {
      setActiveTool(null);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const tools = [
    { name: 'coach', icon: SmartToyIcon, label: '🤖 Coach IA', color: 'secondary' },
    { name: 'notes', icon: EditNoteIcon, label: '📝 Prise de Notes', color: 'info' },
  ];

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: { xs: 20, md: 32 }, 
      right: { xs: 20, md: 32 }, 
      zIndex: 1300, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-end',
      gap: 2
    }}>
      
      {/* Coach IA Window */}
      <Slide direction="up" in={activeTool === 'coach'} mountOnEnter unmountOnExit>
        <Box>
          <CoachIA onClose={() => setActiveTool(null)} />
        </Box>
      </Slide>
      
      {/* Notes Window - Placeholder */}
      <Slide direction="up" in={activeTool === 'notes'} mountOnEnter unmountOnExit>
        <Box>
          <Paper elevation={12} sx={{ 
            width: 320, 
            height: 400, 
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            p: 2
          }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              📝 Notes - Bientôt disponible !
            </Box>
          </Paper>
        </Box>
      </Slide>

      {/* Tools Bar */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Grow in={isOpen} timeout={300}>
          <ToolboxContainer elevation={8}>
            {tools.map((tool, index) => (
              <Grow key={tool.name} in={isOpen} timeout={400 + index * 100}>
                <Tooltip title={tool.label} placement="left">
                  <ToolButton
                    onClick={() => toggleTool(tool.name)}
                    isActive={activeTool === tool.name}
                    color={tool.color}
                  >
                    <Badge
                      variant="dot"
                      color="success"
                      invisible={activeTool !== tool.name}
                      sx={{ '& .MuiBadge-dot': { top: 6, right: 6 } }}
                    >
                      <tool.icon />
                    </Badge>
                  </ToolButton>
                </Tooltip>
              </Grow>
            ))}
          </ToolboxContainer>
        </Grow>

        {/* Main FAB */}
        <StyledFab
          aria-label="toggle toolbox"
          onClick={handleFabClick}
          isActive={Boolean(activeTool)}
          size="large"
        >
          {isOpen || activeTool ? <CloseIcon /> : <ChatIcon />}
        </StyledFab>
      </Stack>
    </Box>
  );
};

export default Toolbox;