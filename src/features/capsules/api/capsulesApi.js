import apiClient from '../../../api/axiosConfig';

const KNOWN_ARRAY_KEYS = ['items', 'results', 'data', 'capsules', 'list', 'entries', 'records'];

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(lowered)) return true;
    if (['false', '0', 'no'].includes(lowered)) return false;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return fallback;
};

const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];

  for (const key of KNOWN_ARRAY_KEYS) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.pagination?.items)) {
    return payload.pagination.items;
  }

  if (payload.values && Array.isArray(payload.values)) {
    return payload.values;
  }

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

const normalizeAtom = (atom) => {
  if (!atom || typeof atom !== 'object') {
    return {
      id: null,
      order: 0,
      title: '',
      content: '',
      metadata: {},
      content_type: 'lesson',
      progress_status: 'not_started',
      reward_xp: 0,
      xp_value: 0,
      is_bonus: false,
      is_locked: false,
      capsule_id: null,
      molecule_id: null,
      raw: atom,
    };
  }

  const id =
    atom.id ??
    atom.atom_id ??
    atom.uuid ??
    atom.external_id ??
    (atom.type ? `${atom.type}-${atom.order ?? Date.now()}` : null);

  const order = toNumber(atom.order ?? atom.position ?? atom.index);
  const content =
    atom.content ??
    atom.body ??
    atom.text ??
    atom.markdown ??
    atom.html ??
    '';
  const metadata = atom.metadata ?? atom.meta ?? {};
  const contentType =
    atom.content_type ??
    atom.type ??
    atom.kind ??
    metadata.content_type ??
    'lesson';
  const progressStatus =
    atom.progress_status ??
    atom.status ??
    metadata.progress_status ??
    metadata.status ??
    'not_started';
  const rewardXp = toNumber(atom.reward_xp ?? atom.xp ?? atom.xp_value);
  const capsuleId = atom.capsule_id ?? atom.capsuleId ?? metadata.capsule_id ?? null;
  const moleculeId = atom.molecule_id ?? atom.moleculeId ?? metadata.molecule_id ?? null;

  return {
    id,
    order,
    title: pickFirstString(atom, ['title', 'name', 'heading', 'label']),
    content,
    body: content,
    markdown: atom.markdown ?? content,
    html: atom.html ?? null,
    metadata,
    content_type: contentType,
    type: contentType,
    progress_status: progressStatus,
    reward_xp: rewardXp,
    xp_value: rewardXp,
    is_bonus: toBoolean(atom.is_bonus ?? atom.bonus),
    is_locked: toBoolean(atom.is_locked ?? atom.locked),
    capsule_id: capsuleId,
    molecule_id: moleculeId,
    raw: atom,
  };
};

const computeProgressStatus = (atoms, fallback = 'not_started') => {
  if (!atoms || atoms.length === 0) return fallback;
  const allCompleted = atoms.every((atom) => (atom.progress_status ?? 'not_started') === 'completed');
  if (allCompleted) return 'completed';
  const anyAttempt = atoms.some((atom) => {
    const status = atom.progress_status ?? 'not_started';
    return status !== 'not_started' && status !== 'locked';
  });
  return anyAttempt ? 'in_progress' : fallback;
};

