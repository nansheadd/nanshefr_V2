import React, { useEffect, useState, useContext } from 'react';
import clsx from 'clsx';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../theme/ColorModeContext';
import AuthDialog from '../features/authentication/components/AuthDialog';

import { useI18n } from '../i18n/I18nContext';
import styles from './NansheHomepage.module.css';
import Footer from '../components/Footer';


const capsuleIcons = ['🇯🇵', '🎨', '🧬', '💻', '📊', '🎸', '🧘', '📷'];
const capsuleKeys = ['japanese', 'design', 'biology', 'python', 'dataScience', 'guitar', 'yoga', 'photo'];

export default function NansheHomepage() {
  const [typed, setTyped] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { t, language, setLanguage } = useI18n();
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const isDark = theme.palette.mode === 'dark'; // ou mode === 'dark'

  const heroTitle = t('hero.title');

  useEffect(() => {
    setTyped('');
    let i = 0;
    const timer = setInterval(() => {
      if (i <= heroTitle.length) {
        setTyped(heroTitle.slice(0, i));
        i++;
      } else clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [heroTitle]);



  return (
    <div className={clsx(styles.container, isDark ? styles.dark : styles.light)}>
      <AuthDialog
        open={showAuth}
        defaultTab={authTab}
        onClose={() => {
          setShowAuth(false);
          setMobileMenuOpen(false);
        }}
      />

      

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brandRow}>
            <div className={styles.brandIdentity}>
              <img src="/logo192.png" alt="Nanshe" className={styles.navLogo} />
              <h1 className={clsx(styles.h1, styles.gradientText)}>Nanshe</h1>
            </div>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? t('nav.closeMenu', 'Fermer le menu') : t('nav.openMenu', 'Ouvrir le menu')}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          <div className={clsx(styles.navControls, mobileMenuOpen && styles.navControlsOpen)}>
            {/* Langue */}
            <select
              className={styles.langSelect}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fr">🇫🇷 FR</option>
              <option value="en">🇬🇧 EN</option>
              <option value="nl">🇳🇱 NL</option>
            </select>

            {/* Thème */}
            <button className={styles.iconBtn} onClick={toggleColorMode}>
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Actions */}
            <button
              className={styles.ghostBtn}
              onClick={() => {
                setAuthTab('login');
                setShowAuth(true);
                setMobileMenuOpen(false);
              }}
            >
              {t('nav.login')}
            </button>
            <button
              className={clsx(styles.button, styles.buttonPrimary)}
              onClick={() => {
                setAuthTab('signup');
                setShowAuth(true);
                setMobileMenuOpen(false);
              }}
            >
              {t('nav.signup')}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTextBlock}>
            <h2 className={clsx(styles.heroTitle, styles.gradientText)}>
              {typed}<span className={styles.cursor} />
            </h2>
            <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
            <div className={styles.ctaRow}>
              <button
                className={clsx(styles.button, styles.buttonPrimary)}
                onClick={() => {
                  setAuthTab('signup');
                  setShowAuth(true);
                  setMobileMenuOpen(false);
                }}
              >
                {t('hero.cta1')} →
              </button>
              <button className={styles.buttonOutline}>
                {t('hero.cta2')}
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.blob} />
            <img src="/logo192.png" alt="Nanshe AI" className={styles.heroLogo} />
            <div className={clsx(styles.floatingCard, styles.floatingTopRight)}>🏆 +500 XP</div>
            <div className={clsx(styles.floatingCard, styles.floatingBottomLeft)}>💊 Capsule</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h3 className={styles.sectionTitle}>
            {t('howItWorks.title')} <span className={styles.gradientText}>{t('howItWorks.titleGradient')} ?</span>
          </h3>
          <div className={styles.gridCards}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={clsx(styles.card, styles.hoverCard)}>
                <div className={styles.badge}>{i + 1}</div>
                <div className={styles.emojiBig}>{['💊', '🗺️', '⚛️'][i]}</div>
                <h4 className={clsx(styles.cardTitle, styles.gradientText)}>{t(`howItWorks.steps.${i}.title`)}</h4>
                <p className={styles.cardSubtitle}>{t(`howItWorks.steps.${i}.desc`)}</p>
                <p className={styles.cardText}>{t(`howItWorks.steps.${i}.details`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={clsx(styles.section, styles.sectionSoft)}>
        <div className={styles.sectionInner}>
          <h3 className={styles.sectionTitle}>
            {t('benefits.title')} <span className={styles.gradientText}>{t('benefits.titleGradient')} ?</span>
          </h3>
          <div className={styles.listCol}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.benefitRow}>
                <div className={styles.iconBox}>{['🎯', '🚀', '🏆'][i]}</div>
                <div>
                  <h4 className={styles.benefitTitle}>{t(`benefits.items.${i}.title`)}</h4>
                  <p className={styles.benefitText}>{t(`benefits.items.${i}.text`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPSULES */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h3 className={styles.sectionTitle}>
            {t('capsules.title')} <span className={styles.gradientText}>{t('capsules.titleGradient')}</span>
          </h3>
          <p className={styles.sectionSubtitle}>{t('capsules.subtitle')}</p>
          <div className={styles.gridCapsules}>
            {capsuleKeys.map((key, i) => (
              <div key={key} className={clsx(styles.card, styles.hoverCard, styles.capsuleCard)}>
                <div className={styles.capsuleEmoji}>{capsuleIcons[i]}</div>
                <div className={styles.capsuleTitle}>{t(`capsules.items.${key}`)}</div>
                <div className={styles.capsuleMeta}>12 {t('common.levels')} • 150+ {t('common.atoms')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <img src="/logo192.png" alt="Nanshe" className={styles.ctaLogo} />
          <h3 className={styles.ctaTitle}>
            {t('cta.ready')} <span className={styles.gradientText}>{t('cta.readyGradient')}</span> ?
          </h3>
          <p className={styles.ctaSubtitle}>{t('cta.subtitle')}</p>
          <button
            className={clsx(styles.button, styles.buttonPrimary, styles.buttonBig)}
            onClick={() => {
              setAuthTab('signup');
              setShowAuth(true);
              setMobileMenuOpen(false);
            }}
          >
            {t('cta.button')}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
