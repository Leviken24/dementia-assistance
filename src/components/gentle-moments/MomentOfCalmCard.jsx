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
      className="card-base"
      style={{
        padding: '28px 24px',
        maxWidth: '560px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}
      aria-label="A Moment of Calm"
    >
      {/* Peaceful Icon Indicator */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-soft)',
          color: 'var(--accent-color)',
          border: '1px solid var(--accent-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto'
        }}
        aria-hidden="true"
      >
        <AccessibleIcon name="bloom" size={28} />
      </div>

      {/* Gentle Message Content */}
      <div aria-live="polite" aria-atomic="true" style={{ width: '100%' }}>
        <p
          style={{
            fontSize: 'var(--font-h3)',
            color: 'var(--text-primary)',
            lineHeight: '1.6',
            fontWeight: '500',
            fontStyle: 'italic',
            margin: '0 auto',
            maxWidth: '460px'
          }}
        >
          &ldquo;{safeMessage.text}&rdquo;
        </p>
      </div>

      {/* Action to cycle peacefully and read aloud */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            padding: '8px 16px',
            minHeight: '40px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-sm)',
            fontWeight: '600'
          }}
        >
          <AccessibleIcon name="volume" size={18} />
          <span>{voiceService.isSpeaking ? 'Stop' : 'Read Aloud'}</span>
        </button>

        <BigButton
          variant="secondary"
          size="sm"
          onClick={() => {
            voiceService.stop();
            onNext();
          }}
          icon={<AccessibleIcon name="refresh" size={18} />}
          ariaLabel="Read another comforting thought"
        >
          Another Thought
        </BigButton>
      </div>
    </article>
  );
}
