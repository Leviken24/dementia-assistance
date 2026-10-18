import { describe, it, expect } from 'vitest';
import {
  sortActivitiesByFavorites,
  getRecentActivityShortcut,
  evaluateMemoryMatchDifficultySuggestion,
  evaluatePacingRecommendation,
  getNextRotatedContent
} from '../src/services/personalizationEngine.js';

describe('Personalization Rules Engine', () => {
  const sampleActivities = [
    { id: 'memory-match', title: 'Memory Match' },
    { id: 'picture-sequence', title: 'Picture Stories' },
    { id: 'number-path', title: 'Garden Path' },
    { id: 'dice-match', title: 'Dice Pattern Match' },
    { id: 'word-match', title: 'Word & Picture Match' }
  ];

  describe('Rule 1: Sort Activities by Favorites', () => {
    it('returns activities unchanged when favorites list is empty', () => {
      const sorted = sortActivitiesByFavorites(sampleActivities, []);
      expect(sorted.map(a => a.id)).toEqual(sampleActivities.map(a => a.id));
      expect(sorted.every(a => !a.isFavorite)).toBe(true);
    });

    it('places favorited activities at the head of the list', () => {
      const sorted = sortActivitiesByFavorites(sampleActivities, ['number-path', 'word-match']);
      expect(sorted[0].id).toBe('number-path');
      expect(sorted[0].isFavorite).toBe(true);
      expect(sorted[1].id).toBe('word-match');
      expect(sorted[1].isFavorite).toBe(true);
      expect(sorted.slice(2).map(a => a.id)).toEqual(['memory-match', 'picture-sequence', 'dice-match']);
    });

    it('handles null, undefined, or empty activities safely', () => {
      expect(sortActivitiesByFavorites(null, ['memory-match'])).toEqual([]);
      expect(sortActivitiesByFavorites([], ['memory-match'])).toEqual([]);
    });
  });

  describe('Rule 2: Recent Activity Shortcut', () => {
    it('returns null when history is empty', () => {
      expect(getRecentActivityShortcut([])).toBeNull();
      expect(getRecentActivityShortcut(null)).toBeNull();
    });

    it('returns the most recent game when completed recently', () => {
      const history = [
        {
          gameId: 'memory-match',
          timestamp: new Date().toISOString(),
          durationSeconds: 120,
          turnsTaken: 6,
          pairsMatched: 4
        }
      ];
      const shortcut = getRecentActivityShortcut(history);
      expect(shortcut).not.toBeNull();
      expect(shortcut.gameId).toBe('memory-match');
      expect(shortcut.turnsTaken).toBe(6);
    });

    it('returns null when session is older than maxAgeDays', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      const history = [
        {
          gameId: 'number-path',
          timestamp: eightDaysAgo
        }
      ];
      expect(getRecentActivityShortcut(history, 7)).toBeNull();
    });

    it('handles malformed timestamp gracefully', () => {
      const history = [{ gameId: 'dice-match', timestamp: 'not-a-date' }];
      expect(getRecentActivityShortcut(history)).toBeNull();
    });
  });

  describe('Rule 3: Bounded Memory Match Difficulty Suggestion', () => {
    it('does not suggest 6 pairs if fewer than 3 sessions completed', () => {
      const history = [
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 },
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 }
      ];
      const result = evaluateMemoryMatchDifficultySuggestion(history);
      expect(result.shouldSuggest).toBe(false);
      expect(result.suggestedPairCount).toBe(4);
    });

    it('suggests 6 pairs after 3 consecutive 4-pair sessions with zero hints', () => {
      const history = [
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 },
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 },
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 }
      ];
      const result = evaluateMemoryMatchDifficultySuggestion(history);
      expect(result.shouldSuggest).toBe(true);
      expect(result.suggestedPairCount).toBe(6);
      expect(result.reason).toBe('comfort');
    });

    it('does not suggest 6 pairs if any of the recent 3 sessions used hints', () => {
      const history = [
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 1 },
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 },
        { gameId: 'memory-match', completed: true, pairsMatched: 4, hintsUsed: 0 }
      ];
      const result = evaluateMemoryMatchDifficultySuggestion(history);
      expect(result.shouldSuggest).toBe(false);
    });

    it('single poor result never causes auto-downgrade or crash', () => {
      const history = [
        { gameId: 'memory-match', completed: false, pairsMatched: 1, hintsUsed: 5 }
      ];
      const result = evaluateMemoryMatchDifficultySuggestion(history);
      expect(result.shouldSuggest).toBe(false);
      expect(result.suggestedPairCount).toBe(4);
    });
  });

  describe('Rule 4: Gentle Pacing & Rest Recommendation', () => {
    it('does not recommend rest if fewer than 3 sessions in window', () => {
      const now = Date.now();
      const history = [
        { timestamp: new Date(now).toISOString() },
        { timestamp: new Date(now - 10 * 60 * 1000).toISOString() }
      ];
      const result = evaluatePacingRecommendation(history, 45);
      expect(result.recommendRest).toBe(false);
    });

    it('recommends rest after 3 or more sessions within window', () => {
      const now = Date.now();
      const history = [
        { timestamp: new Date(now).toISOString() },
        { timestamp: new Date(now - 10 * 60 * 1000).toISOString() },
        { timestamp: new Date(now - 20 * 60 * 1000).toISOString() }
      ];
      const result = evaluatePacingRecommendation(history, 45);
      expect(result.recommendRest).toBe(true);
      expect(result.sessionCount).toBe(3);
      expect(result.message).toContain('restful break');
    });

    it('does not recommend rest if 3 sessions are spread over many hours', () => {
      const now = Date.now();
      const history = [
        { timestamp: new Date(now).toISOString() },
        { timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString() }, // 3 hours ago
        { timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString() }  // 6 hours ago
      ];
      const result = evaluatePacingRecommendation(history, 45);
      expect(result.recommendRest).toBe(false);
    });
  });

  describe('Rule 5: Gentle Moments Rotation Continuity', () => {
    const calm = [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }];
    const disc = [{ id: 'd1' }, { id: 'd2' }];

    it('advances to next item when last IDs are present', () => {
      const result = getNextRotatedContent(
        { lastCalmId: 'c1', lastDiscoveryId: 'd1' },
        calm,
        disc
      );
      expect(result.nextCalmId).toBe('c2');
      expect(result.nextDiscoveryId).toBe('d2');
    });

    it('loops to first item when reaching end of array', () => {
      const result = getNextRotatedContent(
        { lastCalmId: 'c3', lastDiscoveryId: 'd2' },
        calm,
        disc
      );
      expect(result.nextCalmId).toBe('c1');
      expect(result.nextDiscoveryId).toBe('d1');
    });

    it('defaults to first item when last IDs are null or not found', () => {
      const result = getNextRotatedContent({}, calm, disc);
      expect(result.nextCalmId).toBe('c1');
      expect(result.nextDiscoveryId).toBe('d1');
    });
  });
});
