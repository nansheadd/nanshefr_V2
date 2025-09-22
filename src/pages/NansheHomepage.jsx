import React, { useEffect, useState, useContext, useMemo } from 'react';
import clsx from 'clsx';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../theme/ColorModeContext';
import AuthDialog from '../features/authentication/components/AuthDialog';

import { useI18n } from '../i18n/I18nContext';
import styles from './NansheHomepage.module.css';
import Footer from '../components/Footer';


const capsuleCardsData = [
  {
    key: 'japanese',
    icon: '🇯🇵',
    categoryKey: 'language',
    lessons: 12,
    durationHours: 3,
    xpCurrent: 2400,
    xpTarget: 6000,
    chatIcon: '💬',
    chatCount: 3,
    primaryCta: 'continue',
    primaryIcon: '▶️',
    secondaryCta: 'details',
    colors: ['#6366f1', '#a855f7'],
  },
  {
    key: 'design',
    icon: '🎨',
    categoryKey: 'design',
    lessons: 8,
    durationHours: 2,
    xpCurrent: 6000,
    xpTarget: 6000,
    chatIcon: '💬',
    primaryCta: 'review',
    primaryIcon: '🔄',
    secondaryCta: 'details',
    colors: ['#ec4899', '#f97316'],
    status: 'completed',
  },
  {
    key: 'biology',
    icon: '🧬',
    categoryKey: 'science',
    lessons: 10,
    durationHours: 4,
    xpCurrent: 1800,
    xpTarget: 5000,
    chatIcon: '💬',
    chatCount: 2,
    primaryCta: 'resume',
    primaryIcon: '▶️',
    secondaryCta: 'details',
    colors: ['#10b981', '#14b8a6'],
  },
  {
    key: 'python',
    icon: '💻',
    categoryKey: 'programming',
    lessons: 15,
    durationHours: 5,
    xpCurrent: 4800,
    xpTarget: 8000,
    chatIcon: '🤖',
    chatCount: 1,
    primaryCta: 'resume',
    primaryIcon: '▶️',
    secondaryCta: 'details',
    colors: ['#f59e0b', '#ef4444'],
  },
  {
    key: 'dataScience',
    icon: '📊',
    categoryKey: 'data',
    lessons: 10,
    durationHours: 4,
    xpCurrent: 800,
    xpTarget: 5000,
    chatIcon: '📈',
    chatCount: 5,
    primaryCta: 'start',
    primaryIcon: '▶️',
    secondaryCta: 'details',
    colors: ['#06b6d4', '#3b82f6'],
  },
  {
    key: 'guitar',
    icon: '🎸',
    categoryKey: 'creative',
    lessons: 9,
    durationHours: 3,
    xpCurrent: 3600,
    xpTarget: 7000,
    chatIcon: '🎵',
    primaryCta: 'resume',
    primaryIcon: '▶️',
    secondaryCta: 'details',
    colors: ['#f97316', '#fb7185'],
  },
  {
    key: 'yoga',
    icon: '🧘',
    categoryKey: 'wellness',
    lessons: 12,
    durationHours: 6,
    xpCurrent: 0,
    xpTarget: 6000,
    chatIcon: '🔒',
    primaryCta: 'locked',
    primaryIcon: '🔒',
    colors: ['#818cf8', '#6366f1'],
    status: 'locked',
  },
  {
    key: 'photo',
    icon: '📷',
    categoryKey: 'creative',
    lessons: 7,
    durationHours: 2.5,
    xpCurrent: 1200,
    xpTarget: 4000,
    chatIcon: '💡',
    chatCount: 4,
    primaryCta: 'start',
    primaryIcon: '▶️',
    secondaryCta: 'details',
    colors: ['#a855f7', '#6366f1'],
  },
];

