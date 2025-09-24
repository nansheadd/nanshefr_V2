// src/features/authentication/api/emailClient.js
import { buildApiUrl } from '../../config/api';

function getAppLang() {
  return localStorage.getItem('language') || 'fr';
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // indispensable pour que le cookie access_token suive les requêtes protégées
    credentials: 'include'
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
  return postJSON(buildApiUrl('/auth/send-confirmation'), { email, lang: getAppLang() });
}
export function verifyEmail(token) {
  return postJSON(buildApiUrl('/auth/verify-email'), { token });
}
export function forgotPassword(email) {
  return postJSON(buildApiUrl('/auth/forgot-password'), { email, lang: getAppLang() });
}
export function resetPassword(token, new_password) {
  return postJSON(buildApiUrl('/auth/reset-password'), { token, new_password });
}
