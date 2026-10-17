import { describe, it, expect } from 'vitest';
import {
  createInitialPathState,
  advancePath,
  resetPathGame
} from '../src/games/number-path/numberPathEngine.js';

describe('Number Path Board Game Engine - Automated Unit Tests', () => {
  it('TC-NP-01: Initializes game at Stone 1 with clean state', () => {
    const state = createInitialPathState();
    expect(state.currentPosition).toBe(1);
    expect(state.totalStones).toBe(20);
    expect(state.turnsCount).toBe(0);
    expect(state.isComplete).toBe(false);
    expect(state.milestoneMessage).toContain('Garden Gate');
  });

  it('TC-NP-02: Advances player token accurately by deterministic roll', () => {
    const state = createInitialPathState();
    const nextState = advancePath(state, 3);

    expect(nextState.currentPosition).toBe(4); // 1 + 3 = 4 (Sunny Bench)
    expect(nextState.turnsCount).toBe(1);
    expect(nextState.lastRoll).toBe(3);
    expect(nextState.milestoneMessage).toContain('Sunny Bench');
    expect(nextState.startedAt).toBeDefined();
  });

  it('TC-NP-03: Clamps movement to Stone 20 and detects completion', () => {
    let state = createInitialPathState();
    // Advance directly near the end
    state = advancePath(state, 4); // 5
    state = advancePath(state, 4); // 9
    state = advancePath(state, 4); // 13
    state = advancePath(state, 4); // 17
    state = advancePath(state, 4); // 21 -> clamped to 20!

    expect(state.currentPosition).toBe(20);
    expect(state.isComplete).toBe(true);
    expect(state.completedAt).toBeDefined();
    expect(state.durationSeconds).toBeGreaterThanOrEqual(1);
    expect(state.milestoneMessage).toContain('Rose Garden Pavilion');
  });

  it('TC-NP-04: Further rolls after completion are rejected', () => {
    let state = createInitialPathState();
    state = advancePath(state, 19); // Directly reaches 20
    expect(state.isComplete).toBe(true);
    const finalTurns = state.turnsCount;

    const postWinState = advancePath(state, 2);
    expect(postWinState.currentPosition).toBe(20);
    expect(postWinState.turnsCount).toBe(finalTurns);
  });

  it('TC-NP-05: Reset returns player to Stone 1 with cleared counters', () => {
    let state = createInitialPathState();
    state = advancePath(state, 4);
    expect(state.currentPosition).toBe(5);

    const resetState = resetPathGame();
    expect(resetState.currentPosition).toBe(1);
    expect(resetState.turnsCount).toBe(0);
    expect(resetState.isComplete).toBe(false);
  });
});
