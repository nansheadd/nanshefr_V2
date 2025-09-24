const toFiniteNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const getValueAtPath = (source, path) => {
  if (!source || !path) return undefined;
  const segments = Array.isArray(path) ? path : [path];
  let current = source;
  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[segment];
  }
  return current;
};

const pickNumberFromPaths = (source, paths, { allowDirect = false } = {}) => {
  if (allowDirect) {
    const direct = toFiniteNumber(source);
    if (direct !== null) {
      return direct;
    }
  }

  for (const path of paths) {
    const value = getValueAtPath(source, path);
    const number = toFiniteNumber(value);
    if (number !== null) {
      return number;
    }
  }

  return null;
};

const clampToNonNegativeInteger = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const rounded = Math.round(value);
  if (!Number.isFinite(rounded)) {
    return 0;
  }
  return Math.max(0, rounded);
};

const TOTAL_STUDY_TIME_PATHS = [
  ['total_study_time_seconds'],
  ['total_study_time'],
  ['total_study_time', 'seconds'],
  ['total_study_time', 'total_seconds'],
  ['study_time_seconds'],
  ['study_time'],
  ['study_time', 'seconds'],
  ['study_time', 'total_seconds'],
  ['study_time', 'total', 'seconds'],
  ['summary', 'total_study_time_seconds'],
  ['summary', 'study_time_seconds'],
  ['summary', 'study_time', 'seconds'],
  ['summary', 'study_time', 'total_seconds'],
  ['metrics', 'study_time_seconds'],
  ['metrics', 'study_time', 'seconds'],
  ['metrics', 'study_time', 'total_seconds'],
  ['aggregates', 'study_time_seconds'],
  ['aggregates', 'study_time', 'seconds'],
  ['totals', 'study_time_seconds'],
  ['totals', 'study_time', 'seconds'],
];

const CURRENT_STREAK_PATHS = [
  ['current_streak_days'],
  ['current_streak'],
  ['current_streak', 'days'],
  ['current_streak', 'length_days'],
  ['current_streak', 'length', 'days'],
  ['current_streak', 'value'],
  ['streak', 'current'],
  ['streak', 'current', 'days'],
  ['streak', 'current', 'length_days'],
  ['streak', 'current', 'length', 'days'],
  ['streak', 'current_days'],
  ['streak', 'current_length_days'],
  ['streaks', 'current'],
  ['streaks', 'current', 'days'],
  ['streaks', 'current', 'length_days'],
  ['summary', 'current_streak_days'],
  ['summary', 'streak', 'current', 'days'],
  ['metrics', 'streak', 'current', 'days'],
];

const TOTAL_SESSIONS_PATHS = [
  ['total_sessions'],
  ['study_sessions', 'total'],
  ['sessions', 'total'],
  ['sessions', 'count'],
  ['study_sessions_count'],
  ['summary', 'total_sessions'],
  ['summary', 'sessions', 'total'],
  ['metrics', 'sessions', 'total'],
  ['totals', 'sessions'],
];

const BREAKDOWN_CONTAINER_PATHS = [
  ['breakdown'],
  ['study_breakdown'],
  ['study', 'breakdown'],
  ['metrics', 'breakdown'],
  ['summary', 'breakdown'],
  ['aggregates', 'breakdown'],
];

const buildBreakdownKeys = (dimension) => {
  const plural = dimension.endsWith('s') ? dimension : `${dimension}s`;
  const capitalized = `${dimension.charAt(0).toUpperCase()}${dimension.slice(1)}`;
  return [
    `by_${dimension}`,
    dimension,
    plural,
    `by_${plural}`,
    `by${capitalized}`,
    `per_${dimension}`,
    `per_${plural}`,
  ];
};

const DURATION_PATHS = [
  ['seconds'],
  ['total_seconds'],
  ['duration_seconds'],
  ['duration', 'seconds'],
  ['duration', 'total_seconds'],
  ['time', 'seconds'],
  ['time', 'total_seconds'],
  ['time_spent', 'seconds'],
  ['time_spent', 'total_seconds'],
  ['value', 'seconds'],
  ['value', 'total_seconds'],
];

export const getTotalStudyTimeSeconds = (stats) => {
  const value = pickNumberFromPaths(stats, TOTAL_STUDY_TIME_PATHS);
  return clampToNonNegativeInteger(value);
};

export const getCurrentStreakDays = (stats) => {
  const value = pickNumberFromPaths(stats, CURRENT_STREAK_PATHS);
  return clampToNonNegativeInteger(value);
};

export const getTotalSessions = (stats) => {
  const value = pickNumberFromPaths(stats, TOTAL_SESSIONS_PATHS);
  return clampToNonNegativeInteger(value);
};

const getBreakdownContainer = (stats) => {
  for (const path of BREAKDOWN_CONTAINER_PATHS) {
    const candidate = getValueAtPath(stats, path);
    if (candidate && typeof candidate === 'object') {
      return candidate;
    }
  }
  return null;
};

export const getBreakdownEntries = (stats, dimension) => {
  const container = getBreakdownContainer(stats);
  if (!container) return [];

  const keys = buildBreakdownKeys(dimension);
  for (const key of keys) {
    const value = container[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

export const getEntryDurationSeconds = (entry) => {
  const value = pickNumberFromPaths(entry, DURATION_PATHS, { allowDirect: true });
  return clampToNonNegativeInteger(value);
};
