import requestWithFallback from '../../../utils/apiFallback';

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(lowered)) return true;
    if (['false', '0', 'no', 'n'].includes(lowered)) return false;
  }
  return fallback;
};

const KNOWN_ARRAY_KEYS = [
  'entries',
  'items',
  'results',
  'data',
  'records',
  'list',
  'notes',
  'rows',
];

const toArray = (value, depth = 0) => {
  if (!value || depth > 3) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object') return [];

  for (const key of KNOWN_ARRAY_KEYS) {
    const candidate = value[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const key of KNOWN_ARRAY_KEYS) {
    const candidate = value[key];
    if (candidate && typeof candidate === 'object') {
      const nested = toArray(candidate, depth + 1);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  if (value.data && typeof value.data === 'object') {
    const nested = toArray(value.data, depth + 1);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
};

const toObject = (value) => {
  if (!value || typeof value !== 'object') return {};
  return value;
};

const mergeObjects = (...sources) => Object.assign({}, ...sources.map(toObject));

const pickFirstPath = (source, paths, fallback = undefined) => {
  const value = paths
    .map((path) => {
      const segments = Array.isArray(path) ? path : String(path).split('.');
      let current = source;
      for (const segment of segments) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[segment];
      }
      return current;
    })
    .find((result) => result !== undefined && result !== null);

  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return value.value;
  }

  return fallback;
};

const pickFirstString = (source, keys, fallback = '') => {
  if (!source || typeof source !== 'object') return fallback;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
};

const normalizeTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') return entry.trim();
        if (entry && typeof entry === 'object') {
          return pickFirstString(entry, ['label', 'name', 'title', 'tag']);
        }
        return null;
      })
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const toIsoString = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? null : value.toISOString();
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return new Date(value * (value > 1e12 ? 1 : 1000)).toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = new Date(trimmed);
    const timestamp = parsed.getTime();
    return Number.isNaN(timestamp) ? null : parsed.toISOString();
  }
  return null;
};

const extractEntityTitle = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'string') return entity;
  if (Array.isArray(entity)) {
    const candidate = entity.find((item) => typeof item === 'string' || (item && typeof item === 'object'));
    return extractEntityTitle(candidate);
  }
  if (typeof entity !== 'object') return '';
  if (entity.title) return String(entity.title);
  if (entity.name) return String(entity.name);
  if (entity.label) return String(entity.label);
  if (entity.data) return extractEntityTitle(entity.data);
  if (entity.attributes) return extractEntityTitle(entity.attributes);
  return '';
};

const normalizeJournalEntry = (entry = {}) => {
  const attributes = toObject(entry.attributes);
  const data = toObject(entry.data);
  const payload = mergeObjects(attributes, data, entry);
  const metadata = mergeObjects(entry.metadata, entry.meta, attributes.metadata, data.metadata, payload.metadata);

  const content =
    pickFirstPath(payload, [['content'], ['body'], ['text'], ['note']]) ??
    pickFirstPath(metadata, [['content']]) ??
    '';

  const summary =
    pickFirstPath(payload, [['summary'], ['preview'], ['excerpt']]) ??
    pickFirstPath(metadata, [['summary']]) ??
    (content?.slice ? content.slice(0, 280) : '');

  const tags = normalizeTags(payload.tags ?? payload.labels ?? metadata.tags);

  const capsuleSource =
    payload.capsule ??
    payload.capsule_info ??
    payload.capsuleData ??
    payload.relationships?.capsule ??
    metadata.capsule;
  const moleculeSource =
    payload.molecule ??
    payload.lesson ??
    payload.relationships?.molecule ??
    payload.relationships?.lesson ??
    metadata.molecule;

  return {
    id:
      pickFirstPath(payload, [['id'], ['entry_id'], ['uuid'], ['external_id']]) ??
      pickFirstPath(metadata, [['entry_id']]) ??
      null,
    title: pickFirstString(payload, ['title', 'subject', 'heading'], 'Journal'),
    content,
    summary,
    mood: pickFirstString(payload, ['mood', 'emotion', 'feeling'], metadata.mood ?? ''),
    tags,
    capsule_id:
      pickFirstPath(payload, [['capsule_id'], ['capsuleId']]) ??
      pickFirstPath(metadata, [['capsule_id']]) ??
      null,
    capsule_title:
      pickFirstString(payload, ['capsule_title', 'capsuleName'], metadata.capsule_title ?? '') ||
      extractEntityTitle(capsuleSource),
    molecule_id: pickFirstPath(payload, [['molecule_id']]) ?? pickFirstPath(metadata, [['molecule_id']]) ?? null,
    molecule_title:
      pickFirstString(payload, ['molecule_title', 'lesson_title'], metadata.molecule_title ?? '') ||
      extractEntityTitle(moleculeSource),
    is_pinned: toBoolean(pickFirstPath(payload, [['is_pinned']]) ?? metadata.is_pinned, false),
    created_at:
      toIsoString(
        pickFirstPath(payload, [['created_at'], ['createdAt'], ['inserted_at'], ['timestamp']]) ??
          pickFirstPath(metadata, [['created_at']]),
      ) ?? null,
    updated_at:
      toIsoString(
        pickFirstPath(payload, [['updated_at'], ['updatedAt'], ['modified_at']]) ??
          pickFirstPath(metadata, [['updated_at']]),
      ) ?? null,
    metadata,
    raw: entry,
  };
};

