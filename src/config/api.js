import { getStoredAccessToken } from '../utils/authTokens';

const DEV_BACKEND_FALLBACK = 'http://localhost:8000';
const PROD_BACKEND_FALLBACK = 'https://nanshe-v2.vercel.app';

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
    // Always honor the explicit environment override to avoid accidentally
    // switching to a different origin. This is critical for authentication
    // flows relying on same-site cookies (e.g. when the frontend is served
    // from nanshe.vercel.app and proxies API requests through the same
    // domain). Falling back to another hostname would make the cookies
    // third-party and therefore unusable.
    return trimTrailingSlashes(envValue.trim());
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

if (typeof window !== 'undefined') {
  console.info('[API][config] Resolved API base URL.', {
    apiBaseUrl: API_BASE_URL,
    apiV2Url: API_V2_URL,
    location: window?.location?.href ?? null,
    envBaseUrl: import.meta.env?.VITE_API_BASE_URL ?? null,
  });
}

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
    const hasConversationSuffix = /\/conversations$/.test(trimmedPath);
    base.pathname = hasConversationSuffix ? trimmedPath : `${trimmedPath}/conversations`;
    base.search = '';
    base.hash = '';
    return base.toString();
  } catch (error) {
    console.warn('Unable to derive Chat WebSocket URL from API_WS_URL. Falling back to localhost.', error);
    return 'ws://localhost:8000/api/v2/ws/conversations';
  }
})();

const WS_FALLBACK_URL = 'ws://localhost:8000/api/v2/ws';
const CHAT_WS_FALLBACK_URL = 'ws://localhost:8000/api/v2/ws/conversations';

const sanitizeToken = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const applyFallbackToken = (url, explicitToken) => {
  const directToken = sanitizeToken(explicitToken);
  if (directToken) {
    url.searchParams.set('token', directToken);
    return;
  }

  const fallbackToken = sanitizeToken(getStoredAccessToken());
  if (fallbackToken) {
    url.searchParams.set('token', fallbackToken);
  } else {
    url.searchParams.delete('token');
  }
};

const buildWsUrl = (baseUrl, params = {}, fallbackUrl = WS_FALLBACK_URL) => {
  try {
    const url = new URL(baseUrl);
    const entries = Object.entries(params || {});
    let explicitToken;

    entries.forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const stringValue = typeof value === 'string' ? value : String(value);
      if (!stringValue || stringValue.length === 0) return;
      if (key === 'token') {
        explicitToken = stringValue;
      }
      url.searchParams.set(key, stringValue);
    });

    applyFallbackToken(url, explicitToken);
    url.hash = '';
    return url.toString();
  } catch (error) {
    console.warn('Unable to build WebSocket URL. Falling back to default.', { baseUrl, error });
    if (fallbackUrl && fallbackUrl !== baseUrl) {
      return buildWsUrl(fallbackUrl, params, null);
    }
    return fallbackUrl || baseUrl;
  }
};

export const buildApiWsUrl = (params = {}) => buildWsUrl(API_WS_URL, params, WS_FALLBACK_URL);

export const buildChatSocketUrl = (room, params = {}) => {
  const mergedParams = { ...(params || {}) };
  if (room) {
    mergedParams.room = room;
  }

  const built = buildWsUrl(CHAT_WS_URL, mergedParams, CHAT_WS_FALLBACK_URL);

  try {
    const parsed = new URL(built);
    if (!parsed.searchParams.has('room')) {
      parsed.searchParams.set('room', room || 'general');
    }
    return parsed.toString();
  } catch (error) {
    console.warn('Unable to normalize chat WebSocket URL. Returning raw value.', { built, error });
    if (built && built.includes('room=')) {
      return built;
    }
    const safeRoom = encodeURIComponent(room || 'general');
    const joiner = built && built.includes('?') ? '&' : '?';
    return `${built || CHAT_WS_FALLBACK_URL}${joiner}room=${safeRoom}`;
  }
};

export const buildApiUrl = (path = '') => {
  if (!path) return API_V2_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_V2_URL}${normalizedPath}`;
};
