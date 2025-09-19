// Fichier: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme';
import { ColorModeContext } from './theme/ColorModeContext';
import App from './App';
import './index.css';


import { CookieConsentProvider } from './components/cookies/CookieConsentProvider';
import CookieBanner from './components/cookies/CookieBanner';
import CookieSettingsDialog from './components/cookies/CookieSettingsDialog';


// On importe le Provider que nous avons créé
import { WebSocketProvider } from './contexts/WebSocketProvider';
import { I18nProvider } from './i18n/I18nContext';

const queryClient = new QueryClient();

export function Main() {
  const [mode, setMode] = React.useState(
    () => localStorage.getItem('color-mode') || 'dark'
  );

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem('color-mode', next);
          return next;
        });
      }
    }),
    [mode]
  );

  const theme = React.useMemo(() => getTheme(mode), [mode]);

return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <I18nProvider defaultLang="fr">
          <CookieConsentProvider
            onChange={(consent) => {
              // 👉 Hook pour (dés)activer GA4 selon le choix
              window['ga-disable-G-XXXXXXX'] = !consent.categories.analytics;
            }}
          >
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <WebSocketProvider>
                  <App />

                  {/* ✅ maintenant DANS le Router */}
                  <CookieBanner />
                  <CookieSettingsDialog />
                </WebSocketProvider>
              </QueryClientProvider>
            </BrowserRouter>
          </CookieConsentProvider>
        </I18nProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);