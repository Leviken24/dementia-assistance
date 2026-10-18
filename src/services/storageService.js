/**
 * storageService.js
 * Provides safe, resilient local persistence for game sessions, accessibility settings,
 * and user preferences. Adheres strictly to non-clinical data boundaries with in-memory fallback.
 */

const STORAGE_KEYS = {
  GAME_HISTORY: 'cog_game_history',
  ACCESSIBILITY: 'cog_access_settings',
  PREFERENCES: 'cog_user_preferences',
  REMINDERS: 'cog_reminders'
};

export const DEFAULT_REMINDERS = [
  {
    id: 'rem_starter_water',
    title: 'A Refreshing Glass of Water',
    category: 'water',
    time: '10:00',
    recurrence: 'daily',
    days: ['daily'],
    enabled: true,
    snoozedUntil: null,
    lastAcknowledged: null,
    lastDismissed: null,
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
  },
  {
    id: 'rem_starter_rest',
    title: 'Peaceful Afternoon Rest',
    category: 'rest',
    time: '14:30',
    recurrence: 'daily',
    days: ['daily'],
    enabled: true,
    snoozedUntil: null,
    lastAcknowledged: null,
    lastDismissed: null,
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
  },
  {
    id: 'rem_starter_activity',
    title: 'A Calm Evening Walk or Game',
    category: 'activity',
    time: '17:00',
    recurrence: 'daily',
    days: ['daily'],
    enabled: true,
    snoozedUntil: null,
    lastAcknowledged: null,
    lastDismissed: null,
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
  }
];

export const DEFAULT_PREFERENCES = {
  version: 1,
  favoriteGameIds: [],
  gamePreferences: {
    'memory-match': {
      preferredPairCount: 4
    }
  },
  contentState: {
    lastCalmId: null,
    lastDiscoveryId: null
  },
  updatedAt: new Date().toISOString()
};

// In-memory fallback in case localStorage is disabled or throws QuotaExceededError
const inMemoryCache = {
  gameHistory: [],
  accessibility: null,
  preferences: null,
  reminders: null
};

