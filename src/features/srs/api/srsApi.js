import requestWithFallback from '../../../utils/apiFallback';

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'object') return [];
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.cards)) return value.cards;
  if (Array.isArray(value.queue)) return value.queue;
  if (Array.isArray(value.results)) return value.results;
  if (Array.isArray(value.data)) return value.data;
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

const toIsoString = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? null : value.toISOString();
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    const multiplier = value > 1e12 ? 1 : 1000;
    return new Date(value * multiplier).toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const date = new Date(trimmed);
    const timestamp = date.getTime();
    return Number.isNaN(timestamp) ? null : date.toISOString();
  }
  return null;
};

const normalizeSrsItem = (item = {}) => {
  const metadata = item.metadata && typeof item.metadata === 'object' ? item.metadata : {};

  const prompt =
    item.prompt ??
    item.question ??
    item.front ??
    item.text ??
    metadata.prompt ??
    '';

  const answer =
    item.answer ??
    item.response ??
    item.back ??
    metadata.answer ??
    '';

  return {
    id: item.id ?? item.item_id ?? item.queue_id ?? item.uuid ?? metadata.id ?? null,
    capsule_id: item.capsule_id ?? metadata.capsule_id ?? null,
    capsule_title: pickFirstString(item, ['capsule_title', 'capsuleName', 'capsule'], metadata.capsule_title ?? ''),
    molecule_id: item.molecule_id ?? metadata.molecule_id ?? null,
    molecule_title: pickFirstString(item, ['molecule_title', 'lesson_title'], metadata.molecule_title ?? ''),
    prompt,
    answer,
    hint: item.hint ?? metadata.hint ?? null,
    type: item.type ?? metadata.type ?? 'flashcard',
    difficulty: pickFirstString(item, ['difficulty', 'rating'], metadata.difficulty ?? ''),
    due_at: toIsoString(item.due_at ?? item.due ?? item.next_review_at ?? metadata.due_at),
    due_in_seconds: toNumber(
      item.due_in_seconds ??
        item.seconds_until_due ??
        item.time_until_due ??
        metadata.due_in_seconds,
      0,
    ),
    metadata,
    raw: item,
  };
};

const normalizeSrsSummary = (payload = {}) => {
  const nextReview =
    payload.next_review_at ??
    payload.next_due_at ??
    payload.soonest_due_at ??
    payload.next_review ??
    null;

  return {
    due_count: toNumber(payload.due_count ?? payload.due ?? payload.pending ?? payload.cards_due, 0),
    overdue_count: toNumber(payload.overdue_count ?? payload.overdue ?? payload.late_count, 0),
    new_count: toNumber(payload.new_count ?? payload.new ?? payload.to_learn, 0),
    total_count: toNumber(payload.total_count ?? payload.total ?? payload.card_count, 0),
    upcoming_count: toNumber(payload.upcoming_count ?? payload.due_later_count ?? payload.waiting, 0),
    next_review_at: toIsoString(nextReview),
    raw: payload,
  };
};

const normalizeSrsSession = (payload = {}) => {
  const items = toArray(payload.queue ?? payload.items ?? payload.remaining).map(normalizeSrsItem);
  const current = payload.current ?? payload.item ?? payload.next ?? (items.length > 0 ? items[0] : null);

  return {
    sessionId:
      payload.session_id ?? payload.sessionId ?? payload.id ?? payload.session ?? null,
    item: current ? normalizeSrsItem(current) : null,
    queue: items,
    remaining: toNumber(payload.remaining_count ?? payload.queue_size ?? items.length, items.length),
    raw: payload,
  };
};

const getSummaryResponse = async () => {
  const response = await requestWithFallback('get', [
    '/learning/srs/summary',
    '/srs/summary',
  ]);
  return response?.data ?? {};
};

export const fetchSrsSummary = async () => normalizeSrsSummary(await getSummaryResponse());

export const fetchSrsQueue = async (params = {}) => {
  const response = await requestWithFallback('get', [
    '/learning/srs/queue',
    '/srs/queue',
  ], { params });
  return normalizeSrsSession(response?.data ?? {});
};

export const startSrsSession = async (params = {}) => {
  const response = await requestWithFallback('post', [
    '/learning/srs/session',
    '/srs/session',
  ], { data: params });
  return normalizeSrsSession(response?.data ?? {});
};

export const submitSrsReview = async ({ sessionId, itemId, rating, difficulty, metadata }) => {
  if (!itemId && !metadata?.item_id) {
    throw new Error('itemId is required to submit a review');
  }

  const data = {
    session_id: sessionId ?? metadata?.session_id ?? metadata?.sessionId ?? null,
    item_id: itemId ?? metadata?.item_id ?? metadata?.card_id ?? null,
    rating,
    difficulty: difficulty ?? null,
    metadata: metadata ?? {},
  };

  const response = await requestWithFallback('post', [
    '/learning/srs/review',
    '/srs/review',
  ], { data });

  const body = response?.data ?? {};
  return {
    ...normalizeSrsSession(body),
    review: body.review ?? body.result ?? null,
  };
};

export default {
  fetchSrsSummary,
  fetchSrsQueue,
  startSrsSession,
  submitSrsReview,
};
