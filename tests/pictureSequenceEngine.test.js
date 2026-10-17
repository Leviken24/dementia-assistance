import { describe, it, expect } from 'vitest';
import {
  initSequenceGame,
  selectCard,
  placeCardInSlot,
  removeCardFromSlot,
  evaluateSequence,
  triggerSequenceHint
} from '../src/games/picture-sequence/pictureSequenceEngine.js';

describe('Picture Sequencing Engine - Automated Unit Tests', () => {
  it('TC-PS-01: Initializes game with shuffled cards and empty slots', () => {
    const state = initSequenceGame('story_plant_growth');
    expect(state.totalSteps).toBe(4);
    expect(state.slots).toHaveLength(4);
    expect(state.slots.every(s => s === null)).toBe(true);
    expect(state.availableCards).toHaveLength(4);
    expect(state.isComplete).toBe(false);
  });

  it('TC-PS-02: Selects a card and places it into an open slot', () => {
    let state = initSequenceGame('story_plant_growth');
    const firstCard = state.availableCards[0];

    state = selectCard(state, firstCard.stepId);
    expect(state.selectedCardId).toBe(firstCard.stepId);

    // Place into slot 0
    state = placeCardInSlot(state, 0);
    expect(state.slots[0]).toEqual(firstCard);
    expect(state.availableCards).toHaveLength(3);
    expect(state.selectedCardId).toBeNull();
  });

  it('TC-PS-03: Removes a placed card from a slot back to the available pool', () => {
    let state = initSequenceGame('story_plant_growth');
    const firstCard = state.availableCards[0];

    state = selectCard(state, firstCard.stepId);
    state = placeCardInSlot(state, 1);
    expect(state.slots[1]).toBeDefined();

    // Remove from slot 1
    state = removeCardFromSlot(state, 1);
    expect(state.slots[1]).toBeNull();
    expect(state.availableCards).toHaveLength(4);
  });

  it('TC-PS-04: Rejects sequence evaluation if not all slots are filled', () => {
    let state = initSequenceGame('story_plant_growth');
    // Only place 1 card
    const firstCard = state.availableCards[0];
    state = selectCard(state, firstCard.stepId);
    state = placeCardInSlot(state, 0);

    const evaluated = evaluateSequence(state);
    expect(evaluated.isComplete).toBe(false);
    expect(evaluated.feedbackMessage).toContain('place all pictures');
  });

  it('TC-PS-05: Accurately evaluates correct sequence and triggers completion', () => {
    let state = initSequenceGame('story_plant_growth');

    // Place cards in perfect chronological order (1, 2, 3, 4)
    [1, 2, 3, 4].forEach((order, slotIndex) => {
      const card = state.availableCards.find(c => c.order === order);
      state = selectCard(state, card.stepId);
      state = placeCardInSlot(state, slotIndex);
    });

    const evaluated = evaluateSequence(state);
    expect(evaluated.isComplete).toBe(true);
    expect(evaluated.attemptsCount).toBe(1);
    expect(evaluated.completedAt).toBeDefined();
    expect(evaluated.durationSeconds).toBeGreaterThanOrEqual(1);
    expect(evaluated.feedbackMessage).toContain('perfect order');
  });

  it('TC-PS-06: Provides respectful feedback on incorrect sequence without shaming', () => {
    let state = initSequenceGame('story_plant_growth');

    // Place cards in intentionally reverse order (4, 3, 2, 1)
    [4, 3, 2, 1].forEach((order, slotIndex) => {
      const card = state.availableCards.find(c => c.order === order);
      state = selectCard(state, card.stepId);
      state = placeCardInSlot(state, slotIndex);
    });

    const evaluated = evaluateSequence(state);
    expect(evaluated.isComplete).toBe(false);
    expect(evaluated.attemptsCount).toBe(1);
    // Respectful encouragement
    expect(evaluated.feedbackMessage).toContain('Almost there');
  });

  it('TC-PS-07: Provides helpful hint indicating the correct card for the earliest mistake', () => {
    let state = initSequenceGame('story_plant_growth');
    const hintedState = triggerSequenceHint(state);

    expect(hintedState.hintsUsed).toBe(1);
    expect(hintedState.hintedCardId).toBeDefined();
    expect(hintedState.feedbackMessage).toContain('Box 1');
  });
});
