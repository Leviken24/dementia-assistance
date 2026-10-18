import React, { useState } from 'react';
import { AccessibleIcon } from './AccessibleIcons.jsx';
import { BigButton } from './BigButton.jsx';
import { AccessibilityModal } from '../accessibility/AccessibilityModal.jsx';

export function Header({
  title,
  showBack = false,
  onBack,
  backLabel = 'Back to Home',
  onOpenCaregiver
}) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleBackClick = () => {
    if (showBack) {
      setShowExitConfirm(true);
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    if (onBack) onBack();
  };

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {showBack && (
            <button
              onClick={handleBackClick}
              aria-label={backLabel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-color)',
                fontSize: 'var(--font-base)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <AccessibleIcon name="arrow-left" size={24} />
              <span>{backLabel}</span>
            </button>
          )}

          <h1
            style={{
              fontSize: 'var(--font-h2)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            {title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onOpenCaregiver && (
            <button
              onClick={onOpenCaregiver}
              aria-label="Caregiver Dashboard Portal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-color)',
                fontSize: 'var(--font-base)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <AccessibleIcon name="lock" size={22} />
              <span>Caregiver</span>
            </button>
          )}

          <button
            onClick={() => setShowSettingsModal(true)}
            aria-label="Display and Accessibility Settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-color)',
              fontSize: 'var(--font-base)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <AccessibleIcon name="settings" size={24} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
              border: '3px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <h2
              id="exit-modal-title"
              style={{
                fontSize: 'var(--font-h2)',
                marginBottom: '16px',
                color: 'var(--text-primary)'
              }}
            >
              Return to Home?
            </h2>
            <p
              style={{
                fontSize: 'var(--font-base)',
                marginBottom: '28px',
                color: 'var(--text-secondary)'
              }}
            >
              You can leave this activity at any time. Take all the time you need, or return whenever you feel ready.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <BigButton
                variant="secondary"
                onClick={() => setShowExitConfirm(false)}
              >
                Keep Playing
              </BigButton>
              <BigButton
                variant="primary"
                onClick={confirmExit}
              >
                Yes, Return Home
              </BigButton>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Preferences Modal */}
      {showSettingsModal && (
        <AccessibilityModal onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  );
}
