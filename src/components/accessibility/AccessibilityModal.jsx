import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { useFocusTrap } from '../common/useFocusTrap.js';

export function AccessibilityModal({ isOpen, onClose }) {
  const { settings, updateSetting } = useAccessibility();
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="modal-overlay"
    >
      <div
        ref={modalRef}
        className="modal-content"
        style={{ maxWidth: '520px', maxHeight: '90vh' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 id="settings-dialog-title" style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
            Display & Comfort
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px'
            }}
          >
            <AccessibleIcon name="close" size={20} />
          </button>
        </div>

        {/* Text Size Control */}
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: 'calc(var(--font-base) * 0.95)', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Text Size
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'large', label: 'Large' },
              { id: 'extra-large', label: 'Extra Large' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateSetting('fontSize', opt.id)}
                style={{
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: settings.fontSize === opt.id ? '2px solid var(--focus-ring)' : '1px solid var(--border-color)',
                  backgroundColor: settings.fontSize === opt.id ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
                  color: settings.fontSize === opt.id ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontWeight: settings.fontSize === opt.id ? '700' : '500',
                  cursor: 'pointer',
                  fontSize: 'calc(var(--font-base) * 0.9)'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* High Contrast Mode Toggle */}
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: 'calc(var(--font-base) * 0.95)', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Color Contrast
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => updateSetting('highContrast', false)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: !settings.highContrast ? '2px solid var(--focus-ring)' : '1px solid var(--border-color)',
                backgroundColor: !settings.highContrast ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
                color: !settings.highContrast ? 'var(--accent-color)' : 'var(--text-primary)',
                fontWeight: !settings.highContrast ? '700' : '500',
                cursor: 'pointer',
                fontSize: 'calc(var(--font-base) * 0.9)'
              }}
            >
              Warm Calm (Default)
            </button>
            <button
              onClick={() => updateSetting('highContrast', true)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: settings.highContrast ? '2px solid var(--focus-ring)' : '1px solid var(--border-color)',
                backgroundColor: settings.highContrast ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
                color: settings.highContrast ? 'var(--accent-color)' : 'var(--text-primary)',
                fontWeight: settings.highContrast ? '700' : '500',
                cursor: 'pointer',
                fontSize: 'calc(var(--font-base) * 0.9)'
              }}
            >
              High Contrast (Dark)
            </button>
          </div>
        </section>

        {/* Reduced Motion Toggle */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: 'calc(var(--font-base) * 0.95)', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Motion & Animation
          </h3>
          <button
            onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 'calc(var(--font-base) * 0.9)'
            }}
          >
            <span>Reduced Motion (Gentle/Static)</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: settings.reducedMotion ? 'var(--success-color)' : 'transparent',
                color: '#FFFFFF'
              }}
            >
              {settings.reducedMotion && <AccessibleIcon name="check" size={16} />}
            </span>
          </button>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <BigButton variant="primary" size="md" onClick={onClose}>
            Done & Save
          </BigButton>
        </div>
      </div>
    </div>
  );
}
