// src/utils/authTokens.js
// Centralise the logic used to persist the access token returned by the API
// when cookies are not available (e.g. during local development over HTTP).

const STORAGE_KEY = 'nanshe.access_token';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getStoredAccessToken = () => {
  if (!isBrowser()) {
    console.debug('[AuthTokens] getStoredAccessToken skipped: not in browser context.');
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (rawValue) {
    console.debug('[AuthTokens] Retrieved access token from storage.', {
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

  const normalizedToken = typeof token === 'string' ? token.trim() : '';

  if (normalizedToken) {
    window.localStorage.setItem(STORAGE_KEY, normalizedToken);
    console.info('[AuthTokens] Stored access token in localStorage.', {
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

  window.localStorage.removeItem(STORAGE_KEY);
  console.info('[AuthTokens] Access token removed from localStorage.');
};

