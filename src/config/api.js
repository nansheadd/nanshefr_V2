const DEV_BACKEND_FALLBACK = 'http://localhost:8000';

const trimTrailingSlashes = (value) => value.replace(/\/+$/, '');

const resolveBaseUrl = () => {
  const envValue = import.meta.env?.VITE_API_BASE_URL;
  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return trimTrailingSlashes(envValue.trim());
  }

  if (typeof window !== 'undefined' && window.location) {
    const origin = trimTrailingSlashes(window.location.origin);
    if (/localhost:\d+$/.test(origin)) {
      return DEV_BACKEND_FALLBACK;
    }
    return origin;
  }

  return DEV_BACKEND_FALLBACK;
};

export const API_BASE_URL = resolveBaseUrl();
export const API_V2_URL = `${API_BASE_URL}/api/v2`;

export const API_WS_URL = (() => {
  try {
    const { protocol, host } = new URL(API_BASE_URL);
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${host}/api/v2/ws`;
  } catch (error) {
    console.warn('Unable to derive WebSocket URL from API_BASE_URL. Falling back to localhost.', error);
    return 'ws://localhost:8000/api/v2/ws';
  }
})();

export const CHAT_WS_URL = (() => {
  try {
    const base = new URL(API_WS_URL);
    const trimmedPath = base.pathname.replace(/\/+$/, '');
    const hasChatSuffix = /\/chat$/.test(trimmedPath);
    base.pathname = hasChatSuffix ? trimmedPath : `${trimmedPath}/chat`;
    base.search = '';
    base.hash = '';
    return base.toString();
  } catch (error) {
    console.warn('Unable to derive Chat WebSocket URL from API_WS_URL. Falling back to localhost.', error);
    return 'ws://localhost:8000/api/v2/ws/chat';
  }
})();

export const buildChatSocketUrl = (room, params = {}) => {
  try {
    const url = new URL(CHAT_WS_URL);
    if (room) {
      url.searchParams.set('room', room);
    }
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const stringValue = typeof value === 'string' ? value : String(value);
      if (stringValue.length === 0) return;
      url.searchParams.set(key, stringValue);
    });
    return url.toString();
  } catch (error) {
    console.warn('Unable to build chat WebSocket URL. Falling back to default.', error);
    const safeRoom = encodeURIComponent(room || 'general');
    return `${CHAT_WS_URL}?room=${safeRoom}`;
  }
};

export const buildApiUrl = (path = '') => {
  if (!path) return API_V2_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_V2_URL}${normalizedPath}`;
};
