import React, { useMemo } from 'react';
import clsx from 'clsx';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import styles from './DashboardCapsuleBoard.module.css';
import { useI18n } from '../../../i18n/I18nContext';

const CATEGORY_STYLES = {
  language: { colors: ['#6366f1', '#a855f7'], icon: '🌐' },
  design: { colors: ['#ec4899', '#f97316'], icon: '🎨' },
  science: { colors: ['#10b981', '#14b8a6'], icon: '🧬' },
  programming: { colors: ['#f59e0b', '#ef4444'], icon: '💻' },
  data: { colors: ['#06b6d4', '#3b82f6'], icon: '📊' },
  creative: { colors: ['#f97316', '#fb7185'], icon: '🎭' },
  wellness: { colors: ['#818cf8', '#6366f1'], icon: '🧘' },
};

const FALLBACK_STYLE = { colors: ['#6366f1', '#a855f7'], icon: '💡', categoryKey: 'creative' };

const DOMAIN_CATEGORY_MAP = {
  language: 'language',
  languages: 'language',
  linguistics: 'language',
  japanese: 'language',
  french: 'language',
  english: 'language',
  design: 'design',
  ui: 'design',
  ux: 'design',
  ui_ux: 'design',
  product_design: 'design',
  graphic_design: 'design',
  biology: 'science',
  biologie: 'science',
  physics: 'science',
  chimie: 'science',
  chemistry: 'science',
  science: 'science',
  sciences: 'science',
  mathematics: 'science',
  math: 'science',
  maths: 'science',
  natural_sciences: 'science',
  social_sciences: 'science',
  economics: 'data',
  finance: 'data',
  data_science: 'data',
  data: 'data',
  analytics: 'data',
  ai: 'data',
  intelligence_artificielle: 'data',
  programming: 'programming',
  programmation: 'programming',
  computer_science: 'programming',
  development: 'programming',
  developpement: 'programming',
  coding: 'programming',
  creative: 'creative',
  arts: 'creative',
  art: 'creative',
  music: 'creative',
  musique: 'creative',
  gaming: 'creative',
  game_design: 'creative',
  storytelling: 'creative',
  photo: 'creative',
  photographie: 'creative',
  guitar: 'creative',
  musique_classique: 'creative',
  personal_development: 'wellness',
  wellbeing: 'wellness',
  wellness: 'wellness',
  meditation: 'wellness',
  mindset: 'wellness',
  coaching: 'wellness',
  yoga: 'wellness',
};

const CTA_ICONS = {
  start: '▶️',
  resume: '▶️',
  continue: '▶️',
  review: '🔄',
  locked: '🔒',
};

const slugify = (value) =>
  typeof value === 'string'
    ? value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[^\p{Letter}\p{Number}]+/gu, '_')
        .replace(/^_+|_+$/g, '')
    : undefined;

const safeNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

const sumDuration = (collection, accessor) => {
  if (!Array.isArray(collection)) return null;
  return collection.reduce((total, item) => {
    const minutes = safeNumber(accessor(item));
    return minutes != null ? total + minutes : total;
  }, 0);
};

