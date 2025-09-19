import * as React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function LanguageSwitcher({ size = 'small', label = 'Lang' }) {
  const { language, setLanguage } = useI18n();
  return (
    <FormControl size={size}>
      <InputLabel id="lang-label">{label}</InputLabel>
      <Select
        labelId="lang-label"
        value={language}
        label={label}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <MenuItem value="fr">🇫🇷 FR</MenuItem>
        <MenuItem value="en">🇬🇧 EN</MenuItem>
        <MenuItem value="nl">🇳🇱 NL</MenuItem>
      </Select>
    </FormControl>
  );
}
