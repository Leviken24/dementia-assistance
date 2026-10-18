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
import { GameControlsBar } from '../../components/common/GameControlsBar.jsx';

export function DiceMatchView({ onComplete, onExit }) {
  const [state, setState] = useState(() => createInitialDiceState());
  const roundAdvanceTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (roundAdvanceTimerRef.current) {
        clearTimeout(roundAdvanceTimerRef.current);
      }
    };
  }, []);

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
  };

  const handleHint = () => {
    if (state.isComplete || state.currentRound.isRoundSolved) return;
    setState(current => triggerDiceHint(current));
  };

  const round = state.currentRound;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* 1. Unified Game Controls Bar */}
      <GameControlsBar
        title="Dice Match"
        status={`Round ${state.roundNumber} / ${state.totalRounds}`}
        onRestart={handleRestart}
        onLeave={onExit}
        isGameActive={!state.isComplete}
        secondaryAction={
          <BigButton
            variant="gentle"
            size="sm"
            onClick={handleHint}
            disabled={state.isComplete || round.isRoundSolved}
            icon={<AccessibleIcon name="lightbulb" size={16} />}
            ariaLabel="Need a hint for dice match?"
          >
            Hint
          </BigButton>
        }
      />

      {/* 2. Instructions / Feedback Banner */}
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
          color: round.isRoundSolved ? 'var(--success-color)' : 'var(--text-secondary)'
        }}
      >
        {state.feedbackMessage}
      </div>

      {/* 3. Center Target Die Display */}
      <div
        className="card-base"
        style={{
          padding: '24px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '700' }}>
          COUNT THE DOTS:
        </span>

        <DieFace value={round.targetNumber} size={84} />
      </div>

      {/* 4. Number Options Grid */}
      <div>
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
          CHOOSE THE MATCHING NUMBER:
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}
        >
          {round.options.map((opt, idx) => {
            const isSolved = round.isRoundSolved && opt.number === round.targetNumber;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt.number)}
                disabled={round.isRoundSolved}
                aria-label={`Option: number ${opt.number}, ${opt.label}`}
                style={{
                  minHeight: '88px',
                  borderRadius: 'var(--radius-lg)',
                  border: opt.isHinted
                    ? '3px solid #F59E0B'
                    : isSolved
                    ? '2px solid var(--success-border)'
                    : '1px solid var(--border-color)',
                  backgroundColor: isSolved
                    ? 'var(--success-soft)'
                    : opt.isHinted
                    ? 'var(--accent-soft)'
                    : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: opt.isHinted ? '0 0 12px rgba(245, 158, 11, 0.4)' : 'var(--shadow-sm)',
                  cursor: round.isRoundSolved ? 'default' : 'pointer',
                  transition: 'all var(--transition-speed) ease'
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-h1)',
                    fontWeight: '800',
                    color: isSolved ? 'var(--success-color)' : 'var(--text-primary)',
                    lineHeight: '1'
                  }}
                >
                  {opt.number}
                </span>

                <span
                  style={{
                    fontSize: 'var(--font-xs)',
                    color: 'var(--text-secondary)',
                    fontWeight: '600'
                  }}
                >
                  {opt.label}
                </span>

                {isSolved && (
                  <span style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: '700' }}>
                    ✓ Match
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
