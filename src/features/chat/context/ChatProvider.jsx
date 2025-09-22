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
  return type === `chat.${expected}`;
};

const normalizeMessage = (raw) => {
  if (!raw) return null;
  const source = raw.payload || raw.message || raw;
  if (!source) return null;

  const username = source.username || source.user?.username || source.author || 'Utilisateur';
  const id =
    source.id ||
    source.message_id ||
    source.uuid ||
    source._id ||
    `${username}-${source.created_at || source.timestamp || Date.now()}`;
  const createdAt =
    source.created_at || source.createdAt || source.timestamp || source.sent_at || new Date().toISOString();
  const content = source.content || source.message || source.text || '';
  const domain = source.domain || source.room?.domain || source.metadata?.domain || null;
  const area = source.area || source.topic_area || source.metadata?.area || null;
  const system = Boolean(source.system || source.type === 'system');

  return {
    id,
    username,
    content,
    domain,
    area,
    createdAt,
    system,
    userId: source.user_id || source.userId || source.user?.id || null,
  };
};

const normalizeUser = (raw) => {
  if (!raw) return null;
  const username = raw.username || raw.name || raw.display_name || raw.user?.username;
  if (!username) return null;
  return {
    id: raw.id || raw.user_id || username,
    username,
    avatar: raw.avatar || raw.avatar_url || raw.user?.avatar || null,
    domain: raw.domain || raw.room?.domain || null,
    area: raw.area || raw.topic_area || null,
    status: raw.status || 'online',
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

      const payload = parsed.payload ?? parsed;
      const type = parsed.type || parsed.event || payload?.type;

      if (Array.isArray(parsed) || Array.isArray(payload?.messages)) {
        const history = (Array.isArray(parsed) ? parsed : payload.messages)
          .map((item) => normalizeMessage(item))
          .filter(Boolean);
        next.messages = mergeMessages(current.messages, history);
        next.hasHistory = true;
        return { ...prev, [roomId]: next };
      }

      if (eventTypeMatches(type, 'message') || (!type && payload && (payload.content || payload.message))) {
        const message = normalizeMessage(payload);
        if (!message) return prev;
        next.messages = mergeMessages(current.messages, [message]);
        return { ...prev, [roomId]: next };
      }

      if (eventTypeMatches(type, 'history')) {
        const history = (payload?.messages || payload || [])
          .map((item) => normalizeMessage(item))
          .filter(Boolean);
        next.messages = mergeMessages(current.messages, history);
        next.hasHistory = true;
        return { ...prev, [roomId]: next };
      }

      if (eventTypeMatches(type, 'users')) {
        const users = (payload?.users || payload || [])
          .map((item) => normalizeUser(item))
          .filter(Boolean);
        next.activeUsers = users;
        return { ...prev, [roomId]: next };
      }

      if (eventTypeMatches(type, 'error')) {
        next.error = toError(payload?.error || payload);
        next.status = 'error';
        return { ...prev, [roomId]: next };
      }

      if (eventTypeMatches(type, 'system')) {
        const message = normalizeMessage({ ...payload, system: true });
        if (!message) return prev;
        next.messages = mergeMessages(current.messages, [message]);
        return { ...prev, [roomId]: next };
      }

      if (payload?.content || payload?.message) {
        const message = normalizeMessage(payload);
        if (!message) return prev;
        next.messages = mergeMessages(current.messages, [message]);
        return { ...prev, [roomId]: next };
      }

      return prev;
    });
  }, []);

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
    }),
    [joinRoom, leaveRoom, rooms, sendMessageInternal]
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

export const useChatRoom = (roomId, { metadata, autoJoin = true } = {}) => {
  const { rooms, joinRoom, leaveRoom, sendMessage } = useChatContext();
  const metadataRef = useRef(metadata);
  metadataRef.current = metadata;

  useEffect(() => {
    if (!autoJoin || !roomId) return undefined;
    joinRoom(roomId, { metadata: metadataRef.current });
    return () => {
      leaveRoom(roomId);
    };
  }, [autoJoin, joinRoom, leaveRoom, roomId]);

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
  };
};
