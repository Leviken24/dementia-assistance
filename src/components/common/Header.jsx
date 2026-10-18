import React, { useState } from 'react';
import { AccessibleIcon } from './AccessibleIcons.jsx';
import { BigButton } from './BigButton.jsx';
import { AccessibilityModal } from '../accessibility/AccessibilityModal.jsx';
import { useFocusTrap } from './useFocusTrap.js';

export function Header({
  title,
  showBack = false,
  onBack,
  backLabel = 'Back to Home',
  onOpenCaregiver
}) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const confirmModalRef = useFocusTrap(showExitConfirm, () => setShowExitConfirm(false));

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
          padding: '12px 0 16px 0',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}
      >
        {/* Left: Brand / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBack && (
            <button
              type="button"
              onClick={handleBackClick}
              aria-label={backLabel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                minHeight: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontSize: 'var(--font-sm)',
                fontWeight: '600'
              }}
            >
              <AccessibleIcon name="arrow-left" size={18} />
              <span>{backLabel}</span>
            </button>
          )}

          <h1
            style={{
              fontSize: 'var(--font-h2)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2
            }}
          >
            {title}
          </h1>
        </div>

        {/* Right: Caregiver Portal & Accessibility Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenCaregiver && (
            <button
              type="button"
              onClick={onOpenCaregiver}
              aria-label="Caregiver Dashboard Portal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                minHeight: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontSize: 'var(--font-sm)',
                fontWeight: '600'
              }}
            >
              <AccessibleIcon name="lock" size={16} />
              <span>Caregiver</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            aria-label="Display & Accessibility Settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              minHeight: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontSize: 'var(--font-sm)',
              fontWeight: '600'
            }}
          >
            <AccessibleIcon name="settings" size={16} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Confirmation Dialog on Leaving */}
      {showExitConfirm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirm-title"
        >
          <div
            ref={confirmModalRef}
            className="modal-content"
            style={{ maxWidth: '420px' }}
          >
            <h3
              id="exit-confirm-title"
              style={{
                fontSize: 'var(--font-h2)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}
            >
              Return to main room?
            </h3>
            <p
              style={{
                fontSize: 'var(--font-base)',
                color: 'var(--text-secondary)',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}
            >
              Would you like to return to the home screen? You can choose another activity at any time.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" size="md" onClick={() => setShowExitConfirm(false)}>
                Stay Here
              </BigButton>
              <BigButton variant="primary" size="md" onClick={confirmExit}>
                Yes, Return Home
              </BigButton>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility & Display Settings Modal */}
      <AccessibilityModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}
