import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  handleCardSelection,
  resolveMismatch
} from '../src/games/memory-match/memoryMatchEngine.js';
import {
  initSequenceGame,
  selectCard,
  placeCardInSlot,
  removeCardFromSlot,
  evaluateSequence
} from '../src/games/picture-sequence/pictureSequenceEngine.js';
import { storageService } from '../src/services/storageService.js';

describe('Phase 1 Stability & Edge-Case Audit Tests', () => {
  describe('Memory Match Concurrency & Edge Cases', () => {
    it('AUDIT-MM-01: Rapid clicks during mismatch evaluation are strictly discarded', () => {
      const state = createInitialState(4);
      const cardA = state.cards[0];
      const cardB = state.cards.find(c => c.pairKey !== cardA.pairKey);
      const cardC = state.cards.find(c => c.id !== cardA.id && c.id !== cardB.id);

      // Select A and B (mismatch)
      const res1 = handleCardSelection(state, cardA.id);
      const res2 = handleCardSelection(res1.nextState, cardB.id);

      expect(res2.nextState.isLocked).toBe(true);

      // Rapidly fire clicks on card C while locked
      const res3 = handleCardSelection(res2.nextState, cardC.id);
      const res4 = handleCardSelection(res3.nextState, cardC.id);

      // State must not have added card C
      expect(res4.nextState.selectedCardIds).toEqual([cardA.id, cardB.id]);
      expect(res4.actionRequired).toBeNull();

      // Resolve mismatch unlocks
      const resolved = resolveMismatch(res4.nextState);
      expect(resolved.isLocked).toBe(false);
      expect(resolved.selectedCardIds).toEqual([]);
    });

    it('AUDIT-MM-02: Self-matching attempt does not count as a turn or match', () => {
      const state = createInitialState(4);
      const cardA = state.cards[0];

      const res1 = handleCardSelection(state, cardA.id);
      const res2 = handleCardSelection(res1.nextState, cardA.id);

      expect(res2.actionRequired).toBeNull();
      expect(res2.nextState.turnsTaken).toBe(0);
      expect(res2.nextState.pairsMatched).toBe(0);
      expect(res2.nextState.selectedCardIds).toEqual([cardA.id]);
    });

    it('AUDIT-MM-03: Already matched cards cannot be re-opened or matched', () => {
      const state = createInitialState(4);
      const cardA = state.cards[0];
      const cardPartner = state.cards.find(c => c.pairKey === cardA.pairKey && c.id !== cardA.id);

      // Match A and Partner
      const res1 = handleCardSelection(state, cardA.id);
      const res2 = handleCardSelection(res1.nextState, cardPartner.id);
      expect(res2.nextState.pairsMatched).toBe(1);

      // Click cardA again
      const res3 = handleCardSelection(res2.nextState, cardA.id);
      expect(res3.actionRequired).toBeNull();
      expect(res3.nextState.selectedCardIds).toEqual([]);
    });

    it('AUDIT-MM-04: Post-completion input is locked and does not mutate duration or turns', () => {
      let state = createInitialState(2);
      const pairs = [...new Set(state.cards.map(c => c.pairKey))];

      pairs.forEach(pk => {
        const matchingCards = state.cards.filter(c => c.pairKey === pk);
        const r1 = handleCardSelection(state, matchingCards[0].id);
        const r2 = handleCardSelection(r1.nextState, matchingCards[1].id);
        state = r2.nextState;
      });

      expect(state.isComplete).toBe(true);
      const finalTurns = state.turnsTaken;
      const finalDuration = state.durationSeconds;

      // Click again
      const postClick = handleCardSelection(state, state.cards[0].id);
      expect(postClick.nextState.turnsTaken).toBe(finalTurns);
      expect(postClick.nextState.durationSeconds).toBe(finalDuration);
      expect(postClick.actionRequired).toBeNull();
    });
  });

  describe('Picture Sequencing Edge Cases', () => {
    it('AUDIT-PS-01: Swapping cards between two slots works without losing or duplicating cards', () => {
      let state = initSequenceGame('story_plant_growth');
      const card1 = state.availableCards[0];
      const card2 = state.availableCards[1];

      // Place card1 into slot 0
      state = selectCard(state, card1.stepId);
      state = placeCardInSlot(state, 0);

      // Place card2 into slot 1
      state = selectCard(state, card2.stepId);
      state = placeCardInSlot(state, 1);

      expect(state.slots[0].stepId).toBe(card1.stepId);
      expect(state.slots[1].stepId).toBe(card2.stepId);

      // Now move card1 from slot 0 to slot 1 (swap)
      state = selectCard(state, card1.stepId);
      state = placeCardInSlot(state, 1);

      expect(state.slots[1].stepId).toBe(card1.stepId);
      expect(state.slots[0].stepId).toBe(card2.stepId);

      // Total cards accounted for: 2 in slots, 2 in availableCards = 4
      expect(state.slots.filter(Boolean).length).toBe(2);
      expect(state.availableCards.length).toBe(2);
    });

    it('AUDIT-PS-02: Partial sequence submission provides encouraging guidance without crashing', () => {
      let state = initSequenceGame('story_plant_growth');
      const card1 = state.availableCards[0];

      state = selectCard(state, card1.stepId);
      state = placeCardInSlot(state, 0);

      // Only 1 slot filled, evaluate sequence
      const evaluated = evaluateSequence(state);
      expect(evaluated.isComplete).toBe(false);
      expect(evaluated.feedbackMessage).toBeTruthy();
    });
  });

  describe('Storage Resilience & Quota Management', () => {
    it('AUDIT-ST-01: Storage caps history to 50 items preventing unbounded growth', () => {
      for (let i = 0; i < 55; i++) {
        storageService.saveGameResult({
          gameId: 'memory-match',
          durationSeconds: i + 1,
          completed: true,
          turnsTaken: i
        });
      }

      const history = storageService.getGameHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });
  });
});
