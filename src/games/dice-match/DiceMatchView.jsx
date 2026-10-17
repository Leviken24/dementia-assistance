import React, { useState, useEffect, useRef } from 'react';
import {
  createInitialDiceState,
  evaluateDiceGuess,
  advanceToNextDiceRound,
  triggerDiceHint
} from './diceMatchEngine.js';
import { DieFace } from '../../components/common/DieFace.jsx';
import { BigButton } from '../../components/common/BigButton.jsx';
import { AccessibleIcon } from '../../components/common/AccessibleIcons.jsx';

export function DiceMatchView({ onComplete, onExit }) {
  const [state, setState] = useState(() => createInitialDiceState());
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const roundAdvanceTimerRef = useRef(null);

  // Clear timer when unmounting
  useEffect(() => {
    return () => {
      if (roundAdvanceTimerRef.current) {
        clearTimeout(roundAdvanceTimerRef.current);
      }
    };
  }, []);

  // When game completes, signal parent after gentle pause
  useEffect(() => {
    if (state.isComplete) {
      const timer = setTimeout(() => {
        onComplete({
          gameId: 'dice-match',
          durationSeconds: state.durationSeconds,
          turnsTaken: state.attemptsCount,
          hintsUsed: state.hintsUsed,
          completed: true
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.isComplete, state.durationSeconds, state.attemptsCount, state.hintsUsed, onComplete]);

  const handleSelectOption = number => {
    if (state.isComplete || state.currentRound.isRoundSolved) return;

    const nextState = evaluateDiceGuess(state, number);
    setState(nextState);

    // If correct and not complete, schedule gentle advance to next round after 900ms
    if (nextState.currentRound.isRoundSolved && !nextState.isComplete) {
      if (roundAdvanceTimerRef.current) {
        clearTimeout(roundAdvanceTimerRef.current);
      }
      roundAdvanceTimerRef.current = setTimeout(() => {
        setState(curr => advanceToNextDiceRound(curr));
        roundAdvanceTimerRef.current = null;
      }, 900);
    }
  };

  const handleRestart = () => {
    if (roundAdvanceTimerRef.current) {
      clearTimeout(roundAdvanceTimerRef.current);
      roundAdvanceTimerRef.current = null;
    }
    setState(createInitialDiceState());
    setShowRestartConfirm(false);
  };

  const handleHint = () => {
    if (state.isComplete || state.currentRound.isRoundSolved) return;
    setState(current => triggerDiceHint(current));
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '10px 0' }}>
      {/* Top Banner: Round Tracker */}
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
            Gentle Dice Match
          </div>
          <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
            Round <strong>{state.roundNumber} of {state.totalRounds}</strong>
          </div>
        </div>

        <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
          Correct matches: <strong>{state.correctCount}</strong>
        </div>
      </div>

      {/* Live Feedback / Instruction Message */}
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: 'center',
          padding: '14px 18px',
          backgroundColor: state.currentRound.isRoundSolved ? 'var(--success-soft)' : 'var(--bg-surface-elevated)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          fontSize: 'var(--font-base)',
          color: state.currentRound.isRoundSolved ? 'var(--success-color)' : 'var(--text-primary)',
          fontWeight: 'bold',
          marginBottom: '28px',
          lineHeight: '1.4'
        }}
      >
        {state.feedbackMessage}
      </div>

      {/* Center Display: Large Die Face */}
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
        <DieFace value={state.currentRound.dieValue} size={120} />
      </div>

      {/* Numerical Option Cards (3 Large Buttons) */}
      <section aria-label="Number Options" style={{ marginBottom: '32px' }}>
        <h4
          style={{
            fontSize: 'var(--font-h3)',
            color: 'var(--text-primary)',
            marginBottom: '16px',
            textAlign: 'center'
          }}
        >
          Choose the matching number of dots:
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}
        >
          {state.currentRound.options.map(number => {
            const isSelected = state.currentRound.selectedOption === number;
            const isTarget = number === state.currentRound.dieValue;

            return (
              <button
                key={number}
                onClick={() => handleSelectOption(number)}
                disabled={state.currentRound.isRoundSolved || state.isComplete}
                aria-label={`Option ${number} dots`}
                style={{
                  minHeight: '76px',
                  borderRadius: '16px',
                  border: isSelected && isTarget
                    ? '4px solid var(--success-color)'
                    : '3px solid var(--border-color)',
                  backgroundColor: isSelected && isTarget
                    ? 'var(--success-soft)'
                    : 'var(--bg-surface)',
                  color: isSelected && isTarget
                    ? 'var(--success-color)'
                    : 'var(--text-primary)',
                  fontSize: 'var(--font-h1)',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: state.currentRound.isRoundSolved ? 'default' : 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease'
                }}
              >
                {number}
              </button>
            );
          })}
        </div>
      </section>

      {/* Action Controls: Hint, Restart */}
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
          disabled={state.currentRound.isRoundSolved || state.isComplete}
          icon={<AccessibleIcon name="lightbulb" size={24} />}
          ariaLabel="Need a hint? Help counting the dots"
        >
          Need a Hint?
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => setShowRestartConfirm(true)}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Restart dice match activity"
        >
          Restart
        </BigButton>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-dice-title"
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
            <h3 id="restart-dice-title" style={{ fontSize: 'var(--font-h2)', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Restart this dice activity?
            </h3>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Would you like to start over from Round 1?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" onClick={() => setShowRestartConfirm(false)}>
                Keep Playing
              </BigButton>
              <BigButton variant="primary" onClick={handleRestart}>
                Yes, Start Over
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
