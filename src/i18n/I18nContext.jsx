import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import fr from './fr.json';
import en from './en.json';
import nl from './nl.json';

const dictionaries = { fr, en, nl };
const I18nContext = createContext(null);

export function I18nProvider({ children, defaultLang = 'fr' }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('language') || defaultLang
  );

  useEffect(() => {
    localStorage.setItem('language', language);
    // accessibilité / SEO
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useMemo(
    () => (path, arg, fallback) => {
      let replacements = null;
      let fallbackValue = fallback;

      if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
        replacements = arg;
      } else if (typeof arg === 'string') {
        fallbackValue = arg;
      }

      const keys = path.split('.');
      let value = dictionaries[language];
      for (const key of keys) value = value?.[key];

      if (value == null) {
        value = fallbackValue ?? path;
      }

      if (replacements && typeof value === 'string') {
        Object.entries(replacements).forEach(([token, replacement]) => {
          value = value.replace(new RegExp(`{{\\s*${token}\\s*}}`, 'g'), String(replacement));
        });
      }

      return value;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, dict: dictionaries[language] }),
    [language, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
