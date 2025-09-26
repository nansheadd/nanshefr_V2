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

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object') return [];
  if (Array.isArray(value.entries)) return value.entries;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.results)) return value.results;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.records)) return value.records;
  return [];
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

const normalizeJournalEntry = (entry = {}) => {
  const metadata = entry.metadata && typeof entry.metadata === 'object' ? entry.metadata : {};

  const content =
    entry.content ??
    entry.body ??
    entry.text ??
    entry.note ??
    metadata.content ??
    '';

  const summary =
    entry.summary ??
    entry.preview ??
    entry.excerpt ??
    metadata.summary ??
    content?.slice ? content.slice(0, 280) : '';

  const tags = normalizeTags(entry.tags ?? entry.labels ?? metadata.tags);

  return {
    id:
      entry.id ??
      entry.entry_id ??
      entry.uuid ??
      entry.external_id ??
      metadata.entry_id ??
      null,
    title: pickFirstString(entry, ['title', 'subject', 'heading'], 'Journal'),
    content,
    summary,
    mood: pickFirstString(entry, ['mood', 'emotion', 'feeling'], metadata.mood ?? ''),
    tags,
    capsule_id: entry.capsule_id ?? entry.capsuleId ?? metadata.capsule_id ?? null,
    capsule_title: pickFirstString(entry, ['capsule_title', 'capsuleName'], metadata.capsule_title ?? ''),
    molecule_id: entry.molecule_id ?? metadata.molecule_id ?? null,
    molecule_title: pickFirstString(entry, ['molecule_title', 'lesson_title'], metadata.molecule_title ?? ''),
    is_pinned: toBoolean(entry.is_pinned ?? metadata.is_pinned, false),
    created_at:
      toIsoString(entry.created_at ?? entry.createdAt ?? entry.inserted_at ?? entry.timestamp ?? metadata.created_at) ?? null,
    updated_at:
      toIsoString(entry.updated_at ?? entry.updatedAt ?? entry.modified_at ?? metadata.updated_at) ?? null,
    metadata,
    raw: entry,
  };
};

const normalizeJournalList = (payload) => {
  const entries = toArray(payload).map(normalizeJournalEntry);
  const container = payload && typeof payload === 'object' ? payload : {};
  const total = container.total ?? container.count ?? entries.length;
  return {
    items: entries,
    total: toNumber(total, entries.length),
    next: container.next ?? null,
    previous: container.previous ?? null,
    raw: payload,
  };
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
  if (Array.isArray(body.entries) || Array.isArray(body.items)) {
    const list = normalizeJournalList(body);
    return list.items[0] ?? null;
  }
  return normalizeJournalEntry(body);
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
  return normalizeJournalEntry(response?.data ?? {});
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