export default function NansheHomepage() {
  const [typed, setTyped] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  const { t, language, setLanguage } = useI18n();
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const isDark = theme.palette.mode === 'dark'; // ou mode === 'dark'

  const locale = useMemo(() => {
    switch (language) {
      case 'en':
        return 'en-US';
      case 'nl':
        return 'nl-NL';
      default:
        return 'fr-FR';
    }
  }, [language]);

  const integerFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const decimalFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }),
    [locale],
  );

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
      <AuthDialog open={showAuth} defaultTab="login" onClose={() => setShowAuth(false)} />

      

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brandRow}>
            <img src="/logo192.png" alt="Nanshe" className={styles.navLogo} />
            <h1 className={clsx(styles.h1, styles.gradientText)}>Nanshe</h1>
          </div>
          <div className={styles.navControls}>
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
            <button className={styles.ghostBtn} onClick={() => setShowAuth(true)}>
              {t('nav.login')}
            </button>
            <button className={clsx(styles.button, styles.buttonPrimary)} onClick={() => setShowAuth(true)}>
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
              <button className={clsx(styles.button, styles.buttonPrimary)} onClick={() => setShowAuth(true)}>
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
          <div className={styles.capsuleBoard}>
            {capsuleCardsData.map((capsule) => {
              const statusClass = capsule.status
                ? styles[`capsuleStatus${capsule.status.charAt(0).toUpperCase() + capsule.status.slice(1)}`]
                : undefined;
              const styleVars = capsule.colors
                ? {
                    '--capsuleColor1': capsule.colors[0],
                    '--capsuleColor2': capsule.colors[1],
                  }
                : undefined;
              const isLocked = capsule.status === 'locked';
              const progress = capsule.xpTarget > 0
                ? Math.min(100, Math.round((capsule.xpCurrent / capsule.xpTarget) * 100))
                : 0;
              const xpLabel = t('capsules.card.xpValue', {
                current: integerFormatter.format(capsule.xpCurrent),
                target: integerFormatter.format(capsule.xpTarget),
              });
              const lessonsLabel = t('capsules.card.lessons', {
                count: integerFormatter.format(capsule.lessons),
              });
              const durationLabel = t('capsules.card.durationHours', {
                count: decimalFormatter.format(capsule.durationHours),
              });
              const primaryLabel = t(`capsules.card.cta.${capsule.primaryCta}`);
              const secondaryLabel = capsule.secondaryCta
                ? t(`capsules.card.cta.${capsule.secondaryCta}`)
                : null;

              return (
                <div
                  key={capsule.key}
                  className={clsx(styles.capsuleCard, statusClass)}
                  style={styleVars}
                >
                  <div className={styles.capsuleInner}>
                    <div className={styles.capsuleImage}>
                      <div className={styles.capsuleOrb} />
                      <span className={styles.capsuleIcon}>{capsule.icon}</span>
                    </div>
                    <div className={styles.capsuleInfo}>
                      <span className={styles.capsuleCategory}>
                        {t(`capsules.card.categories.${capsule.categoryKey}`)}
                      </span>
                      <h4 className={styles.capsuleName}>{t(`capsules.items.${capsule.key}`)}</h4>
                      <div className={styles.capsuleMetaRow}>
                        <span className={styles.capsuleMetaItem}>📖 {lessonsLabel}</span>
                        <span className={styles.capsuleMetaItem}>⏱️ {durationLabel}</span>
                      </div>
                    </div>
                    <button type="button" className={styles.capsuleChat} disabled={isLocked}>
                      <div className={styles.chatBubble}>
                        <span className={styles.chatIcon}>{capsule.chatIcon}</span>
                        {capsule.chatCount != null && (
                          <span className={styles.chatBadge}>
                            {integerFormatter.format(capsule.chatCount)}
                          </span>
                        )}
                      </div>
                    </button>
                    <div className={styles.capsuleActions}>
                      <div className={styles.progressHeader}>
                        <span>{t('capsules.card.progressLabel')}</span>
                        <span className={styles.progressValue}>{xpLabel}</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                      </div>
                      <div className={styles.capsuleButtons}>
                        <button
                          type="button"
                          className={clsx(styles.capsuleButton, styles.capsuleButtonPrimary)}
                          disabled={isLocked}
                        >
                          <span className={styles.buttonEmoji}>{capsule.primaryIcon}</span>
                          {primaryLabel}
                        </button>
                        {secondaryLabel && (
                          <button
                            type="button"
                            className={clsx(styles.capsuleButton, styles.capsuleButtonSecondary)}
                            disabled={isLocked}
                          >
                            {secondaryLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <button className={clsx(styles.button, styles.buttonPrimary, styles.buttonBig)} onClick={() => setShowAuth(true)}>
            {t('cta.button')}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