const normalizeMolecule = (molecule) => {
  if (!molecule || typeof molecule !== 'object') {
    return {
      id: null,
      order: 0,
      title: '',
      description: '',
      atoms: [],
      atom_count: 0,
      generation_status: 'pending',
      progress_status: 'not_started',
      xp_reward: 0,
      is_locked: false,
      raw: molecule,
    };
  }

  const atoms = toArray(molecule.atoms ?? molecule.contents ?? molecule.elements).map(normalizeAtom);
  const atomCount = atoms.length || toNumber(molecule.atom_count ?? molecule.atoms_count ?? molecule.atom_total);
  const generationStatus =
    molecule.generation_status ??
    molecule.generationStatus ??
    molecule.status ??
    molecule.state ??
    'completed';
  const progressStatus =
    molecule.progress_status ??
    molecule.progressStatus ??
    molecule.study_status ??
    computeProgressStatus(atoms, 'not_started');

  return {
    id: molecule.id ?? molecule.molecule_id ?? molecule.uuid ?? null,
    order: toNumber(molecule.order ?? molecule.position ?? molecule.index),
    title: pickFirstString(molecule, ['title', 'name', 'label']),
    description: pickFirstString(molecule, ['description', 'summary', 'details']),
    atoms,
    atom_count: atomCount,
    generation_status: generationStatus,
    progress_status: progressStatus,
    xp_reward: toNumber(molecule.xp_reward ?? molecule.reward_xp ?? molecule.xp ?? 0),
    is_locked: toBoolean(molecule.is_locked ?? molecule.locked),
    is_bonus_available: toBoolean(molecule.is_bonus_available ?? molecule.bonus_available),
    raw: molecule,
  };
};

const normalizeGranule = (granule) => {
  if (!granule || typeof granule !== 'object') {
    return {
      id: null,
      order: 0,
      title: '',
      description: '',
      molecules: [],
      raw: granule,
    };
  }

  const molecules = toArray(granule.molecules ?? granule.lessons ?? granule.modules).map(normalizeMolecule);
  molecules.sort((a, b) => a.order - b.order);

  return {
    id: granule.id ?? granule.granule_id ?? granule.uuid ?? null,
    order: toNumber(granule.order ?? granule.position ?? granule.index),
    title: pickFirstString(granule, ['title', 'name', 'label']),
    description: pickFirstString(granule, ['description', 'summary', 'details']),
    molecules,
    raw: granule,
  };
};

