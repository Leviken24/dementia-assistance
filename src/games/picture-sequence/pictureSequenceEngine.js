/**
 * pictureSequenceEngine.js
 * Headless, deterministic game state machine for Picture Sequencing.
 * Completely decoupled from React DOM to allow isolated unit testing.
 */

import { PICTURE_STORIES } from '../../data/pictureSequences.js';
import { shuffleArray } from '../memory-match/memoryMatchEngine.js';

/**
 * Initializes a new Picture Sequencing game session.
 * @param {string} storyId - Story identifier or defaults to first story
 * @returns {Object} Initial game state
 */
export function initSequenceGame(storyId = 'story_plant_growth') {
  const story = PICTURE_STORIES.find(s => s.id === storyId) || PICTURE_STORIES[0];

  // Guarantee that initial available cards are shuffled
  let shuffledCards = shuffleArray(story.steps);
  // Guarantee initial order is not already accidentally solved
  const isAlreadySolved = shuffledCards.every((c, i) => c.order === i + 1);
  if (isAlreadySolved && shuffledCards.length > 1) {
    // Swap first two items
    const [first, second, ...rest] = shuffledCards;
    shuffledCards = [second, first, ...rest];
  }

  return {
    storyId: story.id,
    storyTitle: story.title,
    storyDescription: story.description,
    totalSteps: story.steps.length,
    availableCards: shuffledCards,
    slots: new Array(story.steps.length).fill(null), // Empty slots
    selectedCardId: null,
    startedAt: null,
    completedAt: null,
    durationSeconds: 0,
    attemptsCount: 0,
    hintsUsed: 0,
    hintedCardId: null,
    isComplete: false,
    feedbackMessage: ''
  };
}

/**
 * Handles selecting an available card from the pool or currently occupied slot.
 * @param {Object} state - Current engine state
 * @param {string} cardId - Clicked card identifier
 * @returns {Object} Next engine state
 */
export function selectCard(state, cardId) {
  if (state.isComplete) return state;

  const startedAt = state.startedAt || Date.now();

  // If already selected, unselect it
  if (state.selectedCardId === cardId) {
    return {
      ...state,
      startedAt,
      selectedCardId: null,
      hintedCardId: null
    };
  }

  return {
    ...state,
    startedAt,
    selectedCardId: cardId,
    hintedCardId: null
  };
}

/**
 * Places the selected card into a destination slot.
 * If slot is already occupied, swaps or returns previous card to pool.
 * @param {Object} state - Current engine state
 * @param {number} slotIndex - 0-indexed destination slot
 * @returns {Object} Next engine state
 */
export function placeCardInSlot(state, slotIndex) {
  if (state.isComplete || !state.selectedCardId) return state;
  if (slotIndex < 0 || slotIndex >= state.slots.length) return state;

  const cardId = state.selectedCardId;

  // Find card in available pool or existing slot
  let cardToPlace = state.availableCards.find(c => c.stepId === cardId);
  const sourceSlotIndex = state.slots.findIndex(s => s && s.stepId === cardId);

  if (!cardToPlace && sourceSlotIndex !== -1) {
    cardToPlace = state.slots[sourceSlotIndex];
  }

  if (!cardToPlace) return state;

  const currentSlotOccupant = state.slots[slotIndex];

  // Create new slots copy
  const nextSlots = [...state.slots];
  let nextAvailable = [...state.availableCards];

  // If card was in available pool, remove it
  if (state.availableCards.some(c => c.stepId === cardId)) {
    nextAvailable = nextAvailable.filter(c => c.stepId !== cardId);
  }

  // If card was moved from another slot, clear that slot
  if (sourceSlotIndex !== -1) {
    nextSlots[sourceSlotIndex] = currentSlotOccupant; // Swap if target had occupant, or set null
  } else if (currentSlotOccupant) {
    // If target had occupant and card came from available pool, return occupant to pool
    nextAvailable.push(currentSlotOccupant);
  }

  // Place in target slot
  nextSlots[slotIndex] = cardToPlace;

  return {
    ...state,
    slots: nextSlots,
    availableCards: nextAvailable,
    selectedCardId: null,
    hintedCardId: null,
    feedbackMessage: ''
  };
}

/**
 * Removes a card from a slot and returns it to the available pool.
 * @param {Object} state - Current engine state
 * @param {number} slotIndex - Slot to clear
 * @returns {Object} Next engine state
 */
export function removeCardFromSlot(state, slotIndex) {
  if (state.isComplete) return state;
  const card = state.slots[slotIndex];
  if (!card) return state;

  const nextSlots = [...state.slots];
  nextSlots[slotIndex] = null;

  return {
    ...state,
    slots: nextSlots,
    availableCards: [...state.availableCards, card],
    selectedCardId: null,
    hintedCardId: null,
    feedbackMessage: ''
  };
}

/**
 * Checks if the current slots form the correct chronological sequence.
 * @param {Object} state - Current engine state
 * @returns {Object} Next engine state with completion or respectful encouragement
 */
export function evaluateSequence(state) {
  // Must have all slots filled
  const allFilled = state.slots.every(slot => slot !== null);
  if (!allFilled) {
    return {
      ...state,
      feedbackMessage: 'Please place all pictures into the story boxes first.'
    };
  }

  const attemptsCount = state.attemptsCount + 1;
  const isCorrect = state.slots.every((slot, index) => slot.order === index + 1);

  if (isCorrect) {
    const completedAt = Date.now();
    const durationSeconds = Math.max(1, Math.round((completedAt - (state.startedAt || completedAt)) / 1000));

    return {
      ...state,
      attemptsCount,
      isComplete: true,
      completedAt,
      durationSeconds,
      feedbackMessage: 'Wonderful! You arranged the story in perfect order.'
    };
  } else {
    return {
      ...state,
      attemptsCount,
      feedbackMessage: 'Almost there! Take another gentle look, or tap Hint for help.'
    };
  }
}

/**
 * Provides a gentle hint identifying the correct card for the earliest incorrect slot.
 * @param {Object} state - Current engine state
 * @returns {Object} State with hinted card indicated
 */
export function triggerSequenceHint(state) {
  if (state.isComplete) return state;

  // Find the first slot that is either empty or incorrect
  let targetIndex = -1;
  for (let i = 0; i < state.slots.length; i++) {
    if (!state.slots[i] || state.slots[i].order !== i + 1) {
      targetIndex = i;
      break;
    }
  }

  if (targetIndex === -1) return state;

  const expectedOrder = targetIndex + 1;
  // Locate the card with expected order
  const cardInPool = state.availableCards.find(c => c.order === expectedOrder);
  const cardInSlot = state.slots.find(c => c && c.order === expectedOrder);
  const targetCard = cardInPool || cardInSlot;

  return {
    ...state,
    hintsUsed: state.hintsUsed + 1,
    hintedCardId: targetCard ? targetCard.stepId : null,
    feedbackMessage: `Hint: "${targetCard ? targetCard.title : ''}" belongs in Box ${expectedOrder}.`
  };
}
