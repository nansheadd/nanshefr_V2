import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { buildChatSocketUrl } from '../../../config/api';
import { fetchChatHistory } from '../api/chatApi';

const ChatContext = createContext(null);

const createInitialRoomState = () => ({
  status: 'idle',
  error: null,
  messages: [],
  activeUsers: [],
  metadata: {},
  refCount: 0,
  lastEventAt: null,
  hasHistory: false,
  isFetchingHistory: false,
});

const toError = (value) => {
  if (!value) return null;
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  if (typeof value === 'object' && value.message) return new Error(value.message);
  return new Error('Une erreur inconnue est survenue.');
};

const eventTypeMatches = (type, expected) => {
  if (!type) return false;
  if (type === expected) return true;
  if (type === `chat.${expected}`) return true;
  if (type.endsWith(`.${expected}`)) return true;
  if (type.endsWith(`:${expected}`)) return true;
  return false;
};

const eventMatchesAny = (type, ...expected) => expected.some((item) => eventTypeMatches(type, item));

const collectMessagesFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.messages)) return payload.messages;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data?.messages)) return payload.data.messages;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.conversation?.messages)) return payload.conversation.messages;
  if (Array.isArray(payload.history)) return payload.history;
  if (Array.isArray(payload.entries)) return payload.entries;
  return [];
};

const collectUsersFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.users)) return payload.users;
  if (Array.isArray(payload.activeUsers)) return payload.activeUsers;
  if (Array.isArray(payload.active_users)) return payload.active_users;
  if (Array.isArray(payload.data?.users)) return payload.data.users;
  if (Array.isArray(payload.data?.active_users)) return payload.data.active_users;
  if (Array.isArray(payload.state?.users)) return payload.state.users;
  return [];
};

const normalizeMessage = (raw) => {
  if (!raw) return null;
  const source = raw.payload || raw.message || raw.data?.message || raw.data || raw;
  if (!source) return null;

  const role =
    source.role ||
    source.author_role ||
    source.sender_role ||
    source.sender?.role ||
    raw.role ||
    null;

  let username =
    source.username ||
    source.user?.username ||
    source.author ||
    source.sender?.username ||
    source.sender?.name ||
    source.sender_name ||
    source.display_name ||
    raw.username ||
    null;

  if (!username) {
    if (role === 'assistant' || source.type === 'assistant') {
      username = source.assistant_name || source.bot_name || 'Nanshe';
    } else if (role === 'user') {
      username = source.user?.name || source.user_name || 'Utilisateur';
    } else if (role === 'system' || source.system || source.type === 'system') {
      username = 'Système';
    }
  }

  if (!username) {
    username = 'Utilisateur';
  }

  const id =
    source.id ||
    source.message_id ||
    source.uuid ||
    source._id ||
    raw.id ||
    raw.message_id ||
    raw.uuid ||
    `${username}-${
      source.created_at ||
      source.createdAt ||
      source.created ||
      source.timestamp ||
      source.sent_at ||
      raw.timestamp ||
      Date.now()
    }`;

  const createdAt =
    source.created_at ||
    source.createdAt ||
    source.created ||
    source.timestamp ||
    source.sent_at ||
    raw.timestamp ||
    new Date().toISOString();

  const contentCandidates = [];
  if (typeof source.content === 'string') contentCandidates.push(source.content);
  if (typeof source.message === 'string') contentCandidates.push(source.message);
  if (typeof source.text === 'string') contentCandidates.push(source.text);
  if (typeof source.body === 'string') contentCandidates.push(source.body);
  if (typeof source.value === 'string') contentCandidates.push(source.value);
  if (typeof source.prompt === 'string') contentCandidates.push(source.prompt);
  if (typeof source.output === 'string') contentCandidates.push(source.output);
  if (typeof source.summary === 'string') contentCandidates.push(source.summary);
  if (typeof raw.content === 'string') contentCandidates.push(raw.content);
  if (typeof raw.text === 'string') contentCandidates.push(raw.text);
  if (typeof raw.message === 'string') contentCandidates.push(raw.message);
  if (typeof source.data?.content === 'string') contentCandidates.push(source.data.content);
  if (typeof source.data?.text === 'string') contentCandidates.push(source.data.text);
  if (Array.isArray(source.parts)) {
    source.parts.forEach((part) => {
      if (typeof part === 'string') {
        contentCandidates.push(part);
      } else if (part && typeof part === 'object') {
        if (typeof part.content === 'string') contentCandidates.push(part.content);
        if (typeof part.text === 'string') contentCandidates.push(part.text);
        if (typeof part.value === 'string') contentCandidates.push(part.value);
      }
    });
  }
  const content = contentCandidates.find((entry) => typeof entry === 'string' && entry.trim().length > 0) || '';

  const domain =
    source.domain ||
    source.room?.domain ||
    source.metadata?.domain ||
    source.context?.domain ||
    raw.domain ||
    null;
  const area =
    source.area ||
    source.topic_area ||
    source.metadata?.area ||
    source.context?.area ||
    raw.area ||
    null;
  const system = Boolean(source.system || source.type === 'system' || role === 'system');

  return {
    id,
    username,
    content,
    domain,
    area,
    createdAt,
    system,
    role: role || (system ? 'system' : undefined),
    userId: source.user_id || source.userId || source.user?.id || source.sender?.id || raw.user_id || null,
    conversationId:
      source.conversation_id ||
      source.conversationId ||
      source.conversation?.id ||
      raw.conversation_id ||
      null,
  };
};

