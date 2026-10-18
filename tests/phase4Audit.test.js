import { describe, it, expect, beforeEach } from 'vitest';
import {
  sortActivitiesByFavorites,
  getRecentActivityShortcut,
  evaluateMemoryMatchDifficultySuggestion,
  evaluatePacingRecommendation,
  getNextRotatedContent
} from '../src/services/personalizationEngine.js';
import { storageService, DEFAULT_PREFERENCES } from '../src/services/storageService.js';
import { createInitialState as createMMState } from '../src/games/memory-match/memoryMatchEngine.js';
import { initSequenceGame } from '../src/games/picture-sequence/pictureSequenceEngine.js';
import { createInitialPathState } from '../src/games/number-path/numberPathEngine.js';
import { createInitialDiceState } from '../src/games/dice-match/diceMatchEngine.js';
import { createInitialWordState } from '../src/games/word-match/wordMatchEngine.js';

describe('Phase 4C Comprehensive Verification and Audit', () => {
  const store = {};

  beforeEach(() => {
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

  describe('1. Personalization Rules Verification', () => {
    const sampleActivities = [
      { id: 'memory-match', title: 'Memory Match' },
      { id: 'picture-sequence', title: 'Picture Stories' },
      { id: 'number-path', title: 'Garden Path' },
      { id: 'dice-match', title: 'Dice Pattern Match' },
      { id: 'word-match', title: 'Word & Picture Match' }
    ];

    it('Rule 1: preserves non-favorite order while hoisting favorites', () => {
      const sorted = sortActivitiesByFavorites(sampleActivities, ['word-match']);
      expect(sorted[0].id).toBe('word-match');
      expect(sorted[0].isFavorite).toBe(true);
      expect(sorted[1].id).toBe('memory-match');
      expect(sorted[2].id).toBe('picture-sequence');
      expect(sorted[3].id).toBe('number-path');
      expect(sorted[4].id).toBe('dice-match');
    });

    it('Rule 2: correctly identifies recent game within 7-day window', () => {
      const recentSession = {
        gameId: 'dice-match',
        timestamp: new Date().toISOString(),
        durationSeconds: 150,
        turnsTaken: 5,
        pairsMatched: 5,
        completed: true
      };
      storageService.saveGameResult(recentSession);

      const shortcut = getRecentActivityShortcut(storageService.getGameHistory(), 7);
      expect(shortcut).not.toBeNull();
      expect(shortcut.gameId).toBe('dice-match');
      expect(shortcut.turnsTaken).toBe(5);
    });

    it('Rule 2: ignores sessions older than 7 days', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const oldSession = {
        gameId: 'picture-sequence',
        timestamp: oldDate,
        durationSeconds: 200,
        completed: true
      };
      storageService.saveGameResult(oldSession);

      const shortcut = getRecentActivityShortcut(storageService.getGameHistory(), 7);
      expect(shortcut).toBeNull();
    });

    it('Rule 3: bounded difficulty invitation requires exactly 3 consecutive 0-hint 4-pair sessions', () => {
      // 2 sessions: no suggestion
      storageService.saveGameResult({ gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 });
      storageService.saveGameResult({ gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 });
      expect(evaluateMemoryMatchDifficultySuggestion(storageService.getGameHistory()).shouldSuggest).toBe(false);

      // 3rd session: suggestion triggers
      storageService.saveGameResult({ gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 });
      const rec = evaluateMemoryMatchDifficultySuggestion(storageService.getGameHistory());
      expect(rec.shouldSuggest).toBe(true);
      expect(rec.suggestedPairCount).toBe(6);

      // Now add a game with hints: suggestion disappears
      storageService.saveGameResult({ gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 2 });
      expect(evaluateMemoryMatchDifficultySuggestion(storageService.getGameHistory()).shouldSuggest).toBe(false);
    });

    it('Rule 4: pacing recommendation suggests rest only when 3+ sessions occur in close window', () => {
      const now = Date.now();
      const history = [
        { timestamp: new Date(now).toISOString() },
        { timestamp: new Date(now - 10 * 60 * 1000).toISOString() },
        { timestamp: new Date(now - 25 * 60 * 1000).toISOString() }
      ];
      const result = evaluatePacingRecommendation(history, 45);
      expect(result.recommendRest).toBe(true);
      expect(result.sessionCount).toBe(3);
      expect(result.message).toBeTruthy();
    });

    it('Rule 5: content rotation loops seamlessly and defaults gracefully', () => {
      const calm = [{ id: 'c1' }, { id: 'c2' }];
      const disc = [{ id: 'd1' }, { id: 'd2' }];

      const initial = getNextRotatedContent({}, calm, disc);
      expect(initial.nextCalmId).toBe('c1');
      expect(initial.nextDiscoveryId).toBe('d1');

      const next = getNextRotatedContent({ lastCalmId: 'c1', lastDiscoveryId: 'd1' }, calm, disc);
      expect(next.nextCalmId).toBe('c2');
      expect(next.nextDiscoveryId).toBe('d2');

      const looped = getNextRotatedContent({ lastCalmId: 'c2', lastDiscoveryId: 'd2' }, calm, disc);
      expect(looped.nextCalmId).toBe('c1');
      expect(looped.nextDiscoveryId).toBe('d1');
    });
  });

  describe('2. Preference Persistence & Storage Resilience', () => {
    it('persists favorites and pairCount changes safely', () => {
      storageService.toggleFavoriteGame('number-path');
      storageService.setPreferredPairCount(6);

      const prefs = storageService.getUserPreferences();
      expect(prefs.favoriteGameIds).toContain('number-path');
      expect(prefs.gamePreferences['memory-match'].preferredPairCount).toBe(6);
    });

    it('bounds invalid preferredPairCount values to safe defaults', () => {
      storageService.setPreferredPairCount(999);
      expect(storageService.getUserPreferences().gamePreferences['memory-match'].preferredPairCount).toBe(4);

      storageService.setPreferredPairCount(-5);
      expect(storageService.getUserPreferences().gamePreferences['memory-match'].preferredPairCount).toBe(4);
    });

    it('recovers to default preferences on corrupt JSON without throwing', () => {
      globalThis.localStorage.setItem('cog_user_preferences', '{"corrupted"');
      expect(() => storageService.getUserPreferences()).not.toThrow();
      expect(storageService.getUserPreferences()).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('3. Core Game & Phase 1-3 Regression Verification', () => {
    it('Memory Match engine initializes and flips correctly for 4 and 6 pairs', () => {
      const mm4 = createMMState(4);
      expect(mm4.cards.length).toBe(8);
      expect(mm4.totalPairs).toBe(4);

      const mm6 = createMMState(6);
      expect(mm6.cards.length).toBe(12);
      expect(mm6.totalPairs).toBe(6);
    });

    it('Picture Sequence engine initializes with 4 cards and unplaced state', () => {
      const ps = initSequenceGame();
      expect(ps.slots.length).toBe(4);
      expect(ps.availableCards.length).toBe(4);
      expect(ps.isComplete).toBe(false);
    });

    it('Garden Path engine initializes at stone 1 with 20 milestones', () => {
      const np = createInitialPathState();
      expect(np.currentPosition).toBe(1);
      expect(np.totalStones).toBe(20);
      expect(np.isComplete).toBe(false);
    });

    it('Dice Match engine initializes round 1 with 5 total rounds', () => {
      const dm = createInitialDiceState();
      expect(dm.roundNumber).toBe(1);
      expect(dm.totalRounds).toBe(5);
      expect(dm.currentRound.dieValue).toBeGreaterThanOrEqual(1);
      expect(dm.currentRound.dieValue).toBeLessThanOrEqual(6);
    });

    it('Word Match engine initializes question 1 with 5 questions and 3 options', () => {
      const wm = createInitialWordState();
      expect(wm.currentIndex).toBe(0);
      expect(wm.totalQuestions).toBe(5);
      expect(wm.currentQuestion.options.length).toBe(3);
    });
  });
});
