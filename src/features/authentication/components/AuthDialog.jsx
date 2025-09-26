// src/features/authentication/components/AuthDialog.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { useI18n } from '../../../i18n/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import {
  PASSWORD_RULES,
  getPasswordChecks,
  isPasswordCompliant,
} from '../../../utils/passwordValidation';
import styles from './AuthDialog.module.css'; // nouveau module CSS (voir plus bas)

export default function AuthDialog({ open, defaultTab = 'login', onClose }) {
  const { t } = useI18n();
  const { login, registerAndLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const [loginForm, setLoginForm] = React.useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = React.useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);
  const [showSignupPasswordConfirm, setShowSignupPasswordConfirm] = React.useState(false);

  const signupPasswordChecks = React.useMemo(
    () => getPasswordChecks(signupForm.password),
    [signupForm.password]
  );
  const signupPasswordValid = React.useMemo(
    () => isPasswordCompliant(signupForm.password),
    [signupForm.password]
  );

  React.useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      setError('');
    }
  }, [open, defaultTab]);

  if (!open) return null;

  const onLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username: loginForm.username, password: loginForm.password, rememberMe });
      onClose?.();
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || t('errors.badCredentials') || "Identifiants incorrects.");
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!signupPasswordValid) {
      setError(t('errors.passwordWeak') || 'Le mot de passe ne respecte pas les règles demandées.');
      return;
    }

    if (signupForm.password !== signupForm.passwordConfirm) {
      setError(t('errors.passwordMismatch') || 'Les mots de passe ne correspondent pas.');
      return;
    }

    const payload = {
      username: signupForm.username.trim(),
      email: signupForm.email.trim(),
      password: signupForm.password,
      passwordConfirm: signupForm.passwordConfirm,
    };

    try {
      await registerAndLogin(payload); // ton hook existant
      // ton backend envoie déjà l’e-mail de confirmation
      onClose?.();
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || t('errors.signupFailed') || 'Inscription impossible.');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>

        <div className={styles.brandRow}>
          <img src="/logo192.png" alt="Nanshe" className={styles.brandLogo} />
          <h2 className={clsx(styles.h2, styles.gradientText)}>Nanshe</h2>
        </div>

        <div className={styles.tabBar}>
          <button
            className={clsx(styles.tabBtn, activeTab === 'login' && styles.tabBtnActive)}
            onClick={() => setActiveTab('login')}
          >
            {t('auth.loginTitle')}
          </button>
          <button
            className={clsx(styles.tabBtn, activeTab === 'signup' && styles.tabBtnActive)}
            onClick={() => setActiveTab('signup')}
          >
            {t('auth.signupTitle')}
          </button>
        </div>

        {error && <div className={styles.alertError}>{error}</div>}

        {activeTab === 'login' ? (
          <form className={styles.formCol} onSubmit={onLogin}>
            <input
              type="text"
              className={styles.input}
              placeholder={t('auth.username')}
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              autoComplete="username"
              required
            />
            <div className={styles.inputWrapper}>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder={t('auth.password')}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.inputToggle}
                onClick={() => setShowLoginPassword((prev) => !prev)}
                aria-label={showLoginPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showLoginPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <label className={styles.rememberRow}>
              <input
                type="checkbox"
                className={styles.rememberCheckbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Rester connecté</span>
            </label>
            <button className={clsx(styles.button, styles.buttonPrimary)} disabled={isLoading}>
              {t('auth.loginButton')}
            </button>

            <div className={styles.linkRow}>
              <Link to="/forgot-password" className={styles.linkInline} onClick={onClose}>
                {t('auth.forgot') || 'Mot de passe oublié ?'}
              </Link>
            </div>

            <div className={styles.centerMuted}>{t('common.continueWith')}</div>

            <div className={styles.providerRow}>
              {['Google', 'GitHub', 'Discord'].map((p) => (
                <button key={p} className={clsx(styles.providerBtn, styles.providerDisabled)} disabled>
                  {p} <span className={styles.badgeSoon}>Bientôt</span>
                </button>
              ))}
            </div>
          </form>
        ) : (
          <form className={styles.formCol} onSubmit={onSignup}>
            <input
              type="text"
              className={styles.input}
              placeholder={t('auth.username')}
              value={signupForm.username}
              onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
              autoComplete="username"
              required
            />
            <input
              type="email"
              className={styles.input}
              placeholder={t('auth.email')}
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
              autoComplete="email"
              required
            />
            <div className={styles.inputWrapper}>
              <input
                type={showSignupPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder={t('auth.password')}
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.inputToggle}
                onClick={() => setShowSignupPassword((prev) => !prev)}
                aria-label={showSignupPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showSignupPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <input
                type={showSignupPasswordConfirm ? 'text' : 'password'}
                className={styles.input}
                placeholder={t('auth.passwordConfirm') || 'Confirmez le mot de passe'}
                value={signupForm.passwordConfirm}
                onChange={(e) => setSignupForm({ ...signupForm, passwordConfirm: e.target.value })}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.inputToggle}
                onClick={() => setShowSignupPasswordConfirm((prev) => !prev)}
                aria-label={showSignupPasswordConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showSignupPasswordConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            <div className={styles.passwordRules}>
              <p>Votre mot de passe doit contenir :</p>
              <ul>
                {PASSWORD_RULES.map((rule) => (
                  <li key={rule.key} data-valid={signupPasswordChecks[rule.key]}>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className={clsx(styles.button, styles.buttonPrimary)}
              disabled={
                isLoading ||
                !signupForm.username.trim() ||
                !signupForm.email.trim() ||
                !signupForm.password ||
                signupForm.password !== signupForm.passwordConfirm ||
                !signupPasswordValid
              }
            >
              {t('auth.signupButton')}
            </button>

            <div className={styles.centerMuted}>{t('common.continueWith')}</div>
            <div className={styles.providerRow}>
              {['Google', 'GitHub', 'Discord'].map((p) => (
                <button key={p} className={clsx(styles.providerBtn, styles.providerDisabled)} disabled>
                  {p} <span className={styles.badgeSoon}>Bientôt</span>
                </button>
              ))}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
