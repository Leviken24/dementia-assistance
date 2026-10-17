import { describe, it, expect } from 'vitest';
import {
  createInitialPathState,
  advancePath,
  resetPathGame
} from '../src/games/number-path/numberPathEngine.js';
import {
  createInitialDiceState,
  evaluateDiceGuess,
  advanceToNextDiceRound
} from '../src/games/dice-match/diceMatchEngine.js';
import {
  createInitialWordState,
  submitWordAnswer,
  skipWordQuestion
} from '../src/games/word-match/wordMatchEngine.js';
import { storageService } from '../src/services/storageService.js';

describe('Phase 2C Independent Verification & Stability Audit Tests', () => {
  describe('Board Game (Number Path) Verification', () => {
    it('AUDIT-P2-NP-01: Position advances step-by-step and never exceeds stone 20', () => {
      let state = createInitialPathState();
      expect(state.currentPosition).toBe(1);

      // Roll 4 steps 10 times (total 40)
      for (let i = 0; i < 10; i++) {
        state = advancePath(state, 4);
      }

      expect(state.currentPosition).toBe(20);
      expect(state.isComplete).toBe(true);
      expect(state.turnsCount).toBe(5); // 1 + (4*4) = 17 -> +4 = 20 (reached at turn 5)
    });

    it('AUDIT-P2-NP-02: Resetting game clears all counters and returns to stone 1', () => {
      let state = createInitialPathState();
      state = advancePath(state, 3);
      expect(state.currentPosition).toBe(4);

      const resetState = resetPathGame();
      expect(resetState.currentPosition).toBe(1);
      expect(resetState.turnsCount).toBe(0);
      expect(resetState.lastRoll).toBeNull();
      expect(resetState.isComplete).toBe(false);
    });
  });

  describe('Dice Activity (Dice Match) Verification', () => {
    it('AUDIT-P2-DM-01: Tapping already solved round options does not increment score', () => {
      const state = createInitialDiceState(4);
      const solvedState = evaluateDiceGuess(state, 4);

      expect(solvedState.correctCount).toBe(1);
      expect(solvedState.currentRound.isRoundSolved).toBe(true);

      // Attempt to guess again while round is solved
      const secondGuess = evaluateDiceGuess(solvedState, 4);
      expect(secondGuess.correctCount).toBe(1);
      expect(secondGuess.attemptsCount).toBe(1);
    });

    it('AUDIT-P2-DM-02: Natural progression through 5 rounds reaches completion', () => {
      let state = createInitialDiceState(2);

      for (let i = 1; i <= 5; i++) {
        const val = state.currentRound.dieValue;
        state = evaluateDiceGuess(state, val);
        if (i < 5) {
          state = advanceToNextDiceRound(state, (i % 6) + 1);
        }
      }

      expect(state.correctCount).toBe(5);
      expect(state.isComplete).toBe(true);
      expect(state.durationSeconds).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Word Puzzle (Word Match) Verification', () => {
    it('AUDIT-P2-WM-01: Case and whitespace normalization guarantees matching accuracy', () => {
      const state = createInitialWordState();
      const target = state.currentQuestion.correctWord;

      // Submit uppercase with irregular tabs and spaces
      const rawInput = `   \t ${target.toUpperCase()} \n  `;
      const res = submitWordAnswer(state, rawInput);

      expect(res.correctCount).toBe(1);
      expect(res.currentQuestion.isSolved).toBe(true);
    });

    it('AUDIT-P2-WM-02: Non-string and empty inputs are safely rejected', () => {
      const state = createInitialWordState();

      const r1 = submitWordAnswer(state, '');
      expect(r1.feedbackMessage).toContain('Please tap one');

      const r2 = submitWordAnswer(state, null);
      expect(r2.feedbackMessage).toContain('Please tap one');

      const r3 = submitWordAnswer(state, undefined);
      expect(r3.feedbackMessage).toContain('Please tap one');

      expect(r3.correctCount).toBe(0);
    });

    it('AUDIT-P2-WM-03: Skipping all 5 questions reaches completion without crash', () => {
      let state = createInitialWordState();

      for (let i = 0; i < 5; i++) {
        state = skipWordQuestion(state);
      }

      expect(state.isComplete).toBe(true);
      expect(state.completedAt).toBeDefined();
    });
  });

  describe('Multi-Game Result Persistence Verification', () => {
    it('AUDIT-P2-ST-01: All 5 game identifiers save and retrieve cleanly', () => {
      const gameIds = ['memory-match', 'picture-sequence', 'number-path', 'dice-match', 'word-match'];

      gameIds.forEach(id => {
        const saved = storageService.saveGameResult({
          gameId: id,
          durationSeconds: 30,
          completed: true,
          turnsTaken: 5
        });
        expect(saved).toBe(true);
      });

      const history = storageService.getGameHistory();
      gameIds.forEach(id => {
        const found = history.find(h => h.gameId === id);
        expect(found).toBeDefined();
        expect(found.rating).toBe('supportive');
      });
    });
  });
});
