// src/consent/CookieConsentProvider.jsx
import * as React from 'react';

const STORAGE_KEY = 'cookie-consent-v1';

const defaultState = {
  decided: false,
  categories: {
    necessary: true,   // toujours vrai
    analytics: false   // GA4 opt-in
  }
};

const CookieConsentContext = React.createContext(null);

export function CookieConsentProvider({ children, onChange }) {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { decided: true, categories: { necessary: true, analytics: !!parsed.categories?.analytics } };
      }
    } catch {}
    return defaultState;
  });

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const persist = React.useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      categories: { analytics: !!next.categories.analytics },
      ts: Date.now()
    }));
    if (typeof onChange === 'function') onChange(next);
    // Event global si tu veux écouter ailleurs (ex: init GA)
    window.dispatchEvent(new CustomEvent('cookieconsentchange', { detail: next }));
  }, [onChange]);

  const acceptAll = React.useCallback(() => {
    const next = { decided: true, categories: { necessary: true, analytics: true } };
    setState(next); persist(next);
  }, [persist]);

  const rejectAll = React.useCallback(() => {
    const next = { decided: true, categories: { necessary: true, analytics: false } };
    setState(next); persist(next);
  }, [persist]);

  const save = React.useCallback((categories) => {
    const next = { decided: true, categories: { necessary: true, analytics: !!categories.analytics } };
    setState(next); persist(next); setSettingsOpen(false);
  }, [persist]);

  const value = React.useMemo(() => ({
    consent: state,
    settingsOpen,
    openSettings: (open = true) => setSettingsOpen(open),
    acceptAll,
    rejectAll,
    save
  }), [state, settingsOpen, acceptAll, rejectAll, save]);

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = React.useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return ctx;
}
