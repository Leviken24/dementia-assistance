import React, { useState, useEffect, useRef } from 'react';
import {
  createInitialWordState,
  submitWordAnswer,
  advanceToNextWordQuestion,
  triggerWordHint,
  skipWordQuestion
} from './wordMatchEngine.js';
import { AccessibleIcon } from '../../components/common/AccessibleIcons.jsx';
import { BigButton } from '../../components/common/BigButton.jsx';

export function WordMatchView({ onComplete, onExit }) {
  const [state, setState] = useState(() => createInitialWordState());
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const nextQuestionTimerRef = useRef(null);

  // Clear timer when unmounting
  useEffect(() => {
    return () => {
      if (nextQuestionTimerRef.current) {
        clearTimeout(nextQuestionTimerRef.current);
      }
    };
  }, []);

  // When game completes, signal parent after gentle pause
  useEffect(() => {
    if (state.isComplete) {
      const timer = setTimeout(() => {
        onComplete({
          gameId: 'word-match',
          durationSeconds: state.durationSeconds,
          turnsTaken: state.attemptsCount,
          hintsUsed: state.hintsUsed,
          completed: true
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.isComplete, state.durationSeconds, state.attemptsCount, state.hintsUsed, onComplete]);

  const handleSelectWord = word => {
    if (state.isComplete || !state.currentQuestion || state.currentQuestion.isSolved) return;

    const nextState = submitWordAnswer(state, word);
    setState(nextState);

    // If correct and not complete, schedule gentle advance to next question after 900ms
    if (nextState.currentQuestion && nextState.currentQuestion.isSolved && !nextState.isComplete) {
      if (nextQuestionTimerRef.current) {
        clearTimeout(nextQuestionTimerRef.current);
      }
      nextQuestionTimerRef.current = setTimeout(() => {
        setState(curr => advanceToNextWordQuestion(curr));
        nextQuestionTimerRef.current = null;
      }, 900);
    }
  };

  const handleRestart = () => {
    if (nextQuestionTimerRef.current) {
      clearTimeout(nextQuestionTimerRef.current);
      nextQuestionTimerRef.current = null;
    }
    setState(createInitialWordState());
    setShowRestartConfirm(false);
  };

  const handleHint = () => {
    if (state.isComplete || !state.currentQuestion || state.currentQuestion.isSolved) return;
    setState(current => triggerWordHint(current));
  };

  const handleSkip = () => {
    if (state.isComplete || !state.currentQuestion) return;
    if (nextQuestionTimerRef.current) {
      clearTimeout(nextQuestionTimerRef.current);
      nextQuestionTimerRef.current = null;
    }
    setState(current => skipWordQuestion(current));
  };

  const currentQ = state.currentQuestion;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '10px 0' }}>
      {/* Top Banner: Progress */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '12px',
          border: '2px solid var(--border-color)'
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-h3)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Word & Picture Match
          </div>
          <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
            Picture <strong>{state.currentIndex + 1} of {state.totalQuestions}</strong>
          </div>
        </div>

        <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
          Correct: <strong>{state.correctCount}</strong>
        </div>
      </div>

      {/* Live Feedback / Instruction Message */}
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: 'center',
          padding: '14px 18px',
          backgroundColor: currentQ && currentQ.isSolved ? 'var(--success-soft)' : 'var(--bg-surface-elevated)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          fontSize: 'var(--font-base)',
          color: currentQ && currentQ.isSolved ? 'var(--success-color)' : 'var(--text-primary)',
          fontWeight: 'bold',
          marginBottom: '28px',
          lineHeight: '1.4'
        }}
      >
        {state.feedbackMessage}
      </div>

      {/* Center Display: Picture Card */}
      {currentQ && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '20px',
            border: '3px solid var(--border-color)',
            marginBottom: '32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}
        >
          <div style={{ color: 'var(--accent-color)', marginBottom: '12px' }}>
            <AccessibleIcon name={currentQ.iconType} size={72} />
          </div>
          <span style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
            What is this lovely picture?
          </span>
        </div>
      )}

      {/* Word Option Cards (3 Large Buttons) */}
      {currentQ && (
        <section aria-label="Word Choices" style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}
          >
            {currentQ.options.map(word => {
              const isSelected = currentQ.selectedWord === word;
              const isCorrect = word.toLowerCase() === currentQ.correctWord.toLowerCase();

              return (
                <button
                  key={word}
                  onClick={() => handleSelectWord(word)}
                  disabled={currentQ.isSolved || state.isComplete}
                  aria-label={`Option: ${word}`}
                  style={{
                    minHeight: '70px',
                    borderRadius: '16px',
                    border: isSelected && isCorrect
                      ? '4px solid var(--success-color)'
                      : '3px solid var(--border-color)',
                    backgroundColor: isSelected && isCorrect
                      ? 'var(--success-soft)'
                      : 'var(--bg-surface)',
                    color: isSelected && isCorrect
                      ? 'var(--success-color)'
                      : 'var(--text-primary)',
                    fontSize: 'var(--font-h3)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    textAlign: 'center',
                    cursor: currentQ.isSolved ? 'default' : 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease'
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Action Controls: Hint, Skip, Restart */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        <BigButton
          variant="gentle"
          onClick={handleHint}
          disabled={!currentQ || currentQ.isSolved || state.isComplete}
          icon={<AccessibleIcon name="lightbulb" size={24} />}
          ariaLabel="Need a hint? Read a gentle clue"
        >
          Need a Hint?
        </BigButton>

        <BigButton
          variant="outline"
          onClick={handleSkip}
          disabled={state.isComplete}
          ariaLabel="Skip to next picture without penalty"
        >
          Skip Picture
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => setShowRestartConfirm(true)}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Restart word match puzzle"
        >
          Restart
        </BigButton>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-word-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '3px solid var(--border-color)',
              padding: '28px',
              maxWidth: '480px',
              width: '100%'
            }}
          >
            <h3 id="restart-word-title" style={{ fontSize: 'var(--font-h2)', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Restart word puzzle?
            </h3>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Would you like to start fresh from Picture 1?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" onClick={() => setShowRestartConfirm(false)}>
                Keep Playing
              </BigButton>
              <BigButton variant="primary" onClick={handleRestart}>
                Yes, Start Fresh
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
