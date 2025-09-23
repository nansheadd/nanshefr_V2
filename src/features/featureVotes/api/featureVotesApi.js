import apiClient from '../../../api/axiosConfig';

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.results)) return value.results;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.features)) return value.features;
  return [];
};

const startCase = (value = '') =>
  value
    .toString()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/(^|\s)([a-zàâäéèêëîïôöùûüç])/g, (_, sep, char) => `${sep}${char.toUpperCase()}`);

const statusLabelMap = {
  open: 'Ouvert',
  idea: 'Idée',
  backlog: 'Backlog',
  pending: 'À prioriser',
  planned: 'Planifié',
  in_progress: 'En cours',
  building: 'En construction',
  shipped: 'Livré',
  completed: 'Terminé',
  done: 'Terminé',
  rejected: 'Rejeté',
  archived: 'Archivé',
};

const statusColorMap = {
  open: 'default',
  idea: 'default',
  backlog: 'default',
  pending: 'warning',
  planned: 'info',
  in_progress: 'warning',
  building: 'warning',
  shipped: 'success',
  completed: 'success',
  done: 'success',
  rejected: 'error',
  archived: 'default',
};

const normalizeStatus = (value) => {
  if (!value) {
    return {
      value: 'pending',
      label: statusLabelMap.pending,
      color: statusColorMap.pending,
    };
  }
  const normalized = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  const label = statusLabelMap[normalized] || startCase(normalized.replace(/_/g, ' '));
  const color = statusColorMap[normalized] || 'default';
  return { value: normalized, label, color };
};

const normalizeFeature = (feature) => {
  if (!feature || typeof feature !== 'object') {
    return {
      id: null,
      title: 'Fonctionnalité',
      description: '',
      votes: 0,
      userHasVoted: false,
      status: 'pending',
      statusLabel: statusLabelMap.pending,
      statusColor: statusColorMap.pending,
      category: 'Général',
      categoryLabel: 'Général',
      tags: [],
      createdAt: null,
      raw: feature,
    };
  }

  const id =
    feature.id ??
    feature.feature_id ??
    feature.uuid ??
    feature.slug ??
    feature.external_id ??
    feature.reference ??
    null;

  const title = feature.title ?? feature.name ?? `Fonctionnalité ${id ?? ''}`.trim();

  const description =
    feature.description ??
    feature.details ??
    feature.body ??
    feature.summary ??
    '';

  const votesValue =
    feature.vote_count ??
    feature.votes ??
    feature.total_votes ??
    feature.score ??
    feature.upvotes ??
    0;

  const userHasVoted = Boolean(
    feature.user_has_voted ??
      feature.has_voted ??
      feature.user_vote ??
      feature.current_user_vote ??
      feature.my_vote ??
      false
  );

  const statusInfo = normalizeStatus(feature.status ?? feature.state ?? feature.progress_status);

  const rawCategory = feature.category ?? feature.area ?? feature.segment ?? feature.topic ?? 'Général';
  const category = rawCategory?.toString().trim() || 'Général';
  const categoryLabel = startCase(category);

  const tags = Array.isArray(feature.tags)
    ? feature.tags
    : typeof feature.tags === 'string'
      ? feature.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

  const createdAt = feature.created_at ?? feature.created ?? feature.inserted_at ?? null;

  return {
    id,
    title,
    description,
    votes: Number.isFinite(Number(votesValue)) ? Number(votesValue) : 0,
    userHasVoted,
    status: statusInfo.value,
    statusLabel: statusInfo.label,
    statusColor: statusInfo.color,
    category,
    categoryLabel,
    tags,
    createdAt,
    raw: feature,
  };
};

export const normalizeFeatureVotes = (payload) => {
  const list = toArray(payload).map((item) => normalizeFeature(item));
  return { items: list, raw: payload };
};

export const fetchFeatureVotes = async () => {
  const { data } = await apiClient.get('/feature-votes');
  return data;
};

export const submitFeatureVote = async ({ featureId, action }) => {
  if (!featureId) {
    throw new Error('featureId is required to vote.');
  }
  if (action === 'remove' || action === 'unvote') {
    const { data } = await apiClient.delete(`/feature-votes/${featureId}/vote`);
    return data;
  }
  const { data } = await apiClient.post(`/feature-votes/${featureId}/vote`);
  return data;
};

export const createFeatureRequest = async (payload) => {
  const body = { ...payload };
  if (Array.isArray(body.tags)) {
    body.tags = body.tags.filter(Boolean);
  }
  const { data } = await apiClient.post('/feature-votes', body);
  return data;
};

export const updateFeatureRequest = async ({ featureId, ...payload }) => {
  if (!featureId) {
    throw new Error('featureId is required to update a feature request.');
  }
  const { data } = await apiClient.patch(`/feature-votes/${featureId}`, payload);
  return data;
};

