import React, { useState, useEffect, useRef } from 'react';
import {
  createInitialState,
  handleCardSelection,
  resolveMismatch,
  triggerHint
} from './memoryMatchEngine.js';
import { AccessibleIcon } from '../../components/common/AccessibleIcons.jsx';
import { BigButton } from '../../components/common/BigButton.jsx';
import { storageService } from '../../services/storageService.js';

export function MemoryMatchView({ onComplete, onExit }) {
  const initialPairCount =
    storageService.getUserPreferences()?.gamePreferences?.['memory-match']?.preferredPairCount || 4;
  const [pairCount, setPairCount] = useState(initialPairCount);
  const [state, setState] = useState(() => createInitialState(initialPairCount));
  const [statusMessage, setStatusMessage] = useState('Tap any card to turn it over.');
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Reference for mismatch delay timer to guarantee safe cleanup on restart or unmount
  const mismatchTimerRef = useRef(null);

  // Clear timer when unmounting
  useEffect(() => {
    return () => {
      if (mismatchTimerRef.current) {
        clearTimeout(mismatchTimerRef.current);
      }
    };
  }, []);

  // When game completes in engine, signal parent after gentle pause
  useEffect(() => {
    if (state.isComplete) {
      const timer = setTimeout(() => {
        onComplete({
          gameId: 'memory-match',
          durationSeconds: state.durationSeconds,
          turnsTaken: state.turnsTaken,
          pairsMatched: state.pairsMatched,
          hintsUsed: state.hintsUsed,
          completed: true
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.isComplete, state.durationSeconds, state.turnsTaken, state.pairsMatched, state.hintsUsed, onComplete]);

  const handleCardClick = cardId => {
    if (state.isLocked || state.isComplete) return;

    const { nextState, actionRequired } = handleCardSelection(state, cardId);
    setState(nextState);

    if (actionRequired === 'CARD_FLIPPED') {
      setStatusMessage('Now choose a second card to see if they match.');
    } else if (actionRequired === 'MATCH_FOUND') {
      setStatusMessage('Lovely! You found a matching pair.');
    } else if (actionRequired === 'MISMATCH_PENDING') {
      setStatusMessage('These two are different. They will turn back gently.');

      // Safely schedule mismatch resolution after 1200ms
      if (mismatchTimerRef.current) {
        clearTimeout(mismatchTimerRef.current);
      }
      mismatchTimerRef.current = setTimeout(() => {
        setState(current => resolveMismatch(current));
        setStatusMessage('Tap any card to try again.');
        mismatchTimerRef.current = null;
      }, 1200);
    }
  };

  const handleRestart = newPairCount => {
    if (mismatchTimerRef.current) {
      clearTimeout(mismatchTimerRef.current);
      mismatchTimerRef.current = null;
    }
    const count = newPairCount || pairCount;
    setPairCount(count);
    storageService.setPreferredPairCount(count);
    setState(createInitialState(count));
    setStatusMessage('Fresh cards dealt. Tap any card to begin.');
    setShowRestartConfirm(false);
  };

  const handleHint = () => {
    if (state.isLocked || state.isComplete) return;
    setState(current => triggerHint(current));
    setStatusMessage('Look at the highlighted cards with the glowing border.');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px 0' }}>
      {/* Top Game Bar: Instructions & Difficulty Selector */}
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
            Memory Match
          </div>
          <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>
            Pairs found: <strong>{state.pairsMatched} of {state.totalPairs}</strong>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>Cards:</span>
          <button
            onClick={() => handleRestart(4)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: pairCount === 4 ? '2px solid var(--focus-ring)' : '2px solid var(--border-color)',
              backgroundColor: pairCount === 4 ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontWeight: pairCount === 4 ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            8 Cards (Gentle)
          </button>
          <button
            onClick={() => handleRestart(6)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: pairCount === 6 ? '2px solid var(--focus-ring)' : '2px solid var(--border-color)',
              backgroundColor: pairCount === 6 ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontWeight: pairCount === 6 ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            12 Cards (Standard)
          </button>
        </div>
      </div>

      {/* Gentle Live Status Message */}
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: 'center',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          fontSize: 'var(--font-base)',
          color: 'var(--text-primary)',
          fontWeight: '500',
          marginBottom: '24px'
        }}
      >
        {statusMessage}
      </div>

      {/* Responsive Card Grid */}
      <div
        role="region"
        aria-label="Card Grid"
        className="memory-grid"
      >
        {state.cards.map((card, index) => {
          const isFaceUp = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={state.isLocked || card.isMatched}
              aria-label={`Card ${index + 1}: ${isFaceUp ? card.label : 'Face down'}${card.isMatched ? ', Matched' : ''}`}
              style={{
                aspectRatio: '3 / 4',
                minHeight: '110px',
                borderRadius: '14px',
                border: card.isHinted
                  ? '4px solid #FFD700'
                  : card.isMatched
                  ? '3px solid var(--success-color)'
                  : isFaceUp
                  ? '3px solid var(--accent-color)'
                  : '3px solid var(--border-color)',
                backgroundColor: isFaceUp ? 'var(--bg-surface)' : 'var(--card-back-bg)',
                color: isFaceUp ? 'var(--text-primary)' : 'var(--card-back-text)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 8px',
                textAlign: 'center',
                boxShadow: card.isHinted
                  ? '0 0 16px rgba(255, 215, 0, 0.6)'
                  : '0 4px 10px rgba(0,0,0,0.08)',
                cursor: card.isMatched || state.isLocked ? 'default' : 'pointer',
                transition: 'transform var(--transition-speed) ease, border-color var(--transition-speed) ease'
              }}
            >
              {isFaceUp ? (
                <>
                  <div style={{ color: card.isMatched ? 'var(--success-color)' : 'var(--accent-color)', marginBottom: '8px' }}>
                    <AccessibleIcon name={card.iconType} size={44} />
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--font-base)',
                      fontWeight: 'bold',
                      lineHeight: '1.2'
                    }}
                  >
                    {card.label}
                  </span>
                  {card.isMatched && (
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--success-color)',
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}
                    >
                      ✓ Matched
                    </span>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <AccessibleIcon name="flower" size={28} />
                  <span style={{ fontSize: '13px', letterSpacing: '1px', opacity: 0.85 }}>GENTLE</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Controls: Hint, Restart, Exit */}
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
          disabled={state.isLocked || state.isComplete}
          icon={<AccessibleIcon name="lightbulb" size={24} />}
          ariaLabel="Need a hint? Highlight a matching pair"
        >
          Need a Hint?
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => setShowRestartConfirm(true)}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Restart game with fresh cards"
        >
          Restart
        </BigButton>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-title"
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
            <h3 id="restart-title" style={{ fontSize: 'var(--font-h2)', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Restart this game?
            </h3>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Would you like to deal a fresh set of cards?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" onClick={() => setShowRestartConfirm(false)}>
                Keep Playing
              </BigButton>
              <BigButton variant="primary" onClick={() => handleRestart(pairCount)}>
                Yes, Deal New Cards
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
