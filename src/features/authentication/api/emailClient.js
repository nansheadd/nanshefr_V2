// src/features/authentication/api/emailClient.js
const BASE = 'http://localhost:8000'; // relatif -> /api/v2 via le proxy dev. Sinon: import.meta.env.VITE_API_BASE_URL

function getAppLang() {
  return localStorage.getItem('language') || 'fr';
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let detail = 'Unexpected error';
    try {
      const j = await res.json();
      detail = j.detail || JSON.stringify(j);
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export function sendConfirmation(email) {
  return postJSON(`${BASE}/api/v2/auth/send-confirmation`, { email, lang: getAppLang() });
}
export function verifyEmail(token) {
  return postJSON(`${BASE}/api/v2/auth/verify-email`, { token });
}
export function forgotPassword(email) {
  return postJSON(`${BASE}/api/v2/auth/forgot-password`, { email, lang: getAppLang() });
}
export function resetPassword(token, new_password) {
  return postJSON(`${BASE}/api/v2/auth/reset-password`, { token, new_password });
}
