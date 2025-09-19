// src/components/dev/WSStateButton.jsx
import { Button } from '@mui/material';
import { buildApiUrl } from '../../config/api';

export default function WSStateButton() {
  const check = async () => {
    try {
      const res = await fetch(buildApiUrl('/ws-test/state'), {
        method: 'GET',
        credentials: 'include', // indispensable pour envoyer le cookie access_token
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('WS state error:', res.status, text);
        alert(`WS state error: ${res.status}\n${text}`);
        return;
      }
      const json = await res.json();
      console.log('WS state ✅', json);
      alert(
        `WS state:\n` +
        `user_id = ${json.user_id}\n` +
        `connections_for_user = ${json.connections_for_user}\n` +
        `users_with_connections = ${json.users_with_connections}`
      );
    } catch (e) {
      console.error('WS state fetch failed:', e);
      alert(`WS state fetch failed: ${e?.message || e}`);
    }
  };

  return (
    <Button variant="outlined" size="small" onClick={check} sx={{ borderRadius: 2 }}>
      Check WS state
    </Button>
  );
}
