/**
 * storageService.js
 * Provides safe, resilient local persistence for game sessions and accessibility preferences.
 * Adheres strictly to non-clinical data boundaries with in-memory fallback.
 */

const STORAGE_KEYS = {
  GAME_HISTORY: 'cog_game_history',
  ACCESSIBILITY: 'cog_access_settings'
};

// In-memory fallback in case localStorage is disabled or throws QuotaExceededError
const inMemoryCache = {
  gameHistory: [],
  accessibility: null
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
      timestamp: new Date().toISOString(),
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
  }
};
