// src/components/dev/EmitBadgeButton.jsx
import { Button } from '@mui/material';
import { buildApiUrl } from '../../config/api';

export default function EmitBadgeButton() {
  const emit = async () => {
    try {
      const res = await fetch(buildApiUrl('/ws-test/emit-badge'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // <<< ENVOIE LE COOKIE access_token
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Échec émission badge de test', res.status, text);
      } else {
        console.log('Badge de test émis ✅');
      }
    } catch (e) {
      console.error('Erreur réseau pendant emit-badge', e);
    }
  };

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={emit}
      startIcon={<span>🏷️</span>}
      sx={{ borderRadius: 2 }}
    >
      Émettre un badge (test)
    </Button>
  );
}
