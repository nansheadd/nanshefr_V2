// src/utils/authTokens.js
// Centralise the logic used to persist the access token returned by the API
// when cookies are not available (e.g. during local development over HTTP).

const STORAGE_KEY = 'nanshe.access_token';
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

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (rawValue) {
    console.debug('[AuthTokens] Retrieved access token from localStorage fallback.', {
      length: rawValue.length,
    });
  } else {
    console.debug('[AuthTokens] No access token present in storage.');
  }

  return rawValue;
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
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return;
  }

  if (!hasLocalStorage()) {
    console.warn('[AuthTokens] Cannot persist access token: no cookie detected and localStorage unavailable.');
    return;
  }

  const normalizedToken = typeof token === 'string' ? token.trim() : '';

  if (normalizedToken) {
    window.localStorage.setItem(STORAGE_KEY, normalizedToken);
    console.info('[AuthTokens] Stored access token in localStorage fallback.', {
      length: normalizedToken.length,
    });
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
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
    window.localStorage.removeItem(STORAGE_KEY);
    console.info('[AuthTokens] Access token removed from localStorage fallback.');
  }
};

