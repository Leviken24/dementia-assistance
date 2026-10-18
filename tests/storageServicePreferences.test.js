import { describe, it, expect, beforeEach } from 'vitest';
import { storageService, DEFAULT_PREFERENCES } from '../src/services/storageService.js';

describe('StorageService Preferences & History Management', () => {
  const store = {};

  beforeEach(() => {
    // Setup mock localStorage in Node/Vitest environment
    globalThis.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
    globalThis.localStorage.clear();
    storageService.resetUserPreferences();
    storageService.clearGameHistory();
  });

  it('returns default preferences when nothing has been stored', () => {
    const prefs = storageService.getUserPreferences();
    expect(prefs).toBeDefined();
    expect(prefs.favoriteGameIds).toEqual([]);
    expect(prefs.gamePreferences['memory-match'].preferredPairCount).toBe(4);
    expect(prefs.contentState.lastCalmId).toBeNull();
  });

  it('saves and merges updated user preferences', () => {
    storageService.saveUserPreferences({
      favoriteGameIds: ['memory-match']
    });

    const prefs = storageService.getUserPreferences();
    expect(prefs.favoriteGameIds).toEqual(['memory-match']);
    // Other defaults remain intact
    expect(prefs.gamePreferences['memory-match'].preferredPairCount).toBe(4);
  });

  it('toggles a favorite game on and off correctly', () => {
    // Add favorite
    storageService.toggleFavoriteGame('picture-sequence');
    let prefs = storageService.getUserPreferences();
    expect(prefs.favoriteGameIds).toContain('picture-sequence');

    // Remove favorite
    storageService.toggleFavoriteGame('picture-sequence');
    prefs = storageService.getUserPreferences();
    expect(prefs.favoriteGameIds).not.toContain('picture-sequence');
  });

  it('bounds memory-match preferredPairCount to 4 or 6 only', () => {
    storageService.setPreferredPairCount(6);
    expect(storageService.getUserPreferences().gamePreferences['memory-match'].preferredPairCount).toBe(6);

    // Any invalid number defaults to 4
    storageService.setPreferredPairCount(10);
    expect(storageService.getUserPreferences().gamePreferences['memory-match'].preferredPairCount).toBe(4);

    storageService.setPreferredPairCount(2);
    expect(storageService.getUserPreferences().gamePreferences['memory-match'].preferredPairCount).toBe(4);
  });

  it('clears game history without clearing user preferences', () => {
    storageService.saveGameResult({ gameId: 'word-match', durationSeconds: 60, completed: true });
    storageService.toggleFavoriteGame('word-match');

    expect(storageService.getGameHistory().length).toBe(1);
    expect(storageService.getUserPreferences().favoriteGameIds).toContain('word-match');

    storageService.clearGameHistory();
    expect(storageService.getGameHistory().length).toBe(0);
    // Preferences still retained
    expect(storageService.getUserPreferences().favoriteGameIds).toContain('word-match');
  });

  it('recovers gracefully from corrupted JSON in localStorage', () => {
    globalThis.localStorage.setItem('cog_user_preferences', '{invalid json syntax}');
    const prefs = storageService.getUserPreferences();
    expect(prefs).toBeDefined();
    expect(prefs.favoriteGameIds).toEqual([]);
    expect(prefs.gamePreferences['memory-match'].preferredPairCount).toBe(4);
  });
});
