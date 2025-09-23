const DEV_BACKEND_FALLBACK = 'http://localhost:8000';
const PROD_BACKEND_FALLBACK =
  'https://nanshe-v2-e3etdk061-nansheadds-projects.vercel.app';

const trimTrailingSlashes = (value = '') => value.replace(/\/+$/, '');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const getWindowLocation = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.location ?? null;
};

const isLocalHostname = (hostname = '') => {
  if (!hostname) return false;
  if (hostname === 'localhost' || hostname === '::1') return true;
  if (/^127(?:\.\d{1,3}){3}$/.test(hostname)) return true;
  return false;
};

const isVercelHostname = (hostname = '') => hostname.endsWith('.vercel.app');

const getHostnameFromUrl = (value) => {
  if (!isNonEmptyString(value)) {
    return '';
  }
  try {
    return new URL(value).hostname;
  } catch (error) {
    console.warn('Unable to parse hostname from provided API base URL.', value, error);
    return '';
  }
};

const shouldPreferProdBackend = (hostname) => {
  if (!hostname) {
    return false;
  }
  if (isLocalHostname(hostname)) {
    return false;
  }
  if (isVercelHostname(hostname)) {
    return true;
  }
  return false;
};

const resolveBaseUrl = () => {
  const envValue = import.meta.env?.VITE_API_BASE_URL;
  const location = getWindowLocation();
  const hostname = location?.hostname ?? '';
  const isDevBuild = Boolean(import.meta.env?.DEV);
  const isProdBuild = Boolean(import.meta.env?.PROD);

  if (isNonEmptyString(envValue)) {
    const trimmedEnv = trimTrailingSlashes(envValue.trim());
    const envHostname = getHostnameFromUrl(trimmedEnv);
    if (envHostname && hostname && envHostname === hostname && shouldPreferProdBackend(hostname)) {
      return PROD_BACKEND_FALLBACK;
    }
    return trimmedEnv;
  }

  if (isDevBuild || isLocalHostname(hostname)) {
    return DEV_BACKEND_FALLBACK;
  }

  if (shouldPreferProdBackend(hostname)) {
    return PROD_BACKEND_FALLBACK;
  }

  if (location) {
    const origin = trimTrailingSlashes(location.origin);
    if (isNonEmptyString(origin)) {
      return origin;
    }
  }

  return isProdBuild ? PROD_BACKEND_FALLBACK : DEV_BACKEND_FALLBACK;
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
