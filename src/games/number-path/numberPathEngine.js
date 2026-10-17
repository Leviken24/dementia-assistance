/**
 * numberPathEngine.js
 * Headless, deterministic state machine for the Number Path (Gentle Garden Path) board game.
 * Completely forward-moving with zero demoting/backward penalties.
 */

import { GARDEN_PATH_MILESTONES, TOTAL_PATH_STONES } from '../../data/pathMilestones.js';

/**
 * Creates clean initial state for Number Path.
 * @returns {Object} Initial game state
 */
export function createInitialPathState() {
  return {
    currentPosition: 1,
    totalStones: TOTAL_PATH_STONES,
    lastRoll: null,
    turnsCount: 0,
    startedAt: null,
    completedAt: null,
    durationSeconds: 0,
    isComplete: false,
    milestoneMessage: 'Welcome to the Garden Gate! Tap Roll Die to take your first steps.'
  };
}

/**
 * Advances the player along the path by rolling a die.
 * @param {Object} state - Current engine state
 * @param {number|null} customRoll - Optional deterministic roll for unit testing (1-4)
 * @returns {Object} Next engine state
 */
export function advancePath(state, customRoll = null) {
  if (state.isComplete) return state;

  const startedAt = state.startedAt || Date.now();
  // Rolls are gentle: 1 to 4 (keeps progress gradual and observable)
  const roll = customRoll !== null ? customRoll : Math.floor(Math.random() * 4) + 1;
  const turnsCount = state.turnsCount + 1;

  const newPosition = Math.min(TOTAL_PATH_STONES, state.currentPosition + roll);
  const isComplete = newPosition >= TOTAL_PATH_STONES;
  const completedAt = isComplete ? Date.now() : null;
  const durationSeconds = isComplete
    ? Math.max(1, Math.round((completedAt - startedAt) / 1000))
    : 0;

  let milestoneMessage = `You rolled a ${roll} and took ${roll} peaceful step${roll > 1 ? 's' : ''} to Stone ${newPosition}.`;
  const milestone = GARDEN_PATH_MILESTONES[newPosition];
  if (milestone) {
    if (milestone.type === 'goal') {
      milestoneMessage = `Wonderful! You reached the Rose Garden Pavilion!`;
    } else {
      milestoneMessage = `You rolled a ${roll} and reached the ${milestone.label}! ${milestone.description}`;
    }
  }

  return {
    ...state,
    startedAt,
    currentPosition: newPosition,
    lastRoll: roll,
    turnsCount,
    isComplete,
    completedAt,
    durationSeconds,
    milestoneMessage
  };
}

/**
 * Resets the game to Stone 1.
 * @returns {Object} Clean initial state
 */
export function resetPathGame() {
  return createInitialPathState();
}
