// Animation and delay related constants
export const ANIMATION_DELAYS = {
  SCROLL_TO_MATCH: 100, // scroll-to-match delay (ms)
  HIGHLIGHT_DURATION: 2000, // highlight duration (ms)
  SEARCH_DEBOUNCE: 300, // search debounce delay (ms)
} as const;

// Authentication related constants
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    AUTH_TIME: 'auth_time',
  },
} as const;

// UI related constants
export const UI_CONFIG = {
  SEARCH_INPUT_WIDTH: 'w-48',
  FILTER_PANEL_WIDTH: 'w-80',
  MAX_SEARCH_RESULTS_DISPLAY: 50, // maximum number of displayed search results
} as const;

// Search related constants
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 1, // minimum search length
  MAX_SEARCH_RESULTS: 100, // max search results
  SEARCH_FIELDS: {
    NAME: 'name',
    INFO: 'info',
    YEAR: 'year',
  },
} as const;

// CSS class name constants
export const CSS_CLASSES = {
  HIGHLIGHT: {
    RING: 'ring-2',
    RING_COLOR: 'ring-blue-400',
    BACKGROUND: 'bg-blue-50',
  },
  SEARCH_HIGHLIGHT: 'bg-yellow-200 px-1 rounded',
} as const;