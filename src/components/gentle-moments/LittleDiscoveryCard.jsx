import React from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';

export function LittleDiscoveryCard({ discovery, onNext }) {
  if (!discovery) return null;

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
        gap: '20px'
      }}
      aria-label="A Little Discovery"
    >
      {/* Category Badge & Icon */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '20px',
          backgroundColor: 'var(--success-soft)',
          color: 'var(--success-color)',
          fontSize: 'var(--font-base)',
          fontWeight: 'bold',
          textTransform: 'capitalize'
        }}
      >
        <AccessibleIcon name={discovery.icon || 'flower'} size={20} />
        <span>{discovery.category}</span>
      </div>

      {/* Discovery Title & Content */}
      <div aria-live="polite" aria-atomic="true" style={{ width: '100%' }}>
        <h3
          style={{
            fontSize: 'var(--font-h1)',
            color: 'var(--text-primary)',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}
        >
          {discovery.title}
        </h3>

        <p
          style={{
            fontSize: 'var(--font-h3)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            margin: '0 auto',
            maxWidth: '540px'
          }}
        >
          {discovery.text}
        </p>

        {/* Citation Attribution */}
        {discovery.reference && (
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              fontSize: 'calc(var(--font-base) * 0.9)',
              color: 'var(--text-secondary)',
              fontStyle: 'italic'
            }}
          >
            Source: {discovery.reference}
          </div>
        )}
      </div>

      {/* Action to cycle peacefully */}
      <div style={{ marginTop: '12px' }}>
        <BigButton
          variant="secondary"
          onClick={onNext}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Discover another verified fact"
        >
          Discover Another Fact
        </BigButton>
      </div>
    </article>
  );
}
