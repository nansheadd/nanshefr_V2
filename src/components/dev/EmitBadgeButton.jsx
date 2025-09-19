// src/components/dev/EmitBadgeButton.jsx
import { Button } from '@mui/material';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export default function EmitBadgeButton() {
  const emit = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v2/ws-test/emit-badge`, {
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
