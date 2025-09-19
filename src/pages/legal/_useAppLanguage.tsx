import { useMemo } from 'react';

export function useAppLanguage() {
const lang = useMemo(() => localStorage.getItem('language') || 'fr', []);
return lang as 'fr' | 'en' | 'nl';
}