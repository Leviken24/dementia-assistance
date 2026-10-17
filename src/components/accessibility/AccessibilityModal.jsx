import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';

export function AccessibilityModal({ onClose }) {
  const { settings, updateSetting } = useAccessibility();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1100
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '3px solid var(--border-color)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 id="settings-dialog-title" style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)' }}>
            Display & Comfort Settings
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Text Size Control */}
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: 'var(--font-h3)', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Text Size
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'large', label: 'Large' },
              { id: 'extra-large', label: 'Extra Large' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateSetting('fontSize', opt.id)}
                style={{
                  padding: '16px 8px',
                  borderRadius: '10px',
                  border: settings.fontSize === opt.id ? '3px solid var(--focus-ring)' : '2px solid var(--border-color)',
                  backgroundColor: settings.fontSize === opt.id ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontWeight: settings.fontSize === opt.id ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: 'var(--font-base)'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* High Contrast Mode Toggle */}
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: 'var(--font-h3)', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Color Contrast
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => updateSetting('highContrast', false)}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '10px',
                border: !settings.highContrast ? '3px solid var(--focus-ring)' : '2px solid var(--border-color)',
                backgroundColor: !settings.highContrast ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontWeight: !settings.highContrast ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: 'var(--font-base)'
              }}
            >
              Warm Calm (Default)
            </button>
            <button
              onClick={() => updateSetting('highContrast', true)}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '10px',
                border: settings.highContrast ? '3px solid var(--focus-ring)' : '2px solid var(--border-color)',
                backgroundColor: settings.highContrast ? 'var(--accent-soft)' : 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontWeight: settings.highContrast ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: 'var(--font-base)'
              }}
            >
              High Contrast (Dark)
            </button>
          </div>
        </section>

        {/* Reduced Motion Toggle */}
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: 'var(--font-h3)', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Card Flip Motion
          </h3>
          <button
            onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: '10px',
              border: '2px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 'var(--font-base)'
            }}
          >
            <span>Gentle / No Movement (Reduced Motion)</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '2px solid var(--border-color)',
                backgroundColor: settings.reducedMotion ? 'var(--success-color)' : 'transparent',
                color: '#FFFFFF'
              }}
            >
              {settings.reducedMotion && <AccessibleIcon name="check" size={20} />}
            </span>
          </button>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <BigButton variant="primary" onClick={onClose}>
            Done & Save
          </BigButton>
        </div>
      </div>
    </div>
  );
}
