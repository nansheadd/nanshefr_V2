// Fichier: src/theme/index.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { alpha } from '@mui/material';

const palette = {
  navy:  '#0D0F1E',
  plum:  '#6C3FA1',
  orchid:'#9E57C5',
  peach: '#F6B899',
  white: '#FFFFFF'
};

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: palette.orchid },
    secondary: { main: palette.peach },
    background: { default: palette.navy, paper: '#171a34' },
    text: { primary: palette.white, secondary: '#C9C9D5' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial",
    h1: { fontWeight: 800, letterSpacing: 0.3 },
    h2: { fontWeight: 800, letterSpacing: 0.3 },
    h3: { fontWeight: 700, letterSpacing: 0.2 },
    h4: { fontWeight: 700, letterSpacing: 0.2 },
    h5: { fontWeight: 700, letterSpacing: 0.2 },
    h6: { fontWeight: 700, letterSpacing: 0.1 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: .4 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { boxSizing: 'border-box' },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          background:
            `radial-gradient(1200px 600px at 10% 10%, ${alpha(palette.orchid,0.13)}, transparent 60%),
             radial-gradient(1200px 600px at 90% 90%, ${alpha(palette.peach,0.13)}, transparent 60%),
             linear-gradient(135deg, ${palette.navy} 0%, #151833 100%)`
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))`,
          border: `1px solid ${alpha(palette.orchid,0.2)}`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 20px 50px rgba(0,0,0,.35)`
        }
      }
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12 } },
      variants: [
        {
          props: { variant: 'gradient' },
          style: {
            background: `linear-gradient(90deg, ${palette.plum}, ${palette.orchid})`,
            boxShadow: `0 10px 24px ${alpha(palette.plum,0.35)}`,
            '&:hover': {
              background: `linear-gradient(90deg, ${palette.orchid}, ${palette.plum})`,
              boxShadow: `0 10px 30px ${alpha(palette.orchid,0.4)}`
            }
          }
        }
      ]
    },
    MuiLink: { styleOverrides: { root: { color: palette.peach, fontWeight: 600 } } }
  }
});

theme = responsiveFontSizes(theme, { factor: 2 });
export default theme;