const normalizeJournalList = (payload) => {
  const entries = toArray(payload).map(normalizeJournalEntry);
  const container = payload && typeof payload === 'object' ? payload : {};
  const total =
    container.total ??
    container.count ??
    container.size ??
    container.length ??
    pickFirstPath(container, [
      ['meta', 'total'],
      ['meta', 'count'],
      ['meta', 'pagination', 'total'],
      ['meta', 'pagination', 'count'],
      ['pagination', 'total'],
      ['pagination', 'count'],
      ['pagination', 'total_entries'],
      ['data', 'meta', 'total'],
      ['data', 'meta', 'count'],
      ['data', 'pagination', 'total'],
    ]) ??
    entries.length;
  return {
    items: entries,
    total: toNumber(total, entries.length),
    next:
      container.next ??
      pickFirstPath(container, [['links', 'next'], ['meta', 'next'], ['pagination', 'next'], ['data', 'links', 'next']]) ??
      null,
    previous:
      container.previous ??
      pickFirstPath(container, [['links', 'prev'], ['links', 'previous'], ['pagination', 'previous']]) ??
      null,
    raw: payload,
  };
};

const extractFirstEntry = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    return payload[0] ?? null;
  }
  if (typeof payload !== 'object') return null;
  if (payload.entry && typeof payload.entry === 'object') {
    return payload.entry;
  }
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    if (payload.data.entry) {
      return payload.data.entry;
    }
    if (payload.data.item) {
      return payload.data.item;
    }
    if (payload.data.attributes || payload.data.data) {
      return mergeObjects(payload.data);
    }
  }
  const fromArray = toArray(payload)[0];
  if (fromArray) return fromArray;
  return payload;
};

export const fetchJournalEntries = async (params = {}) => {
  const response = await requestWithFallback('get', [
    '/journal/entries',
    '/learning/journal/entries',
    '/journal',
    '/toolbox/journal',
  ], {
    params,
    validateStatus: (status) => [200, 204].includes(status),
  });

  if (!response || response.status === 204) {
    return { items: [], total: 0, next: null, previous: null, raw: null };
  }

  return normalizeJournalList(response.data ?? []);
};

export const createJournalEntry = async (payload) => {
  const { __internal, ...data } = payload || {};
  const response = await requestWithFallback('post', [
    '/journal/entries',
    '/learning/journal/entries',
    '/journal',
    '/toolbox/journal',
  ], { data });
  const body = response?.data ?? {};
  if (Array.isArray(body.entries) || Array.isArray(body.items) || Array.isArray(body.data)) {
    const list = normalizeJournalList(body);
    return list.items[0] ?? null;
  }
  const entry = extractFirstEntry(body);
  return normalizeJournalEntry(entry ?? body);
};

export const updateJournalEntry = async (entryId, payload) => {
  if (!entryId) throw new Error('entryId is required');
  const { __internal, ...data } = payload || {};
  const response = await requestWithFallback('patch', [
    `/journal/entries/${entryId}`,
    `/learning/journal/entries/${entryId}`,
    `/journal/${entryId}`,
    `/toolbox/journal/${entryId}`,
  ], { data });
  const body = response?.data ?? {};
  const entry = extractFirstEntry(body);
  return normalizeJournalEntry(entry ?? body);
};

export const deleteJournalEntry = async (entryId) => {
  if (!entryId) throw new Error('entryId is required');
  await requestWithFallback('delete', [
    `/journal/entries/${entryId}`,
    `/learning/journal/entries/${entryId}`,
    `/journal/${entryId}`,
    `/toolbox/journal/${entryId}`,
  ]);
  return { success: true };
};

export default {
  fetchJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
};
