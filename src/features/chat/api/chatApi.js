import apiClient from '../../../api/axiosConfig';

const DEFAULT_GENERAL_ROOM = {
  id: 'general',
  slug: 'general',
  label: 'Chat général',
  description: 'Discutez avec l’ensemble de la communauté.',
  type: 'general',
};

const normalizeDomainRoom = (entry) => {
  if (!entry) return null;
  const domain = entry.domain || entry.id || entry.slug || entry.code;
  if (!domain) return null;

  const label = entry.label || entry.name || domain;
  const description = entry.description || entry.details || '';
  const areas = Array.isArray(entry.areas)
    ? entry.areas
    : Array.isArray(entry.available_areas)
      ? entry.available_areas
      : [];
  const normalizedAreas = areas
    .map((area) => (typeof area === 'string' ? area : area?.label || area?.name))
    .filter(Boolean);

  return {
    id: entry.id || domain,
    domain,
    slug: entry.slug || domain,
    label,
    description,
    areas: normalizedAreas,
    activeUserCount:
      entry.activeUserCount || entry.active_users_count || entry.active_users || entry.online_users || 0,
  };
};

const extractRoomsFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { general: DEFAULT_GENERAL_ROOM, domains: [] };
  }

  const generalSource =
    payload.general ||
    payload.room ||
    (Array.isArray(payload.rooms)
      ? payload.rooms.find((room) => room.type === 'general' || room.slug === 'general')
      : null);

  const domainsSource = Array.isArray(payload.domains)
    ? payload.domains
    : Array.isArray(payload.rooms)
      ? payload.rooms.filter((room) => room.type === 'domain' || room.domain)
      : [];

  const general = generalSource
    ? {
        id: generalSource.id || generalSource.slug || 'general',
        slug: generalSource.slug || generalSource.id || 'general',
        label: generalSource.label || generalSource.name || DEFAULT_GENERAL_ROOM.label,
        description: generalSource.description || generalSource.details || DEFAULT_GENERAL_ROOM.description,
        type: 'general',
      }
    : DEFAULT_GENERAL_ROOM;

  const domains = domainsSource
    .map((entry) => normalizeDomainRoom(entry))
    .filter(Boolean)
    .sort((a, b) => a.label.localeCompare(b.label));

  return { general, domains };
};

export const fetchChatRooms = async () => {
  const response = await apiClient.get('/chat/rooms');
  const payload = response?.data ?? {};
  return extractRoomsFromPayload(payload);
};

export const fetchChatHistory = async (roomId, params = {}) => {
  if (!roomId) return [];
  const response = await apiClient.get(`/chat/rooms/${encodeURIComponent(roomId)}/history`, {
    params,
  });
  const messages = response?.data?.messages || response?.data || [];
  return Array.isArray(messages) ? messages : [];
};

export const fetchDomainAreas = async (domain) => {
  if (!domain) return [];
  const response = await apiClient.get(`/chat/rooms/${encodeURIComponent(domain)}/areas`);
  const areas = response?.data?.areas || response?.data || [];
  return Array.isArray(areas)
    ? areas.map((item) => (typeof item === 'string' ? item : item?.label || item?.name)).filter(Boolean)
    : [];
};
