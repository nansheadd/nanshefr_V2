// src/utils/authTokens.js
// Fallback "localStorage" quand on ne peut pas lire le cookie HttpOnly (normal en prod)

const PRIMARY_STORAGE_KEY = 'access_token';
const LEGACY_STORAGE_KEYS = ['nanshe.access_token'];

const isBrowser = () => typeof window !== 'undefined';
const hasLocalStorage = () => isBrowser() && typeof window.localStorage !== 'undefined';

export const getStoredAccessToken = () => {
  if (!hasLocalStorage()) return null;
  return window.localStorage.getItem(PRIMARY_STORAGE_KEY);
};

export const setStoredAccessToken = (token) => {
  if (!hasLocalStorage()) return;
  const normalized = typeof token === 'string' ? token.trim() : '';
  if (normalized) {
    window.localStorage.setItem(PRIMARY_STORAGE_KEY, normalized);
    for (const legacy of LEGACY_STORAGE_KEYS) window.localStorage.removeItem(legacy);
    // eslint-disable-next-line no-console
    console.info('[AuthTokens] Stored access token in localStorage fallback.', { length: normalized.length });
  } else {
    window.localStorage.removeItem(PRIMARY_STORAGE_KEY);
    for (const legacy of LEGACY_STORAGE_KEYS) window.localStorage.removeItem(legacy);
    // eslint-disable-next-line no-console
    console.warn('[AuthTokens] Cleared access token because provided value was empty.');
  }
};

export const clearStoredAccessToken = () => {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(PRIMARY_STORAGE_KEY);
  for (const legacy of LEGACY_STORAGE_KEYS) window.localStorage.removeItem(legacy);
  // Note: le cookie HttpOnly est supprimé côté serveur via POST /users/logout.
  // document.cookie ne peut pas supprimer un cookie HttpOnly (et encore moins cross-site).
  // eslint-disable-next-line no-console
  console.info('[AuthTokens] Access token removed from localStorage fallback.');
};