const normalizeCapsuleSummary = (capsule) => {
  if (!capsule || typeof capsule !== 'object') {
    return {
      id: null,
      title: 'Capsule',
      description: '',
      domain: 'others',
      area: '',
      main_skill: '',
      level_count: 0,
      atom_count: 0,
      xp_reward: 0,
      xp_target: 0,
      xp_goal: 0,
      xp_current: 0,
      user_xp: 0,
      progress_percentage: 0,
      progress: 0,
      progress_status: 'not_started',
      is_locked: false,
      is_enrolled: false,
      lesson_count: 0,
      coach_enabled: true,
      unread_messages_count: 0,
      generation_status: 'completed',
      tags: [],
      author_name: '',
      created_at: null,
      icon: null,
      raw: capsule,
    };
  }

  const levelCount =
    toNumber(capsule.level_count ?? capsule.levels ?? capsule.granule_count ?? capsule.granules?.length) || 0;
  const atomCount = toNumber(capsule.atom_count ?? capsule.atoms ?? capsule.atom_total ?? capsule.total_atoms) || 0;
  const generationStatus =
    capsule.generation_status ??
    capsule.status ??
    capsule.state ??
    'completed';

  const xpTarget =
    toNumber(
      capsule.xp_target ??
        capsule.target_xp ??
        capsule.xpTarget ??
        capsule.goal_xp ??
        capsule.xp_goal ??
        capsule.total_xp ??
        capsule.reward_target
    ) || 0;
  const normalizedXpTarget = xpTarget > 0 ? xpTarget : 6000;

  const xpCurrent = toNumber(
    capsule.xp_current ??
      capsule.user_xp ??
      capsule.progress_xp ??
      capsule.earned_xp ??
      capsule.xp ??
      capsule.current_xp
  );

  const progressSource =
    capsule.progress_percentage ??
    capsule.progress_percent ??
    capsule.completion_rate ??
    capsule.progress ??
    null;
  const progressPercentage = progressSource != null
    ? Math.max(0, Math.min(toNumber(progressSource), 100))
    : normalizedXpTarget > 0
      ? Math.min(100, (xpCurrent / normalizedXpTarget) * 100)
      : 0;

  const progressStatus =
    capsule.progress_status ??
    capsule.learning_status ??
    capsule.study_status ??
    capsule.status ??
    (xpCurrent > 0 ? (progressPercentage >= 100 ? 'completed' : 'in_progress') : 'not_started');

  const isLocked = toBoolean(
    capsule.is_locked ??
      capsule.locked ??
      (typeof capsule.access === 'string' ? capsule.access === 'locked' : capsule.access) ??
      (typeof capsule.permissions === 'string' ? capsule.permissions === 'locked' : capsule.permissions)
  );

  const isEnrolled = toBoolean(
    capsule.is_enrolled ??
      capsule.enrolled ??
      capsule.enrollment_active ??
      capsule.user_enrolled ??
      false
  );

  const unreadMessages = toNumber(
    capsule.unread_messages_count ??
      capsule.chat_unread_count ??
      capsule.assistant_unread_count ??
      capsule.coach_unread_count ??
      0
  );

  const lessonCount =
    toNumber(
      capsule.lesson_count ??
        capsule.lessons_count ??
        capsule.total_lessons ??
        capsule.lesson_total ??
        capsule.levels_count ??
        capsule.level_count
    ) ||
    (Array.isArray(capsule.lessons)
      ? capsule.lessons.length
      : Array.isArray(capsule.modules)
        ? capsule.modules.reduce(
            (sum, module) =>
              sum + (Array.isArray(module?.lessons) ? module.lessons.length : 0),
            0,
          )
        : 0);

  return {
    id: capsule.id ?? capsule.capsule_id ?? capsule.uuid ?? capsule.slug ?? null,
    title: pickFirstString(capsule, ['title', 'name', 'label'], 'Capsule'),
    description: pickFirstString(capsule, ['description', 'summary', 'subtitle', 'details']),
    domain:
      pickFirstString(capsule, ['domain', 'domain_slug', 'domain_code', 'domain_id', 'category'], 'others') || 'others',
    area: pickFirstString(capsule, ['area', 'topic', 'subdomain', 'subject', 'area_slug']),
    main_skill: pickFirstString(capsule, ['main_skill', 'skill', 'skill_name', 'focus']),
    level_count: levelCount,
    atom_count: atomCount,
    xp_reward: toNumber(capsule.xp_reward ?? capsule.total_xp ?? capsule.reward_xp),
    xp_target: normalizedXpTarget,
    xp_goal: normalizedXpTarget,
    xp_current: xpCurrent,
    user_xp: xpCurrent,
    progress_percentage: progressPercentage,
    progress: progressPercentage,
    progress_status: progressStatus,
    is_locked: isLocked,
    is_enrolled: isEnrolled,
    lesson_count: lessonCount,
    coach_enabled: toBoolean(capsule.coach_enabled ?? capsule.assistant_enabled ?? true),
    unread_messages_count: unreadMessages,
    chat_unread_count: unreadMessages,
    icon: capsule.icon ?? capsule.emoji ?? capsule.symbol ?? null,
    generation_status: generationStatus,
    tags: normalizeTags(capsule.tags),
    author_name: pickFirstString(capsule, ['author_name', 'author', 'created_by', 'owner', 'creator']),
    created_at:
      capsule.created_at ??
      capsule.createdAt ??
      capsule.inserted_at ??
      capsule.updated_at ??
      null,
    raw: capsule,
  };
};

const normalizeCapsuleDetail = (capsule) => {
  const summary = normalizeCapsuleSummary(capsule);
  const granules = toArray(capsule.granules ?? capsule.levels ?? capsule.structure).map(normalizeGranule);
  granules.sort((a, b) => a.order - b.order);

  return {
    ...summary,
    objectives: capsule.objectives ?? capsule.goals ?? [],
    prerequisites: capsule.prerequisites ?? capsule.requirements ?? [],
    granules,
    raw: capsule,
  };
};

const normalizeCapsuleListResponse = (payload) => {
  const list = toArray(payload).map(normalizeCapsuleSummary);
  if (Array.isArray(payload?.capsules)) {
    return { items: list, raw: payload };
  }

  if (payload && typeof payload === 'object') {
    return {
      items: list,
      raw: payload,
      total: payload.total ?? payload.count ?? list.length,
      next: payload.next ?? null,
      previous: payload.previous ?? null,
    };
  }

  return { items: list, raw: payload };
};

