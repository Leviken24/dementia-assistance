import { describe, it, expect } from 'vitest';
import {
  createDeck,
  createInitialState,
  handleCardSelection,
  resolveMismatch,
  triggerHint
} from '../src/games/memory-match/memoryMatchEngine.js';

describe('Memory Match Engine - Automated Unit Tests', () => {
  it('TC-MM-01: Generates valid deck with matching pairs and unique IDs', () => {
    const deck = createDeck(4);
    expect(deck).toHaveLength(8);

    // Verify all IDs are unique
    const ids = deck.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(8);

    // Verify each pairKey appears exactly twice
    const pairCounts = {};
    deck.forEach(c => {
      pairCounts[c.pairKey] = (pairCounts[c.pairKey] || 0) + 1;
    });

    Object.values(pairCounts).forEach(count => {
      expect(count).toBe(2);
    });

    // Verify all cards start face down and unmatched
    deck.forEach(card => {
      expect(card.isFlipped).toBe(false);
      expect(card.isMatched).toBe(false);
    });
  });

  it('TC-MM-02: Starts game with clean initial state', () => {
    const state = createInitialState(4);
    expect(state.cards).toHaveLength(8);
    expect(state.selectedCardIds).toEqual([]);
    expect(state.isLocked).toBe(false);
    expect(state.turnsTaken).toBe(0);
    expect(state.pairsMatched).toBe(0);
    expect(state.isComplete).toBe(false);
    expect(state.totalPairs).toBe(4);
  });

  it('TC-MM-03: Single card selection flips card and records selection', () => {
    const state = createInitialState(4);
    const targetCard = state.cards[0];

    const { nextState, actionRequired } = handleCardSelection(state, targetCard.id);
    expect(actionRequired).toBe('CARD_FLIPPED');
    expect(nextState.selectedCardIds).toEqual([targetCard.id]);
    const flippedCard = nextState.cards.find(c => c.id === targetCard.id);
    expect(flippedCard.isFlipped).toBe(true);
    expect(nextState.startedAt).toBeDefined();
  });

  it('TC-MM-04: Prevents selecting the exact same card twice in one comparison', () => {
    const state = createInitialState(4);
    const targetCard = state.cards[0];

    const { nextState: state1 } = handleCardSelection(state, targetCard.id);
    const { nextState: state2, actionRequired } = handleCardSelection(state1, targetCard.id);

    // Action should be rejected
    expect(actionRequired).toBeNull();
    expect(state2.selectedCardIds).toHaveLength(1);
    expect(state2.turnsTaken).toBe(0);
  });

  it('TC-MM-05: Correctly identifies and locks matching pairs permanently', () => {
    const state = createInitialState(4);
    const firstCard = state.cards[0];
    const matchingPartner = state.cards.find(
      c => c.pairKey === firstCard.pairKey && c.id !== firstCard.id
    );

    const { nextState: state1 } = handleCardSelection(state, firstCard.id);
    const { nextState: state2, actionRequired } = handleCardSelection(state1, matchingPartner.id);

    expect(actionRequired).toBe('MATCH_FOUND');
    expect(state2.turnsTaken).toBe(1);
    expect(state2.pairsMatched).toBe(1);
    expect(state2.selectedCardIds).toEqual([]);
    expect(state2.isLocked).toBe(false);

    const card1InDeck = state2.cards.find(c => c.id === firstCard.id);
    const card2InDeck = state2.cards.find(c => c.id === matchingPartner.id);
    expect(card1InDeck.isMatched).toBe(true);
    expect(card2InDeck.isMatched).toBe(true);
  });

  it('TC-MM-06: Handles non-matching pair by locking board until resolved', () => {
    const state = createInitialState(4);
    const firstCard = state.cards[0];
    const nonMatchingCard = state.cards.find(c => c.pairKey !== firstCard.pairKey);

    const { nextState: state1 } = handleCardSelection(state, firstCard.id);
    const { nextState: state2, actionRequired } = handleCardSelection(state1, nonMatchingCard.id);

    expect(actionRequired).toBe('MISMATCH_PENDING');
    expect(state2.isLocked).toBe(true); // Locked!
    expect(state2.selectedCardIds).toHaveLength(2);
    expect(state2.turnsTaken).toBe(1);

    // Attempting to select a 3rd card while locked MUST be blocked
    const thirdCard = state.cards.find(
      c => c.id !== firstCard.id && c.id !== nonMatchingCard.id
    );
    const { nextState: stateBlocked } = handleCardSelection(state2, thirdCard.id);
    expect(stateBlocked.selectedCardIds).toHaveLength(2);

    // Resolving mismatch unlocks board and turns cards down
    const resolvedState = resolveMismatch(state2);
    expect(resolvedState.isLocked).toBe(false);
    expect(resolvedState.selectedCardIds).toEqual([]);
    const c1 = resolvedState.cards.find(c => c.id === firstCard.id);
    const c2 = resolvedState.cards.find(c => c.id === nonMatchingCard.id);
    expect(c1.isFlipped).toBe(false);
    expect(c2.isFlipped).toBe(false);
  });

  it('TC-MM-07: Prevents selecting already matched cards', () => {
    const state = createInitialState(4);
    const firstCard = state.cards[0];
    const matchingPartner = state.cards.find(
      c => c.pairKey === firstCard.pairKey && c.id !== firstCard.id
    );

    const { nextState: state1 } = handleCardSelection(state, firstCard.id);
    const { nextState: matchedState } = handleCardSelection(state1, matchingPartner.id);

    // Try selecting the matched card again
    const { nextState: stateTry, actionRequired } = handleCardSelection(matchedState, firstCard.id);
    expect(actionRequired).toBeNull();
    expect(stateTry.selectedCardIds).toEqual([]);
  });

  it('TC-MM-08: Reliably detects game completion when all pairs matched', () => {
    let state = createInitialState(2); // 2 pairs (4 cards) for quick win verification
    const distinctPairs = [...new Set(state.cards.map(c => c.pairKey))];

    distinctPairs.forEach(pairKey => {
      const pairCards = state.cards.filter(c => c.pairKey === pairKey);
      const res1 = handleCardSelection(state, pairCards[0].id);
      const res2 = handleCardSelection(res1.nextState, pairCards[1].id);
      state = res2.nextState;
    });

    expect(state.pairsMatched).toBe(2);
    expect(state.isComplete).toBe(true);
    expect(state.completedAt).toBeDefined();
    expect(state.durationSeconds).toBeGreaterThanOrEqual(1);

    // Further clicks after completion are rejected
    const { nextState: postWinState } = handleCardSelection(state, state.cards[0].id);
    expect(postWinState.isComplete).toBe(true);
  });

  it('TC-MM-09: Hint highlights an unmatched pair without corrupting state', () => {
    const state = createInitialState(4);
    const hintedState = triggerHint(state);

    expect(hintedState.hintsUsed).toBe(1);
    const hintedCards = hintedState.cards.filter(c => c.isHinted);
    expect(hintedCards).toHaveLength(2);
    expect(hintedCards[0].pairKey).toBe(hintedCards[1].pairKey);
  });
});