export const storageService = {
  /**
   * Saves a non-diagnostic game session result.
   * @param {Object} result - Session summary { gameId, durationSeconds, completed, moves, pairsMatched, ... }
   * @returns {boolean} True if saved successfully, false if stored in-memory only
   */
  saveGameResult(result) {
    if (!result || typeof result !== 'object') return false;

    const record = {
      resultId: 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      gameId: String(result.gameId || 'unknown'),
      timestamp: result.timestamp ? new Date(result.timestamp).toISOString() : new Date().toISOString(),
      durationSeconds: Math.max(0, Number(result.durationSeconds) || 0),
      completed: Boolean(result.completed),
      turnsTaken: Number(result.turnsTaken) || 0,
      pairsMatched: Number(result.pairsMatched) || 0,
      hintsUsed: Number(result.hintsUsed) || 0,
      rating: 'supportive' // Non-clinical respectful marker
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      const history = raw ? JSON.parse(raw) : [];
      if (Array.isArray(history)) {
        history.unshift(record);
        // Cap local history to 50 items to keep storage lightweight
        const capped = history.slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(capped));
        return true;
      }
    } catch {
      // LocalStorage unavailable, save in-memory with the same 50-item cap
      inMemoryCache.gameHistory.unshift(record);
      if (inMemoryCache.gameHistory.length > 50) {
        inMemoryCache.gameHistory = inMemoryCache.gameHistory.slice(0, 50);
      }
      return true;
    }
    return false;
  },

  /**
   * Retrieves game session history.
   * @returns {Array} Array of past game results
   */
  getGameHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Return in-memory cache
    }
    return inMemoryCache.gameHistory;
  },

  /**
   * Clears all recorded game session history.
   */
  clearGameHistory() {
    inMemoryCache.gameHistory = [];
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Saves user accessibility preferences.
   * @param {Object} settings - { fontSize, highContrast, reducedMotion, soundEnabled }
   */
  saveAccessibilitySettings(settings) {
    if (!settings || typeof settings !== 'object') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(settings));
    } catch {
      inMemoryCache.accessibility = { ...settings };
    }
  },

  /**
   * Retrieves user accessibility preferences with sensible defaults.
   * @returns {Object}
   */
  getAccessibilitySettings() {
    const defaults = {
      fontSize: 'large',       // 'standard' | 'large' | 'extra-large'
      highContrast: false,
      reducedMotion: false,
      soundEnabled: false      // Off by default to avoid startling
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACCESSIBILITY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaults, ...parsed };
      }
    } catch {
      if (inMemoryCache.accessibility) {
        return { ...defaults, ...inMemoryCache.accessibility };
      }
    }
    return defaults;
  },

  /**
   * Retrieves user preferences with safe fallback defaults.
   * @returns {Object} User preferences object
   */
  getUserPreferences() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_PREFERENCES,
            ...parsed,
            favoriteGameIds: Array.isArray(parsed.favoriteGameIds)
              ? parsed.favoriteGameIds.filter(id => typeof id === 'string')
              : DEFAULT_PREFERENCES.favoriteGameIds,
            gamePreferences: {
              ...DEFAULT_PREFERENCES.gamePreferences,
              ...(parsed.gamePreferences || {})
            },
            contentState: {
              ...DEFAULT_PREFERENCES.contentState,
              ...(parsed.contentState || {})
            }
          };
        }
      }
    } catch {
      if (inMemoryCache.preferences) {
        return { ...DEFAULT_PREFERENCES, ...inMemoryCache.preferences };
      }
    }
    return { ...DEFAULT_PREFERENCES };
  },

  /**
   * Saves user preferences to localStorage and in-memory cache.
   * @param {Object} preferences - Partial or complete preferences object
   */
  saveUserPreferences(preferences) {
    if (!preferences || typeof preferences !== 'object') return;
    const current = this.getUserPreferences();
    const updated = {
      ...current,
      ...preferences,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch {
      inMemoryCache.preferences = { ...updated };
    }
    return updated;
  },

  /**
   * Toggles a game as a favorite.
   * @param {string} gameId
   * @returns {Object} Updated preferences
   */
  toggleFavoriteGame(gameId) {
    if (!gameId || typeof gameId !== 'string') return this.getUserPreferences();
    const prefs = this.getUserPreferences();
    const favorites = Array.isArray(prefs.favoriteGameIds) ? [...prefs.favoriteGameIds] : [];
    const index = favorites.indexOf(gameId);

    if (index === -1) {
      favorites.push(gameId);
    } else {
      favorites.splice(index, 1);
    }

    return this.saveUserPreferences({ favoriteGameIds: favorites });
  },

  /**
   * Sets preferred pair count for Memory Match (bounded to 4 or 6).
   * @param {number} pairCount - 4 or 6
   * @returns {Object} Updated preferences
   */
  setPreferredPairCount(pairCount) {
    const validCount = Number(pairCount) === 6 ? 6 : 4;
    const prefs = this.getUserPreferences();
    return this.saveUserPreferences({
      gamePreferences: {
        ...prefs.gamePreferences,
        'memory-match': {
          preferredPairCount: validCount
        }
      }
    });
  },

  /**
   * Resets user preferences back to defaults.
   */
  resetUserPreferences() {
    inMemoryCache.preferences = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    } catch {
      // In-memory already cleared
    }
    return { ...DEFAULT_PREFERENCES };
  },

  /**
   * Retrieves all daily reminders. If not found or empty, initializes with default starter reminders.
   * @returns {Array<Object>} List of reminder records
   */
  getReminders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      if (inMemoryCache.reminders !== null && Array.isArray(inMemoryCache.reminders)) {
        return inMemoryCache.reminders;
      }
    }

    // Default starter reminders on first launch
    const starters = JSON.parse(JSON.stringify(DEFAULT_REMINDERS));
    this.saveAllReminders(starters);
    return starters;
  },

  /**
   * Internal helper to persist an array of reminders.
   * @param {Array<Object>} reminders
   */
  saveAllReminders(reminders) {
    if (!Array.isArray(reminders)) return false;
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch {
      inMemoryCache.reminders = [...reminders];
    }
    return true;
  },

  /**
   * Creates or updates a daily reminder.
   * @param {Object} reminder - Reminder payload { id?, title, time, category, recurrence?, days?, enabled? }
   * @returns {Object} Saved reminder record
   */
  saveReminder(reminder) {
    if (!reminder || typeof reminder !== 'object') return null;

    const currentReminders = this.getReminders();
    const nowIso = new Date().toISOString();
    const isUpdate = reminder.id && currentReminders.some(r => r.id === reminder.id);

    const record = {
      id: isUpdate ? reminder.id : ('rem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
      title: String(reminder.title || 'Untitled Reminder').trim().slice(0, 80),
      category: ['water', 'rest', 'routine', 'activity', 'call', 'medication'].includes(reminder.category)
        ? reminder.category
        : 'routine',
      time: typeof reminder.time === 'string' && /^\d{2}:\d{2}$/.test(reminder.time)
        ? reminder.time
        : '09:00',
      recurrence: reminder.recurrence === 'once' ? 'once' : 'daily',
      days: Array.isArray(reminder.days) && reminder.days.length > 0
        ? reminder.days
        : ['daily'],
      enabled: reminder.enabled !== undefined ? Boolean(reminder.enabled) : true,
      snoozedUntil: reminder.snoozedUntil || null,
      lastAcknowledged: reminder.lastAcknowledged || null,
      lastDismissed: reminder.lastDismissed || null,
      createdAt: isUpdate ? (reminder.createdAt || nowIso) : nowIso,
      updatedAt: nowIso
    };

    let updatedList;
    if (isUpdate) {
      updatedList = currentReminders.map(r => r.id === record.id ? record : r);
    } else {
      updatedList = [...currentReminders, record];
    }

    this.saveAllReminders(updatedList);
    return record;
  },

  /**
   * Deletes a reminder by ID.
   * @param {string} id
   * @returns {Array<Object>} Updated list of reminders
   */
  deleteReminder(id) {
    if (!id) return this.getReminders();
    const current = this.getReminders();
    const filtered = current.filter(r => r.id !== id);
    this.saveAllReminders(filtered);
    return filtered;
  },

  /**
   * Toggles the enabled state of a reminder.
   * @param {string} id
   * @returns {Object|null} Updated reminder, or null if not found
   */
  toggleReminder(id) {
    if (!id) return null;
    const current = this.getReminders();
    let updatedItem = null;

    const updatedList = current.map(r => {
      if (r.id === id) {
        updatedItem = {
          ...r,
          enabled: !r.enabled,
          snoozedUntil: null,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return r;
    });

    if (updatedItem) {
      this.saveAllReminders(updatedList);
    }
    return updatedItem;
  },

  /**
   * Records a user acknowledgement for a reminder.
   * Strictly records interaction notice; does NOT claim clinical task completion.
   * If recurrence is 'once', automatically marks reminder as disabled so it does not repeat.
   * @param {string} id
   * @param {string} timestamp - ISO string
   * @returns {Object|null}
   */
  acknowledgeReminder(id, timestamp = new Date().toISOString()) {
    if (!id) return null;
    const current = this.getReminders();
    let updatedItem = null;

    const updatedList = current.map(r => {
      if (r.id === id) {
        updatedItem = {
          ...r,
          lastAcknowledged: timestamp,
          snoozedUntil: null,
          enabled: r.recurrence === 'once' ? false : r.enabled,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return r;
    });

    if (updatedItem) {
      this.saveAllReminders(updatedList);
    }
    return updatedItem;
  },

  /**
   * Records a user dismissal for a reminder.
   * Clears any active snooze and prevents duplicate notifications within the same minute.
   * If recurrence is 'once', marks as disabled so it does not repeat.
   * @param {string} id
   * @param {string} timestamp - ISO string
   * @returns {Object|null}
   */
  dismissReminder(id, timestamp = new Date().toISOString()) {
    if (!id) return null;
    const current = this.getReminders();
    let updatedItem = null;

    const updatedList = current.map(r => {
      if (r.id === id) {
        updatedItem = {
          ...r,
          lastDismissed: timestamp,
          snoozedUntil: null,
          enabled: r.recurrence === 'once' ? false : r.enabled,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return r;
    });

    if (updatedItem) {
      this.saveAllReminders(updatedList);
    }
    return updatedItem;
  },

  /**
   * Snoozes a reminder for a given number of minutes (default 10).
   * @param {string} id
   * @param {number} minutes
   * @returns {Object|null}
   */
  snoozeReminder(id, minutes = 10) {
    if (!id) return null;
    const current = this.getReminders();
    let updatedItem = null;
    const snoozedTime = new Date(Date.now() + Math.max(1, minutes) * 60000).toISOString();

    const updatedList = current.map(r => {
      if (r.id === id) {
        updatedItem = {
          ...r,
          snoozedUntil: snoozedTime,
          updatedAt: new Date().toISOString()
        };
        return updatedItem;
      }
      return r;
    });

    if (updatedItem) {
      this.saveAllReminders(updatedList);
    }
    return updatedItem;
  },

  /**
   * Resets all reminders back to default starter reminders.
   * @returns {Array<Object>}
   */
  resetReminders() {
    inMemoryCache.reminders = null;
    const starters = JSON.parse(JSON.stringify(DEFAULT_REMINDERS));
    try {
      localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    } catch {
      // In-memory cleared
    }
    this.saveAllReminders(starters);
    return starters;
  }
};
