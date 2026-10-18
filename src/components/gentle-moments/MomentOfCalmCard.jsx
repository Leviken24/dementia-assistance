import React from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { FALLBACK_CALM_MESSAGE } from '../../games/gentle-moments/gentleMomentsEngine.js';
import { voiceService } from '../../services/voiceService.js';

export function MomentOfCalmCard({ message, onNext }) {
  const safeMessage = message && typeof message.text === 'string' && message.text.trim().length > 0
    ? message
    : FALLBACK_CALM_MESSAGE;

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
          &ldquo;{safeMessage.text}&rdquo;
        </p>
      </div>

      {/* Action to cycle peacefully and read aloud */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
        <button
          type="button"
          onClick={() => {
            if (voiceService.isSpeaking) {
              voiceService.stop();
            } else {
              voiceService.speak(safeMessage.text);
            }
          }}
          aria-label={voiceService.isSpeaking ? 'Stop speaking calm thought' : 'Listen to calm thought read aloud'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '2px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-base)',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <AccessibleIcon name="volume" size={22} />
          <span>Read Aloud</span>
        </button>

        <BigButton
          variant="secondary"
          onClick={() => {
            voiceService.stop();
            onNext();
          }}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Read another calm thought"
        >
          Read Another Thought
        </BigButton>
      </div>
    </article>
  );
}