const DashboardCapsuleBoard = ({ capsules, isLoading }) => {
  const { t, language } = useI18n();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  const baseCardVars = useMemo(
    () => ({
      '--card-border': isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(99, 102, 241, 0.12)',
      '--card-bg': isDark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.96)',
    }),
    [isDark],
  );

  const handleOpenCoach = (capsule) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('nanshe:toolbox-open', {
        detail: { tool: 'coach', expand: true, capsuleId: capsule?.id },
      }),
    );
  };

  if (isLoading) {
    return (
      <div className={styles.board}>
        {[0, 1, 2].map((index) => (
          <div
            key={`capsule-skeleton-${index}`}
            className={clsx(styles.card, styles.skeleton)}
            style={baseCardVars}
            aria-hidden
          >
            <div className={styles.inner} />
          </div>
        ))}
      </div>
    );
  }

  if (!capsules?.length) {
    return null;
  }

  return (
    <div className={styles.board}>
      {capsules.map((capsule, index) => {
        const rawCapsule = capsule?.raw ?? {};
        const domainValue = capsule?.domain ?? rawCapsule.domain;
        const areaValue = capsule?.area ?? rawCapsule.area;
        const skillValue =
          capsule?.main_skill ??
          rawCapsule.main_skill ??
          rawCapsule.skill ??
          rawCapsule.focus;

        const domainSlug = slugify(domainValue);
        const areaSlug = slugify(areaValue);
        const skillSlug = slugify(skillValue);

        const categoryKey =
          DOMAIN_CATEGORY_MAP[domainSlug] || DOMAIN_CATEGORY_MAP[areaSlug] || DOMAIN_CATEGORY_MAP[skillSlug] || FALLBACK_STYLE.categoryKey;

        const categoryStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES[FALLBACK_STYLE.categoryKey] || FALLBACK_STYLE;
        const [color1, color2] = categoryStyle.colors;
        const capsuleIcon = categoryStyle.icon || FALLBACK_STYLE.icon;
        const displayedIcon = capsule?.icon ?? rawCapsule.icon ?? rawCapsule.emoji ?? capsuleIcon;

        const cardStyle = {
          ...baseCardVars,
          '--color1': color1,
          '--color2': color2,
        };

        const xpTarget =
          safeNumber(capsule?.xp_target) ??
          safeNumber(capsule?.xpTarget) ??
          safeNumber(capsule?.xp_goal) ??
          safeNumber(rawCapsule.xp_target) ??
          safeNumber(rawCapsule.xpTarget) ??
          safeNumber(rawCapsule.xp_goal) ??
          safeNumber(rawCapsule.goal_xp) ??
          6000;
        const xpCurrent =
          safeNumber(capsule?.xp_current) ??
          safeNumber(capsule?.user_xp) ??
          safeNumber(rawCapsule.xp_current) ??
          safeNumber(rawCapsule.user_xp) ??
          safeNumber(rawCapsule.progress_xp) ??
          safeNumber(rawCapsule.xp) ??
          0;

        const progressFromData =
          safeNumber(capsule?.progress_percentage) ??
          safeNumber(capsule?.progress) ??
          safeNumber(rawCapsule.progress_percentage) ??
          safeNumber(rawCapsule.progress_percent) ??
          safeNumber(rawCapsule.completion_rate) ??
          safeNumber(rawCapsule.progress);
        const computedProgress = xpTarget > 0 ? Math.round((xpCurrent / xpTarget) * 100) : 0;
        const progress = Math.min(100, progressFromData ?? computedProgress ?? 0);

        const progressStatus =
          capsule?.progress_status ??
          rawCapsule.progress_status ??
          rawCapsule.learning_status ??
          rawCapsule.study_status ??
          rawCapsule.status;

        const isLocked = Boolean(
          capsule?.is_locked ??
            rawCapsule.is_locked ??
            rawCapsule.locked ??
            (typeof rawCapsule.access === 'string' ? rawCapsule.access === 'locked' : rawCapsule.access) ??
            (typeof rawCapsule.permissions === 'string'
              ? rawCapsule.permissions === 'locked'
              : rawCapsule.permissions),
        );
        const isCompleted =
          !isLocked &&
          (progressStatus === 'completed' || rawCapsule.status === 'completed' || progress >= 100);

        let primaryCta = 'resume';
        if (isLocked) {
          primaryCta = 'locked';
        } else if (isCompleted) {
          primaryCta = 'review';
        } else if (!xpCurrent) {
          primaryCta = 'start';
        }
        const secondaryCta = !isLocked ? 'details' : null;

        const lessonsArray = Array.isArray(capsule?.lessons)
          ? capsule.lessons
          : Array.isArray(rawCapsule.lessons)
              ? rawCapsule.lessons
              : null;
        const modulesArray = Array.isArray(capsule?.modules)
          ? capsule.modules
          : Array.isArray(rawCapsule.modules)
              ? rawCapsule.modules
              : null;

        const lessonsCount =
          safeNumber(capsule?.lesson_count) ??
          safeNumber(capsule?.lessons_count) ??
          safeNumber(capsule?.total_lessons) ??
          safeNumber(rawCapsule.lesson_count) ??
          safeNumber(rawCapsule.lessons_count) ??
          safeNumber(rawCapsule.total_lessons) ??
          safeNumber(rawCapsule.lesson_total) ??
          safeNumber(capsule?.stats?.lessons_count) ??
          (Array.isArray(lessonsArray) ? lessonsArray.length : null) ??
          (Array.isArray(modulesArray)
            ? modulesArray.reduce(
                (sum, module) =>
                  sum + (Array.isArray(module?.lessons) ? module.lessons.length : 0),
                0,
              )
            : null);

        const durationMinutes =
          safeNumber(capsule?.total_duration_minutes) ??
          safeNumber(capsule?.estimated_duration_minutes) ??
          safeNumber(capsule?.duration_minutes) ??
          safeNumber(capsule?.duration) ??
          safeNumber(rawCapsule.total_duration_minutes) ??
          safeNumber(rawCapsule.estimated_duration_minutes) ??
          safeNumber(rawCapsule.duration_minutes) ??
          safeNumber(rawCapsule.duration) ??
          sumDuration(
            lessonsArray,
            (lesson) =>
              lesson?.estimated_duration_minutes ??
              lesson?.duration_minutes ??
              lesson?.duration,
          );
        const durationHours = durationMinutes != null ? durationMinutes / 60 : null;

        const chatCount =
          safeNumber(capsule?.unread_messages_count) ??
          safeNumber(capsule?.chat_unread_count) ??
          safeNumber(capsule?.assistant_unread_count) ??
          safeNumber(capsule?.coach_unread_count) ??
          safeNumber(rawCapsule.unread_messages_count) ??
          safeNumber(rawCapsule.chat_unread_count) ??
          safeNumber(rawCapsule.assistant_unread_count) ??
          safeNumber(rawCapsule.coach_unread_count) ??
          null;

        const chatEnabled =
          capsule?.coach_enabled ??
          capsule?.assistant_enabled ??
          rawCapsule.coach_enabled ??
          rawCapsule.assistant_enabled ??
          true;
        const chatIcon = capsule?.chatIcon || rawCapsule.chatIcon || (chatEnabled ? '🤖' : '💬');

        const xpLabel = t('capsules.card.xpValue', {
          current: integerFormatter.format(xpCurrent),
          target: integerFormatter.format(xpTarget),
        });

        const lessonsLabel =
          lessonsCount != null ? t('capsules.card.lessons', { count: integerFormatter.format(lessonsCount) }) : null;
        const durationLabel =
          durationHours != null && durationHours > 0
            ? t('capsules.card.durationHours', { count: decimalFormatter.format(durationHours) })
            : null;

        const domainAreaLabel = [domainValue, areaValue]
          .filter(Boolean)
          .map((value) => value.replace(/_/g, ' '))
          .join(' • ');

        const categoryLabel = categoryKey
          ? t(`capsules.card.categories.${categoryKey}`)
          : domainAreaLabel || skillValue || domainValue || 'Capsule';

        const capsuleTitle =
          capsule?.title ??
          rawCapsule.title ??
          rawCapsule.name ??
          skillValue ??
          t('dashboard.capsules.title');

        const primaryLabel = t(`capsules.card.cta.${primaryCta}`);
        const secondaryLabel = secondaryCta ? t(`capsules.card.cta.${secondaryCta}`) : null;

        const primaryIcon = CTA_ICONS[primaryCta] ?? CTA_ICONS.resume;

        const hasRouting = capsule?.id && domainValue && areaValue;
        const baseLink =
          hasRouting
            ? `/capsule/${encodeURIComponent(domainValue)}/${encodeURIComponent(areaValue)}/${capsule.id}`
            : '/capsules';
        const planLink = baseLink === '/capsules' ? baseLink : `${baseLink}/plan`;

        const metaItems = [];
        if (lessonsLabel) {
          metaItems.push({ icon: '📖', label: lessonsLabel });
        }
        if (durationLabel) {
          metaItems.push({ icon: '⏱️', label: durationLabel });
        }
        if (domainAreaLabel) {
          metaItems.push({ icon: '🌐', label: domainAreaLabel });
        }

        return (
          <div
            key={capsule?.id ?? capsule?.slug ?? capsule?.key ?? `capsule-${index}`}
            className={clsx(styles.card, {
              [styles.statusLocked]: isLocked,
              [styles.statusCompleted]: isCompleted,
            })}
            style={cardStyle}
          >
            <div className={styles.inner}>
              <div className={styles.image}>
                <div className={styles.orb} />
                <span className={styles.icon} aria-hidden>
                  {displayedIcon}
                </span>
              </div>

              <div className={styles.info}>
                <span className={styles.categoryTag}>{categoryLabel}</span>
                <h4 className={styles.name}>{capsuleTitle}</h4>
                {!!metaItems.length && (
                  <div className={styles.metaRow}>
                    {metaItems.map((item, metaIndex) => (
                      <span className={styles.metaItem} key={`${capsule?.id}-meta-${metaIndex}`}>
                        <span aria-hidden>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className={styles.chatButton}
                onClick={() => handleOpenCoach(capsule)}
                disabled={isLocked || !chatEnabled}
                aria-label={t('dashboard.toolbox.tiles.coach.title')}
              >
                <div className={styles.chatBubble}>
                  <span className={styles.chatIcon} aria-hidden>
                    {chatIcon}
                  </span>
                  {chatCount != null && chatCount > 0 && (
                    <span className={styles.chatBadge}>{integerFormatter.format(chatCount)}</span>
                  )}
                </div>
              </button>

              <div className={styles.actions}>
                <div className={styles.progressHeader}>
                  <span>{t('capsules.card.progressLabel')}</span>
                  <span className={styles.progressValue}>{xpLabel}</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <div className={styles.buttons}>
                  <RouterLink
                    to={planLink}
                    className={clsx(styles.button, styles.buttonPrimary)}
                    aria-disabled={isLocked}
                    tabIndex={isLocked ? -1 : undefined}
                    onClick={
                      isLocked
                        ? (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }
                        : undefined
                    }
                  >
                    <span className={styles.buttonEmoji} aria-hidden>
                      {primaryIcon}
                    </span>
                    {primaryLabel}
                  </RouterLink>
                  {secondaryLabel && (
                    <RouterLink to={baseLink} className={clsx(styles.button, styles.buttonSecondary)}>
                      {secondaryLabel}
                    </RouterLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCapsuleBoard;
