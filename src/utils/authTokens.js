// src/utils/authTokens.js
// Centralise the logic used to persist the access token returned by the API
// when cookies are not available (e.g. during local development over HTTP).

const STORAGE_KEY = 'nanshe.access_token';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getStoredAccessToken = () => {
  if (!isBrowser()) {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEY);
};

export const setStoredAccessToken = (token) => {
  if (!isBrowser()) {
    return;
  }
  if (token) {
    window.localStorage.setItem(STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

export const clearStoredAccessToken = () => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

