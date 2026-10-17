import { describe, it, expect } from 'vitest';
import {
  createInitialWordState,
  submitWordAnswer,
  advanceToNextWordQuestion,
  triggerWordHint,
  skipWordQuestion
} from '../src/games/word-match/wordMatchEngine.js';

const mockPool = [
  { id: 'w1', correctWord: 'Lotus Flower', iconType: 'flower', hint: 'Pond flower', distractors: ['Teacup', 'Hill'] },
  { id: 'w2', correctWord: 'Warm Teacup', iconType: 'cup', hint: 'Morning drink', distractors: ['Bird', 'Leaf'] },
  { id: 'w3', correctWord: 'Songbird', iconType: 'bird', hint: 'Feathered friend', distractors: ['Sun', 'Fish'] },
  { id: 'w4', correctWord: 'River Fish', iconType: 'fish', hint: 'Swims in stream', distractors: ['Bamboo', 'Pond'] },
  { id: 'w5', correctWord: 'Golden Sun', iconType: 'sun', hint: 'Morning light', distractors: ['Moon', 'Cloud'] }
];

describe('Word Match Puzzle Engine - Automated Unit Tests', () => {
  it('TC-WM-01: Initializes 5 questions with 3 options each', () => {
    const state = createInitialWordState(mockPool);
    expect(state.totalQuestions).toBe(5);
    expect(state.currentIndex).toBe(0);
    expect(state.currentQuestion.options).toHaveLength(3);
    expect(state.currentQuestion.options).toContain(state.currentQuestion.correctWord);
    expect(state.isComplete).toBe(false);
  });

  it('TC-WM-02: Handles case-insensitive and whitespace-padded correct submissions', () => {
    const state = createInitialWordState(mockPool);
    const target = state.currentQuestion.correctWord;

    // Test with mixed casing and spaces: "  lOtUs fLoWeR  "
    const padded = `  ${target.toLowerCase()}  `;
    const nextState = submitWordAnswer(state, padded);

    expect(nextState.correctCount).toBe(1);
    expect(nextState.currentQuestion.isSolved).toBe(true);
    expect(nextState.feedbackMessage).toContain('Correct');
  });

  it('TC-WM-03: Rejects empty or whitespace-only submissions safely without crashing', () => {
    const state = createInitialWordState(mockPool);

    const res1 = submitWordAnswer(state, '');
    expect(res1.feedbackMessage).toContain('Please tap one');
    expect(res1.attemptsCount).toBe(0);

    const res2 = submitWordAnswer(state, '    ');
    expect(res2.feedbackMessage).toContain('Please tap one');
    expect(res2.attemptsCount).toBe(0);
  });

  it('TC-WM-04: Provides respectful feedback on incorrect answers without shaming', () => {
    const state = createInitialWordState(mockPool);
    const wrongWord = state.currentQuestion.options.find(
      w => w.toLowerCase() !== state.currentQuestion.correctWord.toLowerCase()
    );

    const nextState = submitWordAnswer(state, wrongWord);
    expect(nextState.correctCount).toBe(0);
    expect(nextState.currentQuestion.isSolved).toBe(false);
    expect(nextState.attemptsCount).toBe(1);
    expect(nextState.feedbackMessage).toContain('Not quite');

    // Player can retry and succeed
    const retryState = submitWordAnswer(nextState, nextState.currentQuestion.correctWord);
    expect(retryState.correctCount).toBe(1);
    expect(retryState.currentQuestion.isSolved).toBe(true);
  });

  it('TC-WM-05: Advances cleanly through questions to completion', () => {
    let state = createInitialWordState(mockPool);

    for (let i = 0; i < 5; i++) {
      const target = state.currentQuestion.correctWord;
      state = submitWordAnswer(state, target);
      if (i < 4) {
        state = advanceToNextWordQuestion(state);
      }
    }

    expect(state.correctCount).toBe(5);
    expect(state.isComplete).toBe(true);
    expect(state.completedAt).toBeDefined();
    expect(state.durationSeconds).toBeGreaterThanOrEqual(1);
  });

  it('TC-WM-06: Hint reveals helpful clue without penalty', () => {
    const state = createInitialWordState(mockPool);
    const hintedState = triggerWordHint(state);

    expect(hintedState.hintsUsed).toBe(1);
    expect(hintedState.currentQuestion.hintShown).toBe(true);
    expect(hintedState.feedbackMessage).toContain(state.currentQuestion.hintText);
  });

  it('TC-WM-07: Skip advances to next question gracefully', () => {
    const state = createInitialWordState(mockPool);
    const skippedState = skipWordQuestion(state);

    expect(skippedState.currentIndex).toBe(1);
    expect(skippedState.currentQuestion.itemId).toBe(skippedState.questions[1].itemId);
  });
});
