import React from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';

export function MomentOfCalmCard({ message, onNext }) {
  if (!message) return null;

  return (
    <article
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '20px',
        border: '3px solid var(--border-color)',
        padding: '36px 28px',
        maxWidth: '640px',
        margin: '0 auto',
        textAlign: 'center',
        boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}
      aria-label="A Moment of Calm"
    >
      {/* Peaceful Icon Indicator */}
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-soft)',
          color: 'var(--accent-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
        }}
        aria-hidden="true"
      >
        <AccessibleIcon name="bloom" size={44} />
      </div>

      {/* Gentle Message Content */}
      <div aria-live="polite" aria-atomic="true" style={{ width: '100%' }}>
        <p
          style={{
            fontSize: 'var(--font-h2)',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
            fontWeight: 'normal',
            margin: '0 auto',
            maxWidth: '520px'
          }}
        >
          &ldquo;{message.text}&rdquo;
        </p>
      </div>

      {/* Action to cycle peacefully */}
      <div style={{ marginTop: '8px' }}>
        <BigButton
          variant="secondary"
          onClick={onNext}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Read another calm thought"
        >
          Read Another Thought
        </BigButton>
      </div>
    </article>
  );
}