const extractAtomsResponse = (payload) => {
  const atoms = toArray(payload?.atoms ?? payload?.items ?? payload).map(normalizeAtom);
  return {
    atoms,
    generationStatus: payload?.generation_status ?? payload?.status ?? computeProgressStatus(atoms, 'not_started'),
    progressStatus: payload?.progress_status ?? computeProgressStatus(atoms, 'not_started'),
  };
};

export const fetchPublicCapsules = async () => {
  const response = await apiClient.get('/capsules/public');
  return normalizeCapsuleListResponse(response?.data ?? []);
};

export const fetchMyCapsules = async () => {
  const response = await apiClient.get('/capsules/me');
  return normalizeCapsuleListResponse(response?.data ?? []);
};

export const enrollInCapsule = async (capsuleId) => {
  if (!capsuleId) throw new Error('capsuleId is required');
  const { data } = await apiClient.post(`/capsules/${capsuleId}/enroll`);
  return data;
};

export const fetchCapsuleDetail = async (domain, area, capsuleId) => {
  if (!capsuleId) throw new Error('capsuleId is required');
  const { data } = await apiClient.get(`/capsules/${domain}/${area}/${capsuleId}`);
  if (data && typeof data === 'object' && data.capsule) {
    return normalizeCapsuleDetail(data.capsule);
  }
  return normalizeCapsuleDetail(data);
};

export const fetchMoleculeAtoms = async (moleculeId) => {
  if (!moleculeId) throw new Error('moleculeId is required');
  const response = await apiClient.get(`/capsules/molecules/${moleculeId}/atoms`, {
    validateStatus: (status) => [200, 202].includes(status),
  });

  if (response.status === 202) {
    return {
      atoms: [],
      generationStatus: 'pending',
      progressStatus: 'in_progress',
    };
  }

  return extractAtomsResponse(response.data ?? []);
};

export const generateMoleculeBonus = async (moleculeId, payload = {}) => {
  if (!moleculeId) throw new Error('moleculeId is required');
  const response = await apiClient.post(`/capsules/molecules/${moleculeId}/bonus`, payload);
  return extractAtomsResponse(response?.data ?? []);
};

export const fetchLearningSession = async (capsuleId, granuleOrder, moleculeOrder) => {
  if (!capsuleId) throw new Error('capsuleId is required');
  const response = await apiClient.get(
    `/capsules/${capsuleId}/granule/${granuleOrder}/molecule/${moleculeOrder}`,
    { validateStatus: (status) => [200, 202].includes(status) }
  );

  if (response.status === 202) {
    return { atoms: [], generationStatus: 'pending' };
  }

  return extractAtomsResponse(response.data ?? []);
};

export const classifyCapsuleTopic = async (text) => {
  const { data } = await apiClient.post('/capsules/classify-topic/', { text });
  return data;
};

export const createCapsule = async (payload) => {
  const { data } = await apiClient.post('/capsules/', payload);
  return data;
};

export const createCapsuleFromPdf = async ({ file, metadata }) => {
  const formData = new FormData();
  formData.append('pdf_file', file);
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
  }
  const { data } = await apiClient.post('/capsules/from-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const fetchClassificationOptions = async () => {
  const { data } = await apiClient.get('/capsules/classification/options');
  return data;
};

export const submitClassificationFeedback = async (payload) => {
  const { data } = await apiClient.post('/capsules/classification/feedback', payload);
  return data;
};

export default {
  fetchPublicCapsules,
  fetchMyCapsules,
  enrollInCapsule,
  fetchCapsuleDetail,
  fetchMoleculeAtoms,
  fetchLearningSession,
  generateMoleculeBonus,
  classifyCapsuleTopic,
  createCapsule,
  createCapsuleFromPdf,
  fetchClassificationOptions,
  submitClassificationFeedback,
};
