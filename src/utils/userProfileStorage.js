// src/utils/userProfileStorage.js
// Handle persisting the authenticated user profile between sessions so that
// customisations like avatar frames or titles remain visible after a reload.

const STORAGE_KEY = 'nanshe.user_profile';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getStoredUserProfile = () => {
  if (!isBrowser()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn('[userProfileStorage] Failed to read stored profile', error);
    return null;
  }
};

export const setStoredUserProfile = (profile) => {
  if (!isBrowser()) {
    return;
  }

  if (!profile || typeof profile !== 'object') {
    clearStoredUserProfile();
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('[userProfileStorage] Failed to persist profile', error);
  }
};

export const clearStoredUserProfile = () => {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[userProfileStorage] Failed to clear stored profile', error);
  }
};

