import { createContext } from 'react';

export const ColorModeContext = createContext({ mode: 'dark', toggleColorMode: () => {} });

export default ColorModeContext;
