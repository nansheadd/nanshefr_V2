import React from 'react';
import { Box, Paper, Chip, Grow, useTheme } from '@mui/material';
import { 
  MenuBook as LessonIcon, 
  Quiz as QuizIcon,
  Extension as ExtensionIcon 
} from '@mui/icons-material';
import LessonAtom from './atoms/LessonAtom';
import QuizAtom from './atoms/QuizAtom';

const AtomViewer = ({ atoms }) => {
  const theme = useTheme();

  const getAtomConfig = (type) => {
    switch (type) {
      case 'lesson':
        return {
          icon: <LessonIcon />,
          color: '#667eea',
          bgGradient: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          label: 'Leçon'
        };
      case 'quiz':
        return {
          icon: <QuizIcon />,
          color: '#f59e0b',
          bgGradient: 'linear-gradient(135deg, #f59e0b15 0%, #ef444415 100%)',
          label: 'Quiz'
        };
      default:
        return {
          icon: <ExtensionIcon />,
          color: '#6b7280',
          bgGradient: 'linear-gradient(135deg, #6b728015 0%, #37415115 100%)',
          label: 'Contenu'
        };
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Progress indicator */}
      <Box 
        sx={{ 
          position: 'sticky',
          top: 20,
          zIndex: 10,
          mb: 4,
          p: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { 
            bgcolor: 'primary.main',
            borderRadius: 2 
          }
        }}
      >
        {atoms.map((atom, index) => {
          const config = getAtomConfig(atom.content_type);
          const status = atom.progress_status || 'not_started';
          const locked = atom.is_locked;
          const circleColor = locked
            ? '#d1d5db'
            : status === 'completed'
            ? '#22c55e'
            : status === 'in_progress'
            ? '#3b82f6'
            : status === 'failed'
            ? '#ef4444'
            : config.color;
          return (
            <Box
              key={atom.id}
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: circleColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.3s',
                cursor: 'default',
                opacity: locked ? 0.4 : 1,
              }}
            >
              {index + 1}
            </Box>
          );
        })}
      </Box>

      {/* Atoms display */}
      {atoms.map((atom, index) => {
        const config = getAtomConfig(atom.content_type);
        
        return (
          <Grow 
            in 
            timeout={500 + index * 200} 
            key={atom.id}
          >
            <Paper 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  borderColor: config.color + '40',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: config.color,
                }
              }} 
              variant="outlined"
            >
              {/* Header */}
              <Box 
                sx={{ 
                  p: 2,
                  background: config.bgGradient,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box 
                    sx={{ 
                      color: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    {config.icon}
                  </Box>
                  <Chip 
                    label={config.label} 
                    size="small" 
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: config.color + '20',
                      color: config.color,
                      border: `1px solid ${config.color}30`
                    }} 
                  />
                </Box>
                <Chip 
                  label={`${index + 1}/${atoms.length}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                {(() => {
                  switch (atom.content_type) {
                    case 'lesson':
                      return <LessonAtom atom={atom} />;
                    case 'quiz':
                      return <QuizAtom atom={atom} />;
                    default:
                      return (
                        <Box 
                          sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            textAlign: 'center',
                            color: 'text.secondary'
                          }}
                        >
                          Type d'atome non supporté : {atom.content_type}
                        </Box>
                      );
                  }
                })()}
              </Box>
            </Paper>
          </Grow>
        );
      })}
    </Box>
  );
};

export default AtomViewer;
