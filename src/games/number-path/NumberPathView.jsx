import React, { useState, useEffect } from 'react';
import {
  createInitialPathState,
  advancePath,
  resetPathGame
} from './numberPathEngine.js';
import { GARDEN_PATH_MILESTONES, TOTAL_PATH_STONES } from '../../data/pathMilestones.js';
import { AccessibleIcon } from '../../components/common/AccessibleIcons.jsx';
import { BigButton } from '../../components/common/BigButton.jsx';
import { DieFace } from '../../components/common/DieFace.jsx';

export function NumberPathView({ onComplete, onExit }) {
  const [state, setState] = useState(() => createInitialPathState());
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const rollTimerRef = useRef(null);

  // Clear timer when unmounting
  useEffect(() => {
    return () => {
      if (rollTimerRef.current) {
        clearTimeout(rollTimerRef.current);
      }
    };
  }, []);

  // When game completes, signal parent after gentle pause
  useEffect(() => {
    if (state.isComplete) {
      const timer = setTimeout(() => {
        onComplete({
          gameId: 'number-path',
          durationSeconds: state.durationSeconds,
          turnsTaken: state.turnsCount,
          completed: true
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.isComplete, state.durationSeconds, state.turnsCount, onComplete]);

  const handleRoll = () => {
    if (state.isComplete || isRolling) return;
    setIsRolling(true);
    setState(current => advancePath(current));

    rollTimerRef.current = setTimeout(() => {
      setIsRolling(false);
      rollTimerRef.current = null;
    }, 600);
  };

  const handleRestart = () => {
    if (rollTimerRef.current) {
      clearTimeout(rollTimerRef.current);
      rollTimerRef.current = null;
    }
    setIsRolling(false);
    setState(resetPathGame());
    setShowRestartConfirm(false);
  };

  // Generate stone array 1 to 20
  const stones = Array.from({ length: TOTAL_PATH_STONES }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '10px 0' }}>
      {/* Top Banner: Objectives & Progress */}
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
            Gentle Garden Path
          </div>
          <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
            Progress: <strong>Stone {state.currentPosition} of {TOTAL_PATH_STONES}</strong>
          </div>
        </div>

        {state.lastRoll && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>Last Roll:</span>
            <DieFace value={state.lastRoll} size={44} />
          </div>
        )}
      </div>

      {/* Live Narrative Status Message */}
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: 'center',
          padding: '14px 18px',
          backgroundColor: state.isComplete ? 'var(--success-soft)' : 'var(--bg-surface-elevated)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          fontSize: 'var(--font-base)',
          color: state.isComplete ? 'var(--success-color)' : 'var(--text-primary)',
          fontWeight: 'bold',
          marginBottom: '24px',
          lineHeight: '1.4'
        }}
      >
        {state.milestoneMessage}
      </div>

      {/* Stepping Stones Board Grid (5 columns x 4 rows) */}
      <section aria-label="Garden Path Stepping Stones" style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px'
          }}
        >
          {stones.map(stoneNum => {
            const isCurrent = state.currentPosition === stoneNum;
            const isPassed = state.currentPosition > stoneNum;
            const milestone = GARDEN_PATH_MILESTONES[stoneNum];

            return (
              <div
                key={stoneNum}
                aria-current={isCurrent ? 'step' : undefined}
                style={{
                  minHeight: '105px',
                  borderRadius: '14px',
                  border: isCurrent
                    ? '4px solid var(--focus-ring)'
                    : isPassed
                    ? '2px solid var(--success-color)'
                    : '2px solid var(--border-color)',
                  backgroundColor: isCurrent
                    ? 'var(--accent-soft)'
                    : isPassed
                    ? 'var(--bg-surface-elevated)'
                    : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: isCurrent ? '0 0 16px rgba(0, 120, 215, 0.35)' : 'none',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease'
                }}
              >
                {/* Stone Number */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: isCurrent ? 'var(--accent-color)' : 'var(--text-secondary)'
                  }}
                >
                  {stoneNum}
                </div>

                {/* Milestone Icon or Step Icon */}
                {milestone ? (
                  <div style={{ color: 'var(--accent-color)', marginBottom: '4px' }}>
                    <AccessibleIcon name={milestone.icon} size={28} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: isPassed ? 'var(--success-color)' : 'var(--border-color)',
                      marginBottom: '6px'
                    }}
                  />
                )}

                {/* Current Player Indicator */}
                {isCurrent && (
                  <div
                    style={{
                      backgroundColor: 'var(--accent-color)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      marginTop: '4px'
                    }}
                  >
                    You are here
                  </div>
                )}

                {milestone && !isCurrent && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      lineHeight: '1.1'
                    }}
                  >
                    {milestone.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Action Controls: Roll Die, Restart */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        <BigButton
          variant="primary"
          onClick={handleRoll}
          disabled={state.isComplete || isRolling}
          icon={<AccessibleIcon name="sun" size={24} />}
          ariaLabel="Roll Die and step forward along the garden path"
        >
          {state.isComplete ? 'Path Completed!' : isRolling ? 'Stepping Forward...' : 'Roll Die (Step Forward)'}
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => setShowRestartConfirm(true)}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Restart walk from Garden Gate"
        >
          Restart Walk
        </BigButton>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-path-title"
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
            <h3 id="restart-path-title" style={{ fontSize: 'var(--font-h2)', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Restart your garden walk?
            </h3>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Would you like to return to the Garden Gate at Stone 1?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" onClick={() => setShowRestartConfirm(false)}>
                Keep Walking
              </BigButton>
              <BigButton variant="primary" onClick={handleRestart}>
                Yes, Return to Gate
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
