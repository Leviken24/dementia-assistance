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
import { GameControlsBar } from '../../components/common/GameControlsBar.jsx';

export function WordMatchView({ onComplete, onExit }) {
  const [state, setState] = useState(() => createInitialWordState());
  const nextQuestionTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (nextQuestionTimerRef.current) {
        clearTimeout(nextQuestionTimerRef.current);
      }
    };
  }, []);

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
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* 1. Unified Game Controls Bar */}
      <GameControlsBar
        title="Word Match"
        status={`Question ${state.currentIndex + 1} / ${state.totalQuestions}`}
        onRestart={handleRestart}
        onLeave={onExit}
        isGameActive={!state.isComplete}
        secondaryAction={
          <div style={{ display: 'flex', gap: '6px' }}>
            <BigButton
              variant="gentle"
              size="sm"
              onClick={handleHint}
              disabled={state.isComplete || currentQ?.isSolved}
              icon={<AccessibleIcon name="lightbulb" size={16} />}
              ariaLabel="Need a hint for word match?"
            >
              Hint
            </BigButton>
            <BigButton
              variant="secondary"
              size="sm"
              onClick={handleSkip}
              disabled={state.isComplete}
              ariaLabel="Skip to next word"
            >
              Skip
            </BigButton>
          </div>
        }
      />

      {/* 2. Feedback Message */}
      <div
        role="status"
        aria-live="polite"
        className="card-base"
        style={{
          padding: '12px 18px',
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: 'var(--font-sm)',
          fontWeight: '600',
          color: currentQ?.isSolved ? 'var(--success-color)' : 'var(--text-secondary)'
        }}
      >
        {state.feedbackMessage}
      </div>

      {/* 3. Center Target Picture Card */}
      {currentQ && (
        <div
          className="card-base"
          style={{
            padding: '24px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '700' }}>
            LOOK AT THIS FAMILIAR PICTURE:
          </span>

          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AccessibleIcon name={currentQ.iconType} size={48} />
          </div>

          <p
            style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--text-secondary)',
              margin: '4px 0 0 0',
              textAlign: 'center'
            }}
          >
            {currentQ.promptDescription}
          </p>
        </div>
      )}

      {/* 4. Word Choices Grid */}
      {currentQ && (
        <div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
            CHOOSE THE MATCHING WORD:
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}
          >
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentQ.isSolved && opt.word === currentQ.targetWord;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectWord(opt.word)}
                  disabled={currentQ.isSolved}
                  aria-label={`Choice: ${opt.word}`}
                  style={{
                    minHeight: '64px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: opt.isHinted
                      ? '2px solid #F59E0B'
                      : isSelected
                      ? '2px solid var(--success-border)'
                      : '1px solid var(--border-color)',
                    backgroundColor: isSelected
                      ? 'var(--success-soft)'
                      : opt.isHinted
                      ? 'var(--accent-soft)'
                      : 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: opt.isHinted ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'var(--shadow-sm)',
                    cursor: currentQ.isSolved ? 'default' : 'pointer',
                    transition: 'all var(--transition-speed) ease'
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--font-base)',
                      fontWeight: '700',
                      color: isSelected ? 'var(--success-color)' : 'var(--text-primary)'
                    }}
                  >
                    {opt.word}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: '700' }}>
                      ✓ Match
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
