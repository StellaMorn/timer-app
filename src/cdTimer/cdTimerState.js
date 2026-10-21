export const STORAGE_KEY = "cdTimer.v1";
export const DEFAULT_CUSTOM_MINUTES = 15;
// How long the "UP!" shine effect stays visible after a timer finishes.
export const JUST_READY_MS = 6000;

export const CATEGORIES = [
  { key: "20", label: "20分", minutes: 20, namePrefix: "TL" },
  { key: "30", label: "30分", minutes: 30, namePrefix: "RES" },
  { key: "10", label: "10分", minutes: 10, namePrefix: "SS" },
  { key: "custom", label: "カスタム", minutes: null, namePrefix: "CUSTOM" },
];

export const createInitialState = () => ({
  members: Object.fromEntries(CATEGORIES.map(({ key }) => [key, []])),
  customMinutes: DEFAULT_CUSTOM_MINUTES,
});

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const isPositiveNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const sanitizeMember = (member) => {
  if (!member || typeof member.id !== "string") {
    return null;
  }
  return {
    id: member.id,
    name: typeof member.name === "string" ? member.name : "",
    endAt: isPositiveNumber(member.endAt) ? member.endAt : null,
    duration: isPositiveNumber(member.duration) ? member.duration : null,
  };
};

export const parseState = (raw) => {
  const initial = createInitialState();
  if (!raw) {
    return initial;
  }
  try {
    const parsed = JSON.parse(raw);
    const members = { ...initial.members };
    CATEGORIES.forEach(({ key }) => {
      const list = parsed?.members?.[key];
      if (Array.isArray(list)) {
        members[key] = list.map(sanitizeMember).filter(Boolean);
      }
    });
    return {
      members,
      customMinutes: isPositiveNumber(parsed?.customMinutes)
        ? parsed.customMinutes
        : initial.customMinutes,
    };
  } catch (e) {
    return initial;
  }
};

export const loadState = () => {
  try {
    return parseState(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return createInitialState();
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage may be unavailable (private mode etc.); the timers still work.
  }
};

const findCategory = (categoryKey) =>
  CATEGORIES.find(({ key }) => key === categoryKey);

export const getCategoryMinutes = (state, categoryKey) => {
  const category = findCategory(categoryKey);
  return category.minutes === null ? state.customMinutes : category.minutes;
};

export const isRunning = (member, now) =>
  member.endAt !== null && now < member.endAt;

export const isJustReady = (member, now) =>
  member.endAt !== null &&
  now >= member.endAt &&
  now - member.endAt < JUST_READY_MS;

// `now` comes from a ticking clock and can lag slightly behind the moment the
// timer was started, so clamp to the duration to avoid showing e.g. "20:01".
export const getRemainingSeconds = (member, now) =>
  isRunning(member, now)
    ? Math.min(member.duration, Math.ceil((member.endAt - now) / 1000))
    : 0;

const updateMembers = (state, categoryKey, updater) => ({
  ...state,
  members: {
    ...state.members,
    [categoryKey]: updater(state.members[categoryKey]),
  },
});

const updateMember = (state, categoryKey, id, updater) =>
  updateMembers(state, categoryKey, (list) =>
    list.map((member) => (member.id === id ? updater(member) : member))
  );

export const nextDefaultName = (list, prefix) => {
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  const maxNumber = list.reduce((max, { name }) => {
    const match = pattern.exec(name);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `${prefix}${maxNumber + 1}`;
};

export const addMember = (state, categoryKey) => {
  const { namePrefix } = findCategory(categoryKey);
  return updateMembers(state, categoryKey, (list) => [
    ...list,
    {
      id: createId(),
      name: nextDefaultName(list, namePrefix),
      endAt: null,
      duration: null,
    },
  ]);
};

export const removeMember = (state, categoryKey, id) =>
  updateMembers(state, categoryKey, (list) =>
    list.filter((member) => member.id !== id)
  );

export const renameMember = (state, categoryKey, id, name) => {
  const trimmed = name.trim();
  if (trimmed === "") {
    return state;
  }
  return updateMember(state, categoryKey, id, (member) => ({
    ...member,
    name: trimmed,
  }));
};

export const startMember = (state, categoryKey, id, now) => {
  const duration = getCategoryMinutes(state, categoryKey) * 60;
  return updateMember(state, categoryKey, id, (member) =>
    isRunning(member, now)
      ? member
      : { ...member, endAt: now + duration * 1000, duration }
  );
};

export const resetMember = (state, categoryKey, id) =>
  updateMember(state, categoryKey, id, (member) => ({
    ...member,
    endAt: null,
    duration: null,
  }));

export const moveMember = (state, categoryKey, fromIndex, toIndex) =>
  updateMembers(state, categoryKey, (list) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= list.length ||
      toIndex >= list.length
    ) {
      return list;
    }
    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  });

export const setCustomMinutes = (state, minutes) =>
  isPositiveNumber(minutes) ? { ...state, customMinutes: minutes } : state;
