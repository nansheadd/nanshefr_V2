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

export const buildApiUrl = (path = '') => {
  if (!path) return API_V2_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_V2_URL}${normalizedPath}`;
};
