import React, { useState } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { FALLBACK_LITTLE_DISCOVERY } from '../../games/gentle-moments/gentleMomentsEngine.js';
import { voiceService } from '../../services/voiceService.js';
import { vaultApiClient } from '../../services/vaultApiClient.js';

export function LittleDiscoveryCard({ discovery, onNext }) {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const safeDiscovery =
    discovery &&
    typeof discovery.title === 'string' &&
    typeof discovery.text === 'string' &&
    discovery.text.trim().length > 0
      ? discovery
      : FALLBACK_LITTLE_DISCOVERY;

  return (
    <article
      className="card-base"
      style={{
        padding: '24px 20px',
        maxWidth: '560px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}
      aria-label="A Little Discovery"
    >
      {/* Category Badge & Icon */}
      <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
        <AccessibleIcon name={safeDiscovery.icon || 'flower'} size={14} />
        <span>{safeDiscovery.category || 'Nature'}</span>
      </span>

      {/* Discovery Title & Content */}
      <div aria-live="polite" aria-atomic="true" style={{ width: '100%' }}>
        <h3
          style={{
            fontSize: 'var(--font-h2)',
            color: 'var(--text-primary)',
            fontWeight: '700',
            marginBottom: '10px'
          }}
        >
          {safeDiscovery.title}
        </h3>

        <p
          style={{
            fontSize: 'var(--font-base)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            margin: '0 auto',
            maxWidth: '460px'
          }}
        >
          {safeDiscovery.text}
        </p>

        {/* Optional AI Explanation */}
        {aiExplanation && (
          <div
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)',
              fontSize: 'var(--font-sm)',
              color: 'var(--text-primary)',
              lineHeight: '1.4',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: '700', fontSize: 'var(--font-xs)', color: 'var(--accent-color)' }}>
              <AccessibleIcon name="sparkles" size={14} />
              <span>Gentle Nature Note</span>
            </div>
            {aiExplanation}
          </div>
        )}
      </div>

      {/* Audio & Navigation Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => {
            const spokenText = aiExplanation
              ? `${safeDiscovery.title}. ${safeDiscovery.text}. ${aiExplanation}`
              : `${safeDiscovery.title}. ${safeDiscovery.text}`;
            if (voiceService.isSpeaking) {
              voiceService.stop();
            } else {
              voiceService.speak(spokenText);
            }
          }}
          aria-label={voiceService.isSpeaking ? 'Stop speaking fact' : 'Listen to fact read aloud'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
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

        {!aiExplanation && (
          <button
            type="button"
            disabled={isLoadingAi}
            onClick={async () => {
              setIsLoadingAi(true);
              try {
                const res = await vaultApiClient.explainFact(safeDiscovery.text, safeDiscovery.category);
                setAiExplanation(res.text);
              } catch (e) {
                setAiExplanation('Nature in the North Eastern Region is full of gentle wonder and life.');
              } finally {
                setIsLoadingAi(false);
              }
            }}
            aria-label="Learn a gentle extra sentence about this fact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              minHeight: '40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--accent-border)',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              fontSize: 'var(--font-sm)',
              fontWeight: '600'
            }}
          >
            <AccessibleIcon name="sparkles" size={16} />
            <span>{isLoadingAi ? 'Thinking...' : 'Learn More'}</span>
          </button>
        )}

        <BigButton
          variant="secondary"
          size="sm"
          onClick={() => {
            voiceService.stop();
            setAiExplanation(null);
            onNext();
          }}
          icon={<AccessibleIcon name="refresh" size={18} />}
          ariaLabel="Discover another interesting fact"
        >
          Another Fact
        </BigButton>
      </div>
    </article>
  );
}
