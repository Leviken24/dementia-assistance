/**
 * memoryMatchEngine.js
 * Headless, deterministic game state machine for Memory Match.
 * Completely decoupled from React DOM to allow isolated unit testing.
 */

import { NATURE_DECK } from '../../data/memoryMatchDecks.js';

/**
 * Modern Fisher-Yates (Knuth) Shuffle algorithm.
 * Guarantees unbiased random distribution.
 * @param {Array} array
 * @returns {Array} Shuffled copy of array
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates and shuffles a clean card deck.
 * @param {number} pairCount - Number of pairs to generate (e.g. 4 or 6)
 * @param {Array} sourceDeck - Optional custom source cards
 * @returns {Array} Array of card objects
 */
export function createDeck(pairCount = 4, sourceDeck = NATURE_DECK) {
  const selectedPairs = sourceDeck.slice(0, Math.min(pairCount, sourceDeck.length));
  const cards = [];

  selectedPairs.forEach((item, index) => {
    // Generate two discrete card instances with unique IDs
    cards.push({
      id: `card_${index}_a`,
      pairKey: item.pairKey,
      label: item.label,
      iconType: item.iconType,
      description: item.description,
      isFlipped: false,
      isMatched: false,
      isHinted: false
    });
    cards.push({
      id: `card_${index}_b`,
      pairKey: item.pairKey,
      label: item.label,
      iconType: item.iconType,
      description: item.description,
      isFlipped: false,
      isMatched: false,
      isHinted: false
    });
  });

  return shuffleArray(cards);
}

/**
 * Creates initial clean game state.
 * @param {number} pairCount - 4 (Gentle) or 6 (Standard)
 * @returns {Object} Initial state
 */
export function createInitialState(pairCount = 4) {
  const cards = createDeck(pairCount);
  return {
    pairCount,
    totalPairs: pairCount,
    cards,
    selectedCardIds: [],
    isLocked: false,
    turnsTaken: 0,
    pairsMatched: 0,
    hintsUsed: 0,
    isComplete: false,
    startedAt: null,
    completedAt: null,
    durationSeconds: 0
  };
}

/**
 * Pure state reducer for card selection.
 * Handles single flip, match evaluation, and locks.
 * @param {Object} state - Current engine state
 * @param {string} cardId - Selected card's ID
 * @returns {Object} New state and optional side-effect instruction { nextState, actionRequired }
 */
export function handleCardSelection(state, cardId) {
  // Edge Case 1: Game already completed
  if (state.isComplete) {
    return { nextState: state, actionRequired: null };
  }

  // Edge Case 2: Board is currently locked during mismatch reveal
  if (state.isLocked) {
    return { nextState: state, actionRequired: null };
  }

  // Find target card
  const targetCard = state.cards.find(c => c.id === cardId);
  if (!targetCard) {
    return { nextState: state, actionRequired: null };
  }

  // Edge Case 3: Card is already permanently matched
  if (targetCard.isMatched) {
    return { nextState: state, actionRequired: null };
  }

  // Edge Case 4: Card is already selected as the first card
  if (state.selectedCardIds.includes(cardId)) {
    return { nextState: state, actionRequired: null };
  }

  // Set startedAt on first valid interaction
  const startedAt = state.startedAt || Date.now();

  // First card selected
  if (state.selectedCardIds.length === 0) {
    const nextCards = state.cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true, isHinted: false } : { ...c, isHinted: false }
    );

    return {
      nextState: {
        ...state,
        startedAt,
        cards: nextCards,
        selectedCardIds: [cardId]
      },
      actionRequired: 'CARD_FLIPPED'
    };
  }

  // Second card selected
  if (state.selectedCardIds.length === 1) {
    const firstCardId = state.selectedCardIds[0];
    const firstCard = state.cards.find(c => c.id === firstCardId);

    // Prevent matching with itself
    if (firstCard.id === targetCard.id) {
      return { nextState: state, actionRequired: null };
    }

    const turnsTaken = state.turnsTaken + 1;
    const isMatch = firstCard.pairKey === targetCard.pairKey;

    if (isMatch) {
      // Matching pair found!
      const pairsMatched = state.pairsMatched + 1;
      const isComplete = pairsMatched === state.totalPairs;
      const completedAt = isComplete ? Date.now() : null;
      const durationSeconds = isComplete
        ? Math.max(1, Math.round((completedAt - startedAt) / 1000))
        : 0;

      const nextCards = state.cards.map(c => {
        if (c.id === firstCardId || c.id === targetCard.id) {
          return { ...c, isFlipped: true, isMatched: true, isHinted: false };
        }
        return c;
      });

      return {
        nextState: {
          ...state,
          cards: nextCards,
          selectedCardIds: [],
          turnsTaken,
          pairsMatched,
          isComplete,
          completedAt,
          durationSeconds,
          isLocked: false
        },
        actionRequired: isComplete ? 'GAME_COMPLETED' : 'MATCH_FOUND'
      };
    } else {
      // Mismatch: Flip 2nd card face-up and lock board for observation
      const nextCards = state.cards.map(c =>
        c.id === targetCard.id ? { ...c, isFlipped: true, isHinted: false } : c
      );

      return {
        nextState: {
          ...state,
          cards: nextCards,
          selectedCardIds: [firstCardId, targetCard.id],
          turnsTaken,
          isLocked: true // Prevent any further selections while mismatch is visible
        },
        actionRequired: 'MISMATCH_PENDING'
      };
    }
  }

  return { nextState: state, actionRequired: null };
}

/**
 * Resolves a pending mismatch by turning the two cards back down and unlocking the board.
 * @param {Object} state - Current engine state
 * @returns {Object} Next clean state
 */
export function resolveMismatch(state) {
  if (state.selectedCardIds.length !== 2) {
    return state;
  }

  const [id1, id2] = state.selectedCardIds;
  const nextCards = state.cards.map(c => {
    if ((c.id === id1 || c.id === id2) && !c.isMatched) {
      return { ...c, isFlipped: false, isHinted: false };
    }
    return c;
  });

  return {
    ...state,
    cards: nextCards,
    selectedCardIds: [],
    isLocked: false
  };
}

/**
 * Highlights an unmatched pair gently for a hint without changing game state.
 * @param {Object} state - Current engine state
 * @returns {Object} State with hinted cards flagged
 */
export function triggerHint(state) {
  if (state.isLocked || state.isComplete) return state;

  // Find the first available unmatched pair
  const unmatched = state.cards.filter(c => !c.isMatched);
  if (unmatched.length === 0) return state;

  const targetPairKey = unmatched[0].pairKey;
  const nextCards = state.cards.map(c => {
    if (c.pairKey === targetPairKey && !c.isMatched) {
      return { ...c, isHinted: true };
    }
    return { ...c, isHinted: false };
  });

  return {
    ...state,
    hintsUsed: state.hintsUsed + 1,
    cards: nextCards
  };
}
