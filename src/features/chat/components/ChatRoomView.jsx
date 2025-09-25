import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Paper, Stack } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { useChatRoom } from '../context/ChatProvider';
import ChatRoomHeader from './ChatRoomHeader';
import ChatMessageList from './ChatMessageList';
import ChatComposer from './ChatComposer';
import ActiveUserList from './ActiveUserList';

const normalizeArea = (value) => (typeof value === 'string' ? value.trim() : '');

const ChatRoomView = ({
  roomId,
  domain,
  title,
  description,
  defaultArea,
  initialAreaFilter,
  onAreaFilterChange,
  filterValue,
  areaLocked = false,
  allowAreaSelection = true,
  availableAreas = [],
  showActiveUsers = true,
  variant = 'full',
  metadata,
  historyRoomId,
  historyParams,
  autoLoadHistory = true,
}) => {
  const { user } = useAuth();
  const connectionMetadata = useMemo(() => {
    const baseMetadata = metadata && typeof metadata === 'object' ? metadata : {};
    const normalizedDomain =
      (typeof domain === 'string' && domain.trim()) || baseMetadata.domain || 'general';
    const candidateArea =
      baseMetadata.area ||
      defaultArea ||
      initialAreaFilter ||
      (Array.isArray(availableAreas) && availableAreas.length > 0 ? availableAreas[0] : '') ||
      'general';
    const normalizedArea = normalizeArea(candidateArea);

    const nextMetadata = {
      ...baseMetadata,
      domain: normalizedDomain,
      room: roomId,
    };

    if (normalizedArea) {
      nextMetadata.area = normalizedArea;
    } else if ('area' in nextMetadata) {
      delete nextMetadata.area;
    }

    return nextMetadata;
  }, [metadata, domain, roomId, defaultArea, initialAreaFilter, availableAreas]);

  const historyConfig = useMemo(() => {
    if (!autoLoadHistory) {
      return { autoLoad: false };
    }
    const params = historyParams && typeof historyParams === 'object' ? historyParams : undefined;
    return {
      autoLoad: true,
      requestId: historyRoomId || roomId,
      params,
    };
  }, [autoLoadHistory, historyParams, historyRoomId, roomId]);

  const { messages, activeUsers, status, error, sendMessage, isFetchingHistory, hasHistory } = useChatRoom(
    roomId,
    {
      metadata: connectionMetadata,
      history: historyConfig,
    },
  );

  const [composerValue, setComposerValue] = useState('');
  const [internalFilter, setInternalFilter] = useState(normalizeArea(initialAreaFilter));
  const [composerArea, setComposerArea] = useState(
    normalizeArea(defaultArea) || normalizeArea(initialAreaFilter) || availableAreas[0] || ''
  );

  const effectiveFilter = filterValue !== undefined ? normalizeArea(filterValue) : internalFilter;

  useEffect(() => {
    setInternalFilter(normalizeArea(initialAreaFilter));
  }, [initialAreaFilter]);

  useEffect(() => {
    if (!areaLocked && availableAreas.length > 0) {
      if (!composerArea || !availableAreas.includes(composerArea)) {
        setComposerArea(availableAreas[0]);
      }
    }
  }, [areaLocked, availableAreas, composerArea]);

  const areaOptions = useMemo(() => {
    const options = new Set();
    availableAreas.forEach((area) => {
      if (typeof area === 'string' && area.trim()) options.add(area.trim());
    });
    messages?.forEach((message) => {
      if (message.area) options.add(message.area);
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [availableAreas, messages]);

  const filteredMessages = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    if (!effectiveFilter) return messages;
    return messages.filter((message) => message.area === effectiveFilter);
  }, [effectiveFilter, messages]);

  const canSend = status === 'connected';

  const handleSubmit = () => {
    const trimmed = composerValue.trim();
    if (!trimmed) return;

    const areaForMessage = areaLocked
      ? normalizeArea(defaultArea)
      : normalizeArea(composerArea || effectiveFilter || availableAreas[0] || '');

    const payload = {
      content: trimmed,
      domain: domain || null,
      area: areaForMessage || null,
    };

    try {
      const result = sendMessage({ type: 'message', payload });
      if (result) {
        setComposerValue('');
      }
    } catch (sendError) {
      console.error('Unable to send chat message', sendError);
    }
  };

  const handleFilterChange = (nextValue) => {
    const normalized = normalizeArea(nextValue);
    if (filterValue === undefined) {
      setInternalFilter(normalized);
    }
    onAreaFilterChange?.(normalized);
  };

  const errorMessage = error ? error.message || 'Le salon de discussion est indisponible.' : '';

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <ChatRoomHeader
        title={title}
        description={description}
        status={status}
        isLoadingHistory={isFetchingHistory}
        areaFilter={effectiveFilter}
        onAreaFilterChange={handleFilterChange}
        areaOptions={areaOptions}
        showAreaFilter={!areaLocked && allowAreaSelection}
        lockedArea={areaLocked ? normalizeArea(defaultArea) : undefined}
        activeCount={Array.isArray(activeUsers) ? activeUsers.length : undefined}
      />
      {errorMessage && (
        <Alert severity="error">{errorMessage}</Alert>
      )}
      <Stack
        direction={{ xs: 'column', md: variant === 'full' ? 'row' : 'column' }}
        spacing={2}
        sx={{ flex: 1, minHeight: variant === 'full' ? 400 : 320 }}
      >
        <Paper
          variant="outlined"
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 280 }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
            <ChatMessageList
              messages={filteredMessages}
              status={status}
              currentUsername={user?.username}
              isLoadingHistory={isFetchingHistory}
              hasHistory={hasHistory}
            />
          </Box>
          <Box sx={{ px: 2, py: 1.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
            <ChatComposer
              value={composerValue}
              onChange={setComposerValue}
              onSubmit={handleSubmit}
              disabled={!canSend}
              areaOptions={allowAreaSelection ? areaOptions : []}
              areaLocked={areaLocked || !allowAreaSelection}
              selectedArea={composerArea}
              onAreaChange={setComposerArea}
            />
          </Box>
        </Paper>
        {showActiveUsers && (
          <ActiveUserList users={activeUsers} status={status} variant={variant} />
        )}
      </Stack>
    </Stack>
  );
};

export default ChatRoomView;
