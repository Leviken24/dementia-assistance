/**
 * wordMatchEngine.js
 * Headless, deterministic state machine for the Word & Picture Match puzzle.
 * Handles whitespace-trimming, case-insensitivity, hints, and dignified feedback.
 */

import { WORD_PUZZLE_ITEMS } from '../../data/wordPuzzleData.js';
import { shuffleArray } from '../memory-match/memoryMatchEngine.js';

export const TOTAL_WORD_QUESTIONS = 5;

/**
 * Creates a single question object with shuffled options.
 * @param {Object} item - Item definition from WORD_PUZZLE_ITEMS
 * @returns {Object} Question state
 */
export function createWordQuestion(item) {
  const options = shuffleArray([item.correctWord, ...item.distractors]);
  return {
    itemId: item.id,
    correctWord: item.correctWord,
    iconType: item.iconType,
    hintText: item.hint,
    options,
    isSolved: false,
    selectedWord: null,
    hintShown: false
  };
}

/**
 * Initializes a new Word Match session.
 * @param {Array<Object>|null} customPool - Optional custom pool for testing
 * @returns {Object} Initial game state
 */
export function createInitialWordState(customPool = null) {
  const sourcePool = customPool || WORD_PUZZLE_ITEMS;
  const shuffledPool = shuffleArray(sourcePool);
  const selectedItems = shuffledPool.slice(0, Math.min(TOTAL_WORD_QUESTIONS, shuffledPool.length));

  const questions = selectedItems.map(item => createWordQuestion(item));

  return {
    currentIndex: 0,
    totalQuestions: questions.length,
    questions,
    currentQuestion: questions[0] || null,
    correctCount: 0,
    attemptsCount: 0,
    hintsUsed: 0,
    startedAt: null,
    completedAt: null,
    durationSeconds: 0,
    isComplete: false,
    feedbackMessage: 'What picture do you see? Tap the word below that matches.'
  };
}

/**
 * Submits an answer for the current word question.
 * Case-insensitive and whitespace-trimmed.
 * @param {Object} state - Current engine state
 * @param {string} submittedWord - Answer text
 * @returns {Object} Next engine state
 */
export function submitWordAnswer(state, submittedWord) {
  if (state.isComplete || !state.currentQuestion || state.currentQuestion.isSolved) {
    return state;
  }

  // Gracefully handle empty or whitespace-only input
  if (!submittedWord || typeof submittedWord !== 'string' || submittedWord.trim() === '') {
    return {
      ...state,
      feedbackMessage: 'Please tap one of the word cards below.'
    };
  }

  const startedAt = state.startedAt || Date.now();
  const attemptsCount = state.attemptsCount + 1;
  const cleanSubmission = submittedWord.trim().toLowerCase();
  const cleanTarget = state.currentQuestion.correctWord.trim().toLowerCase();

  const isMatch = cleanSubmission === cleanTarget;

  if (isMatch) {
    const correctCount = state.correctCount + 1;
    const isLastQuestion = state.currentIndex + 1 >= state.totalQuestions;
    const isComplete = isLastQuestion;
    const completedAt = isComplete ? Date.now() : null;
    const durationSeconds = isComplete
      ? Math.max(1, Math.round((completedAt - startedAt) / 1000))
      : 0;

    const updatedQuestion = {
      ...state.currentQuestion,
      isSolved: true,
      selectedWord: submittedWord.trim()
    };

    const updatedQuestions = [...state.questions];
    updatedQuestions[state.currentIndex] = updatedQuestion;

    return {
      ...state,
      startedAt,
      attemptsCount,
      correctCount,
      isComplete,
      completedAt,
      durationSeconds,
      questions: updatedQuestions,
      currentQuestion: updatedQuestion,
      feedbackMessage: isComplete
        ? `Wonderful! You correctly matched all ${state.totalQuestions} words!`
        : `Lovely! Correct, that is a ${state.currentQuestion.correctWord}.`
    };
  } else {
    return {
      ...state,
      startedAt,
      attemptsCount,
      feedbackMessage: 'Not quite. Take another gentle look at the picture, or tap Hint for help.'
    };
  }
}

/**
 * Advances to the next question in sequence.
 * @param {Object} state - Current engine state
 * @returns {Object} Next question state
 */
export function advanceToNextWordQuestion(state) {
  if (state.isComplete) return state;

  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.totalQuestions) {
    return {
      ...state,
      isComplete: true,
      completedAt: Date.now()
    };
  }

  return {
    ...state,
    currentIndex: nextIndex,
    currentQuestion: state.questions[nextIndex],
    feedbackMessage: `Picture ${nextIndex + 1} of ${state.totalQuestions}: What do you see?`
  };
}

/**
 * Triggers a gentle hint by revealing the item hint text.
 * @param {Object} state - Current engine state
 * @returns {Object} Next engine state with hint shown
 */
export function triggerWordHint(state) {
  if (state.isComplete || !state.currentQuestion || state.currentQuestion.isSolved) {
    return state;
  }

  const updatedQuestion = {
    ...state.currentQuestion,
    hintShown: true
  };

  return {
    ...state,
    hintsUsed: state.hintsUsed + 1,
    currentQuestion: updatedQuestion,
    feedbackMessage: `Hint: ${state.currentQuestion.hintText}`
  };
}

/**
 * Skips current question without penalty.
 * @param {Object} state - Current engine state
 * @returns {Object} Next engine state
 */
export function skipWordQuestion(state) {
  if (state.isComplete) return state;
  return advanceToNextWordQuestion(state);
}
