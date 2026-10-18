import React, { useState } from 'react';
import { AccessibleIcon } from './AccessibleIcons.jsx';
import { BigButton } from './BigButton.jsx';
import { useFocusTrap } from './useFocusTrap.js';

/**
 * GameControlsBar
 * Unified game header & controls panel across all 5 cognitive games.
 * Provides a clean top bar and a unified Game Controls dialog with Resume, Restart, and Leave.
 *
 * @param {string} title - Name of the game (e.g. 'Memory Match')
 * @param {React.ReactNode} [status] - Progress indicator (e.g. 'Pairs: 2/4')
 * @param {React.ReactNode} [secondaryAction] - In-game helper such as 'Need a Hint?'
 * @param {React.ReactNode} [settingsAction] - Option switcher (e.g. 8 vs 12 cards)
 * @param {Function} onRestart - Callback to reset game
 * @param {Function} onLeave - Callback to exit to home/menu
 * @param {boolean} [isGameActive=true] - Whether an active session is in progress
 */
export function GameControlsBar({
  title,
  status,
  secondaryAction,
  settingsAction,
  onRestart,
  onLeave,
  isGameActive = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState(null); // 'restart' | 'leave' | null

  const modalRef = useFocusTrap(isOpen, () => {
    if (confirmMode) {
      setConfirmMode(null);
    } else {
      setIsOpen(false);
    }
  });

  const handleOpenMenu = () => {
    setConfirmMode(null);
    setIsOpen(true);
  };

  const handleResume = () => {
    setConfirmMode(null);
    setIsOpen(false);
  };

  const handleExecuteRestart = () => {
    setIsOpen(false);
    setConfirmMode(null);
    if (onRestart) onRestart();
  };

  const handleExecuteLeave = () => {
    setIsOpen(false);
    setConfirmMode(null);
    if (onLeave) onLeave();
  };

  return (
    <>
      {/* Top Game Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '16px'
        }}
      >
        {/* Left: Title & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <h2
              style={{
                fontSize: 'var(--font-h3)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.2
              }}
            >
              {title}
            </h2>
          </div>

          {status && (
            <div
              className="badge badge-accent"
              style={{ fontSize: 'var(--font-sm)', padding: '4px 10px' }}
            >
              {status}
            </div>
          )}
        </div>

        {/* Right: Helpers & Controls Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {settingsAction}
          {secondaryAction}

          <button
            type="button"
            onClick={handleOpenMenu}
            aria-label="Open Game Controls Menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              minHeight: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontSize: 'var(--font-sm)',
              fontWeight: '600'
            }}
          >
            <AccessibleIcon name="settings" size={18} />
            <span>Game Controls</span>
          </button>
        </div>
      </div>

      {/* Unified Game Controls Modal Dialog */}
      {isOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-controls-title"
        >
          <div
            ref={modalRef}
            className="modal-content"
            style={{ maxWidth: '440px' }}
          >
            {confirmMode === 'restart' ? (
              <div>
                <h3
                  id="game-controls-title"
                  style={{
                    fontSize: 'var(--font-h2)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}
                >
                  Restart this game?
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-base)',
                    color: 'var(--text-secondary)',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                  }}
                >
                  Would you like to start fresh from the beginning? Your current moves will be reset.
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <BigButton variant="secondary" size="md" onClick={() => setConfirmMode(null)}>
                    Keep Playing
                  </BigButton>
                  <BigButton variant="primary" size="md" onClick={handleExecuteRestart}>
                    Yes, Start Over
                  </BigButton>
                </div>
              </div>
            ) : confirmMode === 'leave' ? (
              <div>
                <h3
                  id="game-controls-title"
                  style={{
                    fontSize: 'var(--font-h2)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '8px'
                  }}
                >
                  Leave this game?
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-base)',
                    color: 'var(--text-secondary)',
                    marginBottom: '20px',
                    lineHeight: '1.4'
                  }}
                >
                  You will return to the activities room. Any completed activities are already safely recorded.
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <BigButton variant="secondary" size="md" onClick={() => setConfirmMode(null)}>
                    Stay Here
                  </BigButton>
                  <BigButton variant="danger" size="md" onClick={handleExecuteLeave}>
                    Yes, Leave Game
                  </BigButton>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <div>
                    <h3
                      id="game-controls-title"
                      style={{
                        fontSize: 'var(--font-h2)',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}
                    >
                      Game Controls
                    </h3>
                    <p
                      style={{
                        fontSize: 'var(--font-sm)',
                        color: 'var(--text-muted)',
                        margin: '2px 0 0 0'
                      }}
                    >
                      {title}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResume}
                    aria-label="Close controls dialog"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '36px',
                      minWidth: '36px'
                    }}
                  >
                    <AccessibleIcon name="close" size={20} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '16px'
                  }}
                >
                  {/* 1. Resume Game (Primary) */}
                  <BigButton
                    variant="primary"
                    size="md"
                    onClick={handleResume}
                    icon={<AccessibleIcon name="check" size={20} />}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Resume Game
                  </BigButton>

                  {/* 2. Restart Game (Secondary) */}
                  <BigButton
                    variant="secondary"
                    size="md"
                    onClick={() => setConfirmMode('restart')}
                    icon={<AccessibleIcon name="refresh" size={20} />}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Restart Game
                  </BigButton>

                  {/* 3. Leave Game (Subtle Danger) */}
                  <BigButton
                    variant="danger"
                    size="md"
                    onClick={() => setConfirmMode('leave')}
                    icon={<AccessibleIcon name="arrow-left" size={20} />}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Leave Game
                  </BigButton>
                </div>

                <p
                  style={{
                    fontSize: 'var(--font-xs)',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    margin: 0
                  }}
                >
                  You take all the time you need. There are no timers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
