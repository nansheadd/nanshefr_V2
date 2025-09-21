import React, { useCallback, useState } from 'react';
import { Box, Paper, Chip, Grow, Stack, useTheme } from '@mui/material';
import {
  MenuBook as LessonIcon,
  Quiz as QuizIcon,
  Extension as ExtensionIcon,
  Security as SecurityIcon,
  AssignmentTurnedIn as AssignmentIcon,
} from '@mui/icons-material';
import LessonAtom from './atoms/LessonAtom';
import QuizAtom from './atoms/QuizAtom';
import CodeExampleAtom from './atoms/CodeExampleAtom';
import CodeChallengeAtom from './atoms/CodeChallengeAtom';
import LiveCodeExecutorAtom from './atoms/LiveCodeExecutorAtom';
import CodeSandboxAtom from './atoms/CodeSandboxAtom';
import CodeProjectBriefAtom from './atoms/CodeProjectBriefAtom';
import XpRewardOverlay from './XpRewardOverlay';

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
      case 'code_example':
        return {
          icon: <ExtensionIcon />,
          color: '#10b981',
          bgGradient: 'linear-gradient(135deg, #10b98115 0%, #05966915 100%)',
          label: 'Exemple'
        };
      case 'code_challenge':
        return {
          icon: <ExtensionIcon />,
          color: '#3b82f6',
          bgGradient: 'linear-gradient(135deg, #3b82f615 0%, #2563eb15 100%)',
          label: 'Challenge'
        };
      case 'live_code_executor':
        return {
          icon: <ExtensionIcon />,
          color: '#9333ea',
          bgGradient: 'linear-gradient(135deg, #9333ea15 0%, #7c3aed15 100%)',
          label: 'Atelier'
        };
      case 'code_sandbox_setup':
        return {
          icon: <SecurityIcon />,
          color: '#14b8a6',
          bgGradient: 'linear-gradient(135deg, #14b8a615 0%, #0d948815 100%)',
          label: 'Sandbox'
        };
      case 'code_project_brief':
        return {
          icon: <AssignmentIcon />,
          color: '#f97316',
          bgGradient: 'linear-gradient(135deg, #f9731615 0%, #ea580c15 100%)',
          label: 'Projet'
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

  const [rewardQueue, setRewardQueue] = useState([]);

  const enqueueReward = useCallback((details) => {
    if (!details || !details.xp) {
      return;
    }
    setRewardQueue((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...details,
      },
    ]);
  }, []);

  const scrollToAtom = useCallback((atomId) => {
    if (typeof document === 'undefined') return;
    const element = document.getElementById(`atom-${atomId}`);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    element.setAttribute('data-flash', 'on');
    setTimeout(() => {
      element.removeAttribute('data-flash');
    }, 1000);

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#atom-${atomId}`);
    }
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      <XpRewardOverlay
        reward={rewardQueue[0]}
        onDone={() => setRewardQueue((prev) => prev.slice(1))}
      />
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
          const isBonus = Boolean(atom.is_bonus);
          const circleColor = locked
            ? '#d1d5db'
            : isBonus
            ? '#facc15'
            : status === 'completed'
            ? '#22c55e'
            : status === 'in_progress'
            ? '#3b82f6'
            : status === 'failed'
            ? '#ef4444'
            : config.color;
          const handleActivate = () => {
            scrollToAtom(atom.id);
          };

          const handleKeyDown = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              scrollToAtom(atom.id);
            }
          };

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
                cursor: 'pointer',
                opacity: locked ? 0.4 : 1,
                outline: 'none',
                '&:focus-visible': {
                  boxShadow: `0 0 0 3px ${theme.palette.common.white}`,
                },
              }}
              role="button"
              tabIndex={0}
              onClick={handleActivate}
              onKeyDown={handleKeyDown}
            >
              {index + 1}
            </Box>
          );
        })}
      </Box>

      {/* Atoms display */}
      {atoms.map((atom, index) => {
        const config = getAtomConfig(atom.content_type);
        const isBonus = Boolean(atom.is_bonus);
        const xpValue = atom.xp_value ?? 0;
        
        return (
          <Grow 
            in 
            timeout={500 + index * 200} 
            key={atom.id}
          >
            <Paper 
              id={`atom-${atom.id}`}
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
                },
                '&[data-flash="on"]': {
                  boxShadow: `0 0 0 4px ${config.color}33`,
                },
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
                  {isBonus && (
                    <Chip 
                      label="Bonus" 
                      size="small"
                      color="warning"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip 
                    label={`+${xpValue} XP`} 
                    size="small"
                    color={isBonus ? 'warning' : 'success'}
                    variant={isBonus ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={`${index + 1}/${atoms.length}`} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Stack>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                {(() => {
                  const triggerReward = (override = {}) => {
                    const baseXp = atom?.xp_value ?? 0;
                    const xp = override.xp ?? baseXp;
                    if (!xp) return;
                    enqueueReward({
                      xp,
                      title: override.title ?? atom?.title,
                      type: atom?.content_type,
                    });
                  };

                  switch (atom.content_type) {
                    case 'lesson':
                      return <LessonAtom atom={atom} onReward={triggerReward} />;
                    case 'quiz':
                      return <QuizAtom atom={atom} onReward={triggerReward} />;
                    case 'code_example':
                      return <CodeExampleAtom atom={atom} />;
                    case 'code_challenge':
                      return <CodeChallengeAtom atom={atom} onReward={triggerReward} />;
                    case 'live_code_executor':
                      return <LiveCodeExecutorAtom atom={atom} />;
                    case 'code_sandbox_setup':
                      return <CodeSandboxAtom atom={atom} />;
                    case 'code_project_brief':
                      return <CodeProjectBriefAtom atom={atom} />;
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
