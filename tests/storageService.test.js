import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService.js';

describe('Storage Service - Local & Resilient Persistence', () => {
  beforeEach(() => {
    // Clear mock storage
    try {
      localStorage.clear();
    } catch {
      // Ignored in headless environments
    }
  });

  it('TC-ST-01: Saves a valid game result with supportive rating and timestamp', () => {
    const result = {
      gameId: 'memory-match',
      durationSeconds: 45,
      completed: true,
      turnsTaken: 6,
      pairsMatched: 4,
      hintsUsed: 1
    };

    const saved = storageService.saveGameResult(result);
    expect(saved).toBe(true);

    const history = storageService.getGameHistory();
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].gameId).toBe('memory-match');
    expect(history[0].rating).toBe('supportive'); // Non-diagnostic guarantee
    expect(history[0].durationSeconds).toBe(45);
    expect(history[0].resultId).toBeDefined();
  });

  it('TC-ST-02: Handles invalid or null result objects gracefully without crashing', () => {
    expect(() => storageService.saveGameResult(null)).not.toThrow();
    expect(() => storageService.saveGameResult(undefined)).not.toThrow();
    expect(() => storageService.saveGameResult('invalid')).not.toThrow();
  });

  it('TC-ST-03: Saves and retrieves accessibility preferences', () => {
    const settings = {
      fontSize: 'extra-large',
      highContrast: true,
      reducedMotion: true,
      soundEnabled: false
    };

    storageService.saveAccessibilitySettings(settings);
    const retrieved = storageService.getAccessibilitySettings();

    expect(retrieved.fontSize).toBe('extra-large');
    expect(retrieved.highContrast).toBe(true);
    expect(retrieved.reducedMotion).toBe(true);
  });
});
