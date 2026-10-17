/**
 * diceMatchEngine.js
 * Headless, deterministic state machine for the Gentle Dice Match activity.
 * Focuses on visual pattern recognition and number counting without gambling or betting.
 */

export const TOTAL_DICE_ROUNDS = 5;

/**
 * Generates 3 distinct numerical options including the target value.
 * @param {number} targetValue - Correct die dot count (1 to 6)
 * @returns {Array<number>} Shuffled array of 3 distinct numbers
 */
export function generateDiceOptions(targetValue) {
  const options = new Set([targetValue]);
  const possible = [1, 2, 3, 4, 5, 6].filter(n => n !== targetValue);

  // Shuffle possible distractors and pick 2
  for (let i = possible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [possible[i], possible[j]] = [possible[j], possible[i]];
  }

  options.add(possible[0]);
  options.add(possible[1]);

  const arr = Array.from(options);
  // Sort numbers in ascending order for elderly predictability
  return arr.sort((a, b) => a - b);
}

/**
 * Initializes a new dice match round.
 * @param {number|null} customValue - Optional value for deterministic testing (1-6)
 * @returns {Object} Round data
 */
export function createDiceRound(customValue = null) {
  const dieValue = customValue !== null ? customValue : Math.floor(Math.random() * 6) + 1;
  const options = generateDiceOptions(dieValue);
  return {
    dieValue,
    options,
    isRoundSolved: false,
    selectedOption: null,
    hintGiven: false
  };
}

/**
 * Creates initial clean state for the dice match activity.
 * @param {number|null} initialDieValue - Optional initial roll for testing
 * @returns {Object} Initial game state
 */
export function createInitialDiceState(initialDieValue = null) {
  const firstRound = createDiceRound(initialDieValue);
  return {
    roundNumber: 1,
    totalRounds: TOTAL_DICE_ROUNDS,
    currentRound: firstRound,
    correctCount: 0,
    attemptsCount: 0,
    hintsUsed: 0,
    startedAt: null,
    completedAt: null,
    durationSeconds: 0,
    isComplete: false,
    feedbackMessage: 'How many dots are on the die? Tap the matching number below.'
  };
}

/**
 * Evaluates the user's selected numerical guess.
 * @param {Object} state - Current engine state
 * @param {number} selectedNumber - Number selected by user
 * @returns {Object} Next engine state
 */
export function evaluateDiceGuess(state, selectedNumber) {
  if (state.isComplete || state.currentRound.isRoundSolved) return state;

  const startedAt = state.startedAt || Date.now();
  const attemptsCount = state.attemptsCount + 1;
  const isCorrect = selectedNumber === state.currentRound.dieValue;

  if (isCorrect) {
    const correctCount = state.correctCount + 1;
    const isComplete = correctCount >= state.totalRounds;
    const completedAt = isComplete ? Date.now() : null;
    const durationSeconds = isComplete
      ? Math.max(1, Math.round((completedAt - startedAt) / 1000))
      : 0;

    return {
      ...state,
      startedAt,
      attemptsCount,
      correctCount,
      isComplete,
      completedAt,
      durationSeconds,
      currentRound: {
        ...state.currentRound,
        isRoundSolved: true,
        selectedOption: selectedNumber
      },
      feedbackMessage: isComplete
        ? `Wonderful! You correctly matched all ${TOTAL_DICE_ROUNDS} dice patterns!`
        : `Lovely! Correct, that is ${selectedNumber} dot${selectedNumber > 1 ? 's' : ''}.`
    };
  } else {
    return {
      ...state,
      startedAt,
      attemptsCount,
      feedbackMessage: `Take another gentle look. You can count the dots one by one.`
    };
  }
}

/**
 * Transitions to the next dice round.
 * @param {Object} state - Current engine state
 * @param {number|null} nextDieValue - Optional deterministic roll for unit testing
 * @returns {Object} Next round state
 */
export function advanceToNextDiceRound(state, nextDieValue = null) {
  if (state.isComplete) return state;
  const nextRoundNumber = state.roundNumber + 1;
  const nextRound = createDiceRound(nextDieValue);

  return {
    ...state,
    roundNumber: nextRoundNumber,
    currentRound: nextRound,
    feedbackMessage: `Round ${nextRoundNumber} of ${state.totalRounds}: Count the dots on the die.`
  };
}

/**
 * Triggers a gentle hint by revealing dot grouping guidance.
 * @param {Object} state - Current engine state
 * @returns {Object} Next engine state with hint
 */
export function triggerDiceHint(state) {
  if (state.isComplete || state.currentRound.isRoundSolved) return state;
  const target = state.currentRound.dieValue;

  return {
    ...state,
    hintsUsed: state.hintsUsed + 1,
    currentRound: {
      ...state.currentRound,
      hintGiven: true
    },
    feedbackMessage: `Hint: Try counting the dots in pairs or rows. There are ${target} dots in total.`
  };
}