const normalizeUser = (raw) => {
  if (!raw) return null;
  const source = raw.user || raw;
  const username =
    source.username ||
    source.name ||
    source.display_name ||
    source.handle ||
    source.user?.username;
  if (!username) return null;
  return {
    id: source.id || source.user_id || raw.id || username,
    username,
    avatar: source.avatar || source.avatar_url || source.image || source.user?.avatar || null,
    domain: source.domain || source.room?.domain || raw.domain || null,
    area: source.area || source.topic_area || raw.area || null,
    status: source.status || raw.status || 'online',
    role: source.role || raw.role || null,
  };
};

const mergeMessages = (current = [], incoming = []) => {
  if (!incoming || incoming.length === 0) return current;
  const registry = new Map();
  current.forEach((message) => {
    const key = message.id || `${message.username}-${message.createdAt}`;
    registry.set(key, message);
  });
  incoming.forEach((message) => {
    if (!message) return;
    const key = message.id || `${message.username}-${message.createdAt}`;
    registry.set(key, { ...(registry.get(key) || {}), ...message });
  });
  return Array.from(registry.values()).sort((a, b) => {
    const left = new Date(a.createdAt).getTime();
    const right = new Date(b.createdAt).getTime();
    return left - right;
  });
};

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState({});
  const socketsRef = useRef(new Map());
  const historyRequestsRef = useRef(new Map());

  const handleIncoming = useCallback((roomId, rawData) => {
    if (!rawData) return;
    let parsed;
    if (typeof rawData === 'string') {
      try {
        parsed = JSON.parse(rawData);
      } catch (error) {
        console.warn('Unable to parse chat payload', error, rawData);
        return;
      }
    } else if (typeof rawData === 'object') {
      parsed = rawData;
    } else {
      return;
    }

    setRooms((prev) => {
      const current = prev[roomId] ? { ...prev[roomId] } : createInitialRoomState();
      const next = { ...current, lastEventAt: Date.now() };

      const payload = parsed.payload ?? parsed.data ?? parsed.body ?? parsed.message ?? parsed;
      const type = parsed.type || parsed.event || payload?.type || payload?.event || payload?.kind;

      const historyItems = [];
      if (Array.isArray(parsed)) {
        historyItems.push(...parsed);
      }
      const payloadMessages = collectMessagesFromPayload(payload);
      if (payloadMessages.length > 0) {
        historyItems.push(...payloadMessages);
      }

      if (historyItems.length > 0) {
        const history = historyItems.map((item) => normalizeMessage(item)).filter(Boolean);
        if (history.length > 0) {
          next.messages = mergeMessages(current.messages, history);
        }
        next.hasHistory = true;
        next.isFetchingHistory = false;
        if (next.status === 'loading-history') {
          next.status = 'idle';
        }
        return { ...prev, [roomId]: next };
      }

      if (
        eventMatchesAny(
          type,
          'message',
          'message.created',
          'conversation.message',
          'conversation.message.created',
          'chat.message.created',
          'chat.message'
        ) ||
        payload?.kind === 'message' ||
        (!type && payload && (payload.content || payload.message || payload.text))
      ) {
        const messagePayload = payload?.message || payload?.data || payload?.entry || payload;
        const message = normalizeMessage(messagePayload);
        if (!message) return prev;
        next.messages = mergeMessages(current.messages, [message]);
        next.isFetchingHistory = false;
        if (next.status === 'loading-history') {
          next.status = 'idle';
        }
        return { ...prev, [roomId]: next };
      }

      if (
        eventMatchesAny(type, 'history', 'history.loaded', 'conversation.history', 'conversation.history.loaded') ||
        payload?.kind === 'history'
      ) {
        const history = collectMessagesFromPayload(payload)
          .map((item) => normalizeMessage(item))
          .filter(Boolean);
        if (history.length > 0) {
          next.messages = mergeMessages(current.messages, history);
        }
        next.hasHistory = true;
        next.isFetchingHistory = false;
        if (next.status === 'loading-history') {
          next.status = 'idle';
        }
        return { ...prev, [roomId]: next };
      }

      const usersFromPayload = collectUsersFromPayload(payload);
      if (eventMatchesAny(type, 'users', 'presence', 'active_users') || usersFromPayload.length > 0) {
        const users = usersFromPayload
          .map((item) => normalizeUser(item))
          .filter(Boolean);
        next.activeUsers = users;
        next.isFetchingHistory = false;
        if (next.status === 'loading-history') {
          next.status = 'idle';
        }
        return { ...prev, [roomId]: next };
      }

      if (eventMatchesAny(type, 'metadata', 'room.metadata') && payload?.metadata) {
        next.metadata = { ...current.metadata, ...payload.metadata };
        next.isFetchingHistory = false;
        return { ...prev, [roomId]: next };
      }

      if (eventMatchesAny(type, 'error', 'conversation.error')) {
        next.error = toError(payload?.error || payload);
        next.status = 'error';
        next.isFetchingHistory = false;
        return { ...prev, [roomId]: next };
      }

      if (eventMatchesAny(type, 'system', 'system.message')) {
        const message = normalizeMessage({ ...payload, system: true });
        if (!message) return prev;
        next.messages = mergeMessages(current.messages, [message]);
        next.isFetchingHistory = false;
        if (next.status === 'loading-history') {
          next.status = 'idle';
        }
        return { ...prev, [roomId]: next };
      }

      if (payload?.metadata && typeof payload.metadata === 'object') {
        next.metadata = { ...current.metadata, ...payload.metadata };
      }

      if (payload?.content || payload?.message || payload?.text) {
        const message = normalizeMessage(payload);
        if (!message) return prev;
        next.messages = mergeMessages(current.messages, [message]);
        next.isFetchingHistory = false;
        if (next.status === 'loading-history') {
          next.status = 'idle';
        }
        return { ...prev, [roomId]: next };
      }

      next.isFetchingHistory = false;
      if (next.status === 'loading-history') {
        next.status = 'idle';
      }
      return { ...prev, [roomId]: next };
    });
  }, []);

  const loadHistory = useCallback(
    async (targetRoomId, { requestId, params, skipIfLoaded = true } = {}) => {
      if (!targetRoomId) return null;
      const effectiveRequestId = requestId || targetRoomId;
      const paramsKey = params && typeof params === 'object' ? JSON.stringify(params) : '';
      const cacheKey = `${targetRoomId}::${effectiveRequestId}::${paramsKey}`;
      if (historyRequestsRef.current.has(cacheKey)) {
        return historyRequestsRef.current.get(cacheKey);
      }

      let shouldAbort = false;

      setRooms((prev) => {
        const current = prev[targetRoomId] ? { ...prev[targetRoomId] } : createInitialRoomState();
        if (skipIfLoaded && current.hasHistory) {
          shouldAbort = true;
          return prev;
        }
        return {
          ...prev,
          [targetRoomId]: {
            ...current,
            isFetchingHistory: true,
            status: current.status === 'idle' ? 'loading-history' : current.status,
            error: current.error,
          },
        };
      });

      if (shouldAbort) {
        return null;
      }

      const requestPromise = (async () => {
        try {
          const response = await fetchChatHistory(effectiveRequestId, params || {});
          const items = Array.isArray(response) ? response : [];
          const messages = items.map((item) => normalizeMessage(item)).filter(Boolean);
          setRooms((prev) => {
            const current = prev[targetRoomId] ? { ...prev[targetRoomId] } : createInitialRoomState();
            return {
              ...prev,
              [targetRoomId]: {
                ...current,
                messages: mergeMessages(current.messages, messages),
                hasHistory: true,
                isFetchingHistory: false,
                status: current.status === 'loading-history' ? 'idle' : current.status,
                lastEventAt: Date.now(),
              },
            };
          });
          return messages;
        } catch (error) {
          setRooms((prev) => {
            const current = prev[targetRoomId] ? { ...prev[targetRoomId] } : createInitialRoomState();
            return {
              ...prev,
              [targetRoomId]: {
                ...current,
                isFetchingHistory: false,
                status: current.status === 'loading-history' ? 'error' : current.status,
                error: toError(error),
                lastEventAt: Date.now(),
              },
            };
          });
          throw error;
        } finally {
          historyRequestsRef.current.delete(cacheKey);
        }
      })();

      historyRequestsRef.current.set(cacheKey, requestPromise);
      return requestPromise;
    },
    []
  );

  const closeSocket = useCallback((roomId, code = 1000, reason = 'client-leave') => {
    const socket = socketsRef.current.get(roomId);
    if (!socket) return;
    try {
      socket.close(code, reason);
    } catch (error) {
      console.warn('Unable to close chat socket', error);
    }
    socketsRef.current.delete(roomId);
  }, []);

  const connectSocket = useCallback(
    (roomId, metadata = {}) => {
      if (!roomId || socketsRef.current.has(roomId)) return;
      let socket;
      try {
        socket = new WebSocket(buildChatSocketUrl(roomId, metadata));
      } catch (error) {
        console.error('Unable to create chat socket', error);
        setRooms((prev) => {
          const current = prev[roomId] ? { ...prev[roomId] } : createInitialRoomState();
          return {
            ...prev,
            [roomId]: { ...current, status: 'error', error: toError(error) },
          };
        });
        return;
      }

      socketsRef.current.set(roomId, socket);

      setRooms((prev) => {
        const current = prev[roomId] ? { ...prev[roomId] } : createInitialRoomState();
        return {
          ...prev,
          [roomId]: {
            ...current,
            status: 'connecting',
            error: null,
            metadata: { ...current.metadata, ...metadata },
          },
        };
      });

      socket.onopen = () => {
        setRooms((prev) => {
          const current = prev[roomId] ? { ...prev[roomId] } : createInitialRoomState();
          return {
            ...prev,
            [roomId]: { ...current, status: 'connected', error: null },
          };
        });
        if (metadata && Object.keys(metadata).length > 0) {
          try {
            socket.send(JSON.stringify({ type: 'join', payload: metadata }));
          } catch (error) {
            console.warn('Unable to send join metadata', error);
          }
        }
      };

      socket.onmessage = (event) => {
        handleIncoming(roomId, event.data);
      };

      socket.onerror = (event) => {
        console.error('Chat socket error', event);
        setRooms((prev) => {
          const current = prev[roomId] ? { ...prev[roomId] } : createInitialRoomState();
          return {
            ...prev,
            [roomId]: { ...current, status: 'error', error: toError(event) },
          };
        });
      };

      socket.onclose = (event) => {
        socketsRef.current.delete(roomId);
        setRooms((prev) => {
          const current = prev[roomId] ? { ...prev[roomId] } : createInitialRoomState();
          return {
            ...prev,
            [roomId]: {
              ...current,
              status: event.wasClean ? 'closed' : 'error',
              error: event.wasClean ? current.error : current.error || new Error(`Connexion perdue (${event.code})`),
            },
          };
        });
      };
    },
    [handleIncoming]
  );

  const joinRoom = useCallback(
    (roomId, options = {}) => {
      if (!roomId) return;
      const metadata = options.metadata || {};
      setRooms((prev) => {
        const current = prev[roomId] ? { ...prev[roomId] } : createInitialRoomState();
        return {
          ...prev,
          [roomId]: {
            ...current,
            refCount: (current.refCount || 0) + 1,
            metadata: { ...current.metadata, ...metadata },
          },
        };
      });
      if (!socketsRef.current.has(roomId)) {
        connectSocket(roomId, metadata);
      }
    },
    [connectSocket]
  );

  const leaveRoom = useCallback((roomId) => {
    if (!roomId) return;
    setRooms((prev) => {
      const current = prev[roomId];
      if (!current) return prev;
      const nextCount = Math.max(0, (current.refCount || 1) - 1);
      if (nextCount > 0) {
        return {
          ...prev,
          [roomId]: { ...current, refCount: nextCount },
        };
      }
      closeSocket(roomId);
      return {
        ...prev,
        [roomId]: { ...current, refCount: 0, status: 'idle' },
      };
    });
  }, [closeSocket]);

  const sendMessageInternal = useCallback((roomId, message) => {
    const socket = socketsRef.current.get(roomId);
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('Le salon de discussion n’est pas connecté.');
    }
    const payload = message && message.type ? message : { type: 'message', payload: message };
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const value = useMemo(
    () => ({
      rooms,
      joinRoom,
      leaveRoom,
      sendMessage: sendMessageInternal,
      loadHistory,
    }),
    [joinRoom, leaveRoom, loadHistory, rooms, sendMessageInternal]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const useChatRoom = (roomId, { metadata, autoJoin = true, history } = {}) => {
  const { rooms, joinRoom, leaveRoom, sendMessage, loadHistory } = useChatContext();
  const metadataRef = useRef(metadata);
  metadataRef.current = metadata;

  const historyConfig = useMemo(() => {
    if (!history) {
      return { autoLoad: true, requestId: null, params: null, skipIfLoaded: true };
    }
    return {
      autoLoad: history.autoLoad !== false,
      requestId: history.requestId || history.roomId || null,
      params: history.params || null,
      skipIfLoaded: history.skipIfLoaded !== false,
      reloadToken: history.reloadToken || null,
    };
  }, [history]);

  const historyOptionsRef = useRef(historyConfig);
  historyOptionsRef.current = historyConfig;

  const historyKey = useMemo(() => {
    if (!historyConfig.autoLoad) return null;
    const paramsKey = historyConfig.params ? JSON.stringify(historyConfig.params) : '';
    return `${roomId || ''}::${historyConfig.requestId || ''}::${paramsKey}::${historyConfig.reloadToken || ''}`;
  }, [historyConfig, roomId]);

  useEffect(() => {
    if (!autoJoin || !roomId) return undefined;
    joinRoom(roomId, { metadata: metadataRef.current });
    return () => {
      leaveRoom(roomId);
    };
  }, [autoJoin, joinRoom, leaveRoom, roomId]);

  useEffect(() => {
    if (!roomId || !historyConfig.autoLoad) return;
    const options = historyOptionsRef.current;
    loadHistory(roomId, {
      requestId: options.requestId || undefined,
      params: options.params || undefined,
      skipIfLoaded: options.skipIfLoaded,
    });
  }, [historyKey, historyConfig.autoLoad, loadHistory, roomId]);

  const roomState = rooms[roomId] || createInitialRoomState();

  const send = useCallback(
    (payload) => {
      if (!roomId) return false;
      return sendMessage(roomId, payload);
    },
    [roomId, sendMessage]
  );

  return {
    ...roomState,
    sendMessage: send,
    requestHistory: (options) =>
      loadHistory(roomId, {
        ...(options || {}),
        requestId: options?.requestId || options?.roomId || historyConfig.requestId || roomId,
      }),
  };
};
