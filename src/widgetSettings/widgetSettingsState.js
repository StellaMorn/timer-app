import { CATEGORIES } from "../cdTimer/cdTimerState";
import { moveItem } from "../hook/useDragReorder";

export const STORAGE_KEY = "widgetSettings.v1";

// Shape:
// {
//   configs: { [configId]: { order: [title], hiddenTimers: [title] } },
//   cdTimerCategories: [categoryKey]  // TL/RES/SS categories shown on the main page
// }
// Timers missing from `order` (e.g. added to a config later) go last, and
// only hidden timers are stored, so new timers show up by default.
export const createInitialSettings = () => ({
  configs: {},
  cdTimerCategories: [],
});

const EMPTY_CONFIG_SETTINGS = { order: [], hiddenTimers: [] };

const CATEGORY_KEYS = CATEGORIES.map(({ key }) => key);

const isString = (value) => typeof value === "string";

const toArray = (value, isValid) =>
  Array.isArray(value) ? value.filter(isValid) : [];

export const parseSettings = (raw) => {
  const initial = createInitialSettings();
  if (!raw) {
    return initial;
  }
  try {
    const parsed = JSON.parse(raw);
    const configs = {};
    Object.entries(parsed?.configs ?? {}).forEach(([configId, value]) => {
      configs[configId] = {
        order: toArray(value?.order, isString),
        hiddenTimers: toArray(value?.hiddenTimers, isString),
      };
    });
    return {
      configs,
      cdTimerCategories: toArray(parsed?.cdTimerCategories, (key) =>
        CATEGORY_KEYS.includes(key)
      ),
    };
  } catch (e) {
    return initial;
  }
};

export const getConfigSettings = (settings, configId) =>
  settings.configs[configId] ?? EMPTY_CONFIG_SETTINGS;

// All timers of a config (separators dropped) in the user's order.
export const getOrderedTimers = (settings, config) => {
  const timers = config.timers.filter(({ isSeparator }) => !isSeparator);
  const { order } = getConfigSettings(settings, config.id);
  const rank = (title) => {
    const index = order.indexOf(title);
    return index === -1 ? order.length : index;
  };
  // Array.prototype.sort is stable, so unranked timers keep config order.
  return [...timers].sort((a, b) => rank(a.title) - rank(b.title));
};

export const isTimerVisible = (settings, configId, title) =>
  !getConfigSettings(settings, configId).hiddenTimers.includes(title);

export const getVisibleTimers = (settings, config) =>
  getOrderedTimers(settings, config).filter(({ title }) =>
    isTimerVisible(settings, config.id, title)
  );

const updateConfigSettings = (settings, configId, updater) => ({
  ...settings,
  configs: {
    ...settings.configs,
    [configId]: updater(getConfigSettings(settings, configId)),
  },
});

export const setTimerVisible = (settings, configId, title, visible) =>
  updateConfigSettings(settings, configId, (config) => ({
    ...config,
    hiddenTimers: visible
      ? config.hiddenTimers.filter((hidden) => hidden !== title)
      : [...config.hiddenTimers.filter((hidden) => hidden !== title), title],
  }));

// Moves the timer `fromTitle` to the position of the timer `toTitle`.
export const moveTimer = (settings, config, fromTitle, toTitle) => {
  const titles = getOrderedTimers(settings, config).map(({ title }) => title);
  return updateConfigSettings(settings, config.id, (configSettings) => ({
    ...configSettings,
    order: moveItem(titles, titles.indexOf(fromTitle), titles.indexOf(toTitle)),
  }));
};

export const resetConfigSettings = (settings, configId) =>
  updateConfigSettings(settings, configId, () => EMPTY_CONFIG_SETTINGS);

export const setCdCategoryVisible = (settings, categoryKey, visible) => ({
  ...settings,
  cdTimerCategories: CATEGORY_KEYS.filter((key) =>
    key === categoryKey ? visible : settings.cdTimerCategories.includes(key)
  ),
});
