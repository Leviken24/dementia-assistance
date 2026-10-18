import React, { useState, useEffect, useRef } from 'react';
import {
  createInitialPathState,
  advancePath,
  resetPathGame
} from './numberPathEngine.js';
import { GARDEN_PATH_MILESTONES, TOTAL_PATH_STONES } from '../../data/pathMilestones.js';
import { AccessibleIcon } from '../../components/common/AccessibleIcons.jsx';
import { BigButton } from '../../components/common/BigButton.jsx';
import { DieFace } from '../../components/common/DieFace.jsx';
import { GameControlsBar } from '../../components/common/GameControlsBar.jsx';

export function NumberPathView({ onComplete, onExit }) {
  const [state, setState] = useState(() => createInitialPathState());
  const [isRolling, setIsRolling] = useState(false);
  const rollTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) {
        clearTimeout(rollTimerRef.current);
      }
    };
  }, []);

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
  };

  const stones = Array.from({ length: TOTAL_PATH_STONES }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* 1. Unified Game Controls Bar */}
      <GameControlsBar
        title="Garden Path"
        status={`Stone ${state.currentPosition} / ${TOTAL_PATH_STONES}`}
        onRestart={handleRestart}
        onLeave={onExit}
        isGameActive={!state.isComplete}
        secondaryAction={
          state.lastRoll ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>
                Rolled:
              </span>
              <DieFace value={state.lastRoll} size={32} />
            </div>
          ) : null
        }
      />

      {/* 2. Narrative Guidance & Step Information */}
      <div
        className="card-base"
        style={{
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-primary)' }}>
            {state.statusNarrative}
          </div>
          {state.currentMilestone && (
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--success-color)', fontWeight: '600', marginTop: '2px' }}>
              🌿 Milestone: {state.currentMilestone.title} — {state.currentMilestone.description}
            </div>
          )}
        </div>

        {/* Primary Roll Action */}
        <BigButton
          variant="primary"
          size="md"
          onClick={handleRoll}
          disabled={state.isComplete || isRolling}
          icon={<AccessibleIcon name="star" size={20} />}
          ariaLabel="Roll the wooden die to advance along the path"
        >
          {isRolling ? 'Rolling Die...' : 'Roll Wooden Die'}
        </BigButton>
      </div>

      {/* 3. Stepping Stones Path Grid */}
      <div
        className="card-base"
        role="region"
        aria-label="Garden path stepping stones grid"
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
            gap: '8px'
          }}
        >
          {stones.map(num => {
            const isCurrent = state.currentPosition === num;
            const isPassed = state.currentPosition > num;
            const milestone = GARDEN_PATH_MILESTONES[num];

            return (
              <div
                key={num}
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent
                    ? '2px solid var(--accent-color)'
                    : isPassed
                    ? '1px solid var(--success-border)'
                    : '1px solid var(--border-color)',
                  backgroundColor: isCurrent
                    ? 'var(--accent-soft)'
                    : isPassed
                    ? 'var(--success-soft)'
                    : 'var(--bg-surface-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  boxShadow: isCurrent ? 'var(--shadow-md)' : 'none',
                  transition: 'all var(--transition-speed) ease'
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-xs)',
                    fontWeight: isCurrent ? '800' : '600',
                    color: isCurrent
                      ? 'var(--accent-color)'
                      : isPassed
                      ? 'var(--success-color)'
                      : 'var(--text-muted)'
                  }}
                >
                  {num}
                </span>

                {isCurrent && (
                  <div style={{ color: 'var(--accent-color)', marginTop: '2px' }} aria-label="You are here">
                    <AccessibleIcon name="flower" size={20} />
                  </div>
                )}

                {milestone && !isCurrent && (
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }} title={milestone.title}>
                    <AccessibleIcon name={milestone.icon} size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
