import { describe, it, expect } from 'vitest';
import {
  createInitialDiceState,
  evaluateDiceGuess,
  advanceToNextDiceRound,
  triggerDiceHint,
  generateDiceOptions
} from '../src/games/dice-match/diceMatchEngine.js';

describe('Dice Match Activity Engine - Automated Unit Tests', () => {
  it('TC-DM-01: Generates 3 distinct options including the target die value in ascending order', () => {
    const options = generateDiceOptions(4);
    expect(options).toHaveLength(3);
    expect(options).toContain(4);
    expect(new Set(options).size).toBe(3);
    // Ascending order check
    expect(options[0]).toBeLessThan(options[1]);
    expect(options[1]).toBeLessThan(options[2]);
  });

  it('TC-DM-02: Initializes game with round 1 of 5 and clean state', () => {
    const state = createInitialDiceState(3);
    expect(state.roundNumber).toBe(1);
    expect(state.totalRounds).toBe(5);
    expect(state.currentRound.dieValue).toBe(3);
    expect(state.currentRound.options).toContain(3);
    expect(state.correctCount).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('TC-DM-03: Evaluates correct guess, marks round solved, and increments correctCount', () => {
    const state = createInitialDiceState(5);
    const nextState = evaluateDiceGuess(state, 5);

    expect(nextState.correctCount).toBe(1);
    expect(nextState.currentRound.isRoundSolved).toBe(true);
    expect(nextState.feedbackMessage).toContain('Correct');
  });

  it('TC-DM-04: Incorrect guess offers gentle guidance without penalizing or locking out', () => {
    const state = createInitialDiceState(5);
    const nextState = evaluateDiceGuess(state, 2); // Incorrect guess

    expect(nextState.correctCount).toBe(0);
    expect(nextState.currentRound.isRoundSolved).toBe(false);
    expect(nextState.attemptsCount).toBe(1);
    expect(nextState.feedbackMessage).toContain('Take another gentle look');

    // User can try again and succeed
    const retryState = evaluateDiceGuess(nextState, 5);
    expect(retryState.correctCount).toBe(1);
    expect(retryState.currentRound.isRoundSolved).toBe(true);
  });

  it('TC-DM-05: Advances across 5 rounds to natural completion', () => {
    let state = createInitialDiceState(1);

    for (let round = 1; round <= 5; round++) {
      const target = state.currentRound.dieValue;
      state = evaluateDiceGuess(state, target);
      if (round < 5) {
        state = advanceToNextDiceRound(state, (round % 6) + 1);
      }
    }

    expect(state.correctCount).toBe(5);
    expect(state.isComplete).toBe(true);
    expect(state.completedAt).toBeDefined();
    expect(state.durationSeconds).toBeGreaterThanOrEqual(1);
  });

  it('TC-DM-06: Hint provides non-punitive dot counting guidance', () => {
    const state = createInitialDiceState(4);
    const hintedState = triggerDiceHint(state);

    expect(hintedState.hintsUsed).toBe(1);
    expect(hintedState.currentRound.hintGiven).toBe(true);
    expect(hintedState.feedbackMessage).toContain('4 dots');
  });
});
