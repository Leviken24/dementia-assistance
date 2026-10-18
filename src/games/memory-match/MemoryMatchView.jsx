import React, { useState, useEffect, useRef } from 'react';
import {
  createInitialState,
  handleCardSelection,
  resolveMismatch,
  triggerHint
} from './memoryMatchEngine.js';
import { AccessibleIcon } from '../../components/common/AccessibleIcons.jsx';
import { BigButton } from '../../components/common/BigButton.jsx';
import { GameControlsBar } from '../../components/common/GameControlsBar.jsx';
import { storageService } from '../../services/storageService.js';
import { voiceService } from '../../services/voiceService.js';
import { vaultApiClient } from '../../services/vaultApiClient.js';

export function MemoryMatchView({ onComplete, onExit }) {
  const initialPairCount =
    storageService.getUserPreferences()?.gamePreferences?.['memory-match']?.preferredPairCount || 4;
  const [pairCount, setPairCount] = useState(initialPairCount);
  const [state, setState] = useState(() => createInitialState(initialPairCount));
  const [statusMessage, setStatusMessage] = useState('Tap any card to turn it over.');
  const [simplifiedRules, setSimplifiedRules] = useState(null);
  const [isSimplifying, setIsSimplifying] = useState(false);

  const handleSimplifyRules = async () => {
    setIsSimplifying(true);
    try {
      const res = await vaultApiClient.simplifyInstructions(
        'memory-match',
        'Turn over cards to find matching pairs of familiar nature pictures.'
      );
      setSimplifiedRules(res.text);
    } catch (e) {
      setSimplifiedRules('Turn over two cards at a time to find flowers that look the same.');
    } finally {
      setIsSimplifying(false);
    }
  };

  const mismatchTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mismatchTimerRef.current) {
        clearTimeout(mismatchTimerRef.current);
      }
    };
  }, []);

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

      if (mismatchTimerRef.current) {
        clearTimeout(mismatchTimerRef.current);
      }
      mismatchTimerRef.current = setTimeout(() => {
        setState(current => resolveMismatch(current));
        setStatusMessage('Tap any card to try again.');
        mismatchTimerRef.current = null;
      }, 1100);
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
  };

  const handleHint = () => {
    if (state.isLocked || state.isComplete) return;
    setState(current => triggerHint(current));
    setStatusMessage('Notice the glowing card with the highlighted border.');
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* 1. Unified Game Controls Bar */}
      <GameControlsBar
        title="Memory Match"
        status={`Pairs: ${state.pairsMatched} / ${state.totalPairs}`}
        onRestart={() => handleRestart(pairCount)}
        onLeave={onExit}
        isGameActive={!state.isComplete}
        settingsAction={
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => handleRestart(4)}
              style={{
                padding: '6px 10px',
                minHeight: '34px',
                borderRadius: 'var(--radius-sm)',
                border: pairCount === 4 ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                backgroundColor: pairCount === 4 ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: pairCount === 4 ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontSize: 'var(--font-xs)',
                fontWeight: pairCount === 4 ? '700' : '500'
              }}
            >
              8 Cards
            </button>
            <button
              type="button"
              onClick={() => handleRestart(6)}
              style={{
                padding: '6px 10px',
                minHeight: '34px',
                borderRadius: 'var(--radius-sm)',
                border: pairCount === 6 ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                backgroundColor: pairCount === 6 ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: pairCount === 6 ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontSize: 'var(--font-xs)',
                fontWeight: pairCount === 6 ? '700' : '500'
              }}
            >
              12 Cards
            </button>
          </div>
        }
        secondaryAction={
          <BigButton
            variant="gentle"
            size="sm"
            onClick={handleHint}
            disabled={state.isLocked || state.isComplete}
            icon={<AccessibleIcon name="lightbulb" size={16} />}
            ariaLabel="Need a hint? Highlight a matching pair"
          >
            Hint
          </BigButton>
        }
      />

      {/* 2. Optional AI Simplified Rules Box */}
      {simplifiedRules && (
        <div
          role="region"
          aria-label="Simplified instructions"
          className="card-base"
          style={{
            backgroundColor: 'var(--accent-soft)',
            borderColor: 'var(--accent-border)',
            padding: '10px 16px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AccessibleIcon name="sparkles" size={18} />
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)', fontWeight: '600' }}>
              {simplifiedRules}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (voiceService.isSpeaking) {
                voiceService.stop();
              } else {
                voiceService.speak(simplifiedRules);
              }
            }}
            style={{
              padding: '4px 10px',
              minHeight: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent-color)',
              fontSize: 'var(--font-xs)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AccessibleIcon name="volume" size={14} />
            <span>Read</span>
          </button>
        </div>
      )}

      {/* 3. Live Feedback / Status Message */}
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          marginBottom: '14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          fontSize: 'var(--font-sm)',
          color: 'var(--text-secondary)'
        }}
      >
        <span style={{ fontWeight: '500' }}>{statusMessage}</span>

        {!simplifiedRules && (
          <button
            type="button"
            onClick={handleSimplifyRules}
            disabled={isSimplifying}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-color)',
              fontSize: 'var(--font-xs)',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '2px 6px',
              minHeight: 'auto',
              minWidth: 'auto',
              textDecoration: 'underline'
            }}
          >
            {isSimplifying ? 'Simplifying...' : 'Simpler Rules?'}
          </button>
        )}
      </div>

      {/* 4. Memory Cards Grid */}
      <div
        className="memory-grid"
        role="region"
        aria-label="Memory match cards grid"
        style={{
          gridTemplateColumns: `repeat(4, minmax(0, 1fr))`,
          gap: '16px'
        }}
      >
        {state.cards.map((card, idx) => {
          const isFaceUp = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.id}
              style={{
                perspective: '1000px',
                aspectRatio: '1 / 1.15',
                width: '100%'
              }}
            >
              <button
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || state.isLocked}
                aria-label={
                  card.isMatched
                    ? `Card ${idx + 1}: ${card.label}, matched`
                    : isFaceUp
                    ? `Card ${idx + 1}: ${card.label}, face up`
                    : `Card ${idx + 1}: face down`
                }
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isFaceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: card.isMatched || state.isLocked ? 'default' : 'pointer',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                {/* CARD BACK (Face down - shown when rotation is 0deg) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    borderRadius: 'var(--radius-lg)',
                    border: card.isHinted
                      ? '3px solid #F59E0B'
                      : '1px solid var(--glass-border)',
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: card.isHinted
                      ? '0 0 16px rgba(245, 158, 11, 0.6)'
                      : '0 4px 12px rgba(0, 0, 0, 0.25)',
                    padding: '10px'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AccessibleIcon name="flower" size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      letterSpacing: '1px',
                      fontWeight: '700',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}
                  >
                    Touch
                  </span>
                </div>

                {/* CARD FRONT (Face up - rotated 180deg) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderRadius: 'var(--radius-lg)',
                    border: card.isMatched
                      ? '2px solid var(--success-border)'
                      : '2px solid var(--accent-border)',
                    backgroundColor: card.isMatched
                      ? 'rgba(52, 211, 153, 0.18)'
                      : 'rgba(30, 41, 59, 0.92)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 8px',
                    boxShadow: card.isMatched
                      ? '0 0 14px rgba(52, 211, 153, 0.35)'
                      : '0 4px 14px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div
                    style={{
                      color: card.isMatched ? 'var(--success-color)' : 'var(--accent-color)',
                      marginBottom: '8px'
                    }}
                  >
                    <AccessibleIcon name={card.iconType} size={38} />
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--font-sm)',
                      fontWeight: '700',
                      lineHeight: '1.2',
                      textAlign: 'center',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {card.label}
                  </span>
                  {card.isMatched && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--success-color)',
                        fontWeight: '700',
                        marginTop: '4px'
                      }}
                    >
                      ✓ Matched
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
