// src/utils/authTokens.js
// Centralise the logic used to persist the access token returned by the API
// when cookies are not available (e.g. during local development over HTTP).

const PRIMARY_STORAGE_KEY = 'access_token';
const LEGACY_STORAGE_KEYS = ['nanshe.access_token'];
const COOKIE_NAME = 'access_token';

const isBrowser = () => typeof window !== 'undefined';
const hasLocalStorage = () => isBrowser() && typeof window.localStorage !== 'undefined';

const getCookieValue = (name) => {
  if (!isBrowser() || typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie ?? '';
  const match = cookies
    .split(';')
    .map((part) => part.trim())
    .find((cookie) => cookie.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  const value = match.slice(name.length + 1);
  return value ? decodeURIComponent(value) : null;
};

export const getStoredAccessToken = () => {
  if (!isBrowser()) {
    console.debug('[AuthTokens] getStoredAccessToken skipped: not in browser context.');
    return null;
  }

  const cookieToken = getCookieValue(COOKIE_NAME);
  if (cookieToken) {
    console.debug('[AuthTokens] Retrieved access token from cookie.', {
      length: cookieToken.length,
    });
    return cookieToken;
  }

  if (!hasLocalStorage()) {
    console.debug('[AuthTokens] No cookies available and localStorage is unsupported.');
    return null;
  }

  const keysToInspect = [PRIMARY_STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
  for (const key of keysToInspect) {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      continue;
    }

    console.debug('[AuthTokens] Retrieved access token from localStorage fallback.', {
      length: rawValue.length,
      key,
    });
    if (key !== PRIMARY_STORAGE_KEY) {
      try {
        window.localStorage.setItem(PRIMARY_STORAGE_KEY, rawValue);
        window.localStorage.removeItem(key);
        console.info('[AuthTokens] Migrated legacy access token storage key.', { from: key });
      } catch (error) {
        console.warn('[AuthTokens] Failed to migrate legacy access token storage key.', { from: key, error });
      }
    }

    return rawValue;
  }

  console.debug('[AuthTokens] No access token present in storage.');
  return null;
};

export const setStoredAccessToken = (token) => {
  if (!isBrowser()) {
    console.debug('[AuthTokens] setStoredAccessToken skipped: not in browser context.');
    return;
  }

  const cookieToken = getCookieValue(COOKIE_NAME);
  if (cookieToken) {
    console.info('[AuthTokens] Access token provided via cookie; skipping localStorage fallback.', {
      length: cookieToken.length,
    });
    if (hasLocalStorage()) {
      window.localStorage.removeItem(PRIMARY_STORAGE_KEY);
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(legacyKey);
      }
    }
    return;
  }

  if (!hasLocalStorage()) {
    console.warn('[AuthTokens] Cannot persist access token: no cookie detected and localStorage unavailable.');
    return;
  }

  const normalizedToken = typeof token === 'string' ? token.trim() : '';

  if (normalizedToken) {
    window.localStorage.setItem(PRIMARY_STORAGE_KEY, normalizedToken);
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
    console.info('[AuthTokens] Stored access token in localStorage fallback.', {
      length: normalizedToken.length,
    });
  } else {
    window.localStorage.removeItem(PRIMARY_STORAGE_KEY);
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
    console.warn('[AuthTokens] Cleared access token because provided value was empty.');
  }
};

export const clearStoredAccessToken = () => {
  if (!isBrowser()) {
    console.debug('[AuthTokens] clearStoredAccessToken skipped: not in browser context.');
    return;
  }

  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax;`;
    console.info('[AuthTokens] Requested browser to remove access token cookie.');
  }

  if (hasLocalStorage()) {
    window.localStorage.removeItem(PRIMARY_STORAGE_KEY);
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
    console.info('[AuthTokens] Access token removed from localStorage fallback.');
  }
};

