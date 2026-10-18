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
        <AccessibleIcon name={safeDiscovery.icon || 'flower'} size={20} />
        <span>{safeDiscovery.category || 'Nature'}</span>
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
          {safeDiscovery.title}
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
          {safeDiscovery.text}
        </p>

        {/* Optional AI Explanation (Constrained & Gentle) */}
        {aiExplanation && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-soft)',
              border: '1px solid var(--border-color)',
              fontSize: 'calc(var(--font-base) * 0.95)',
              color: 'var(--text-primary)',
              lineHeight: '1.5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 'bold', fontSize: 'calc(var(--font-base) * 0.85)', color: 'var(--accent-color)' }}>
              <AccessibleIcon name="sparkles" size={16} />
              <span>Gentle Nature Note</span>
            </div>
            {aiExplanation}
          </div>
        )}

        {/* Citation Attribution */}
        {safeDiscovery.reference ? (
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
            Source: {safeDiscovery.reference}
          </div>
        ) : (
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
            Source reference pending editorial review
          </div>
        )}
      </div>

      {/* Action Controls: Read Aloud, AI Explanation, Next Fact */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => {
            if (voiceService.isSpeaking) {
              voiceService.stop();
            } else {
              const fullSpeech = `${safeDiscovery.title}. ${safeDiscovery.text}. ${aiExplanation || ''}`;
              voiceService.speak(fullSpeech);
            }
          }}
          aria-label={voiceService.isSpeaking ? 'Stop speaking fact' : 'Listen to fact read aloud'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
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

        {!aiExplanation && (
          <button
            type="button"
            onClick={async () => {
              setIsLoadingAi(true);
              try {
                const res = await vaultApiClient.explainFact(safeDiscovery.text, safeDiscovery.category);
                setAiExplanation(res.text);
              } catch (e) {
                setAiExplanation('Nature in the North Eastern hills is rich with wonderful plants and gentle rivers.');
              } finally {
                setIsLoadingAi(false);
              }
            }}
            disabled={isLoadingAi}
            aria-label="Ask for a gentle explanation about this fact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              borderRadius: '12px',
              border: '2px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--accent-color)',
              fontSize: 'var(--font-base)',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <AccessibleIcon name="sparkles" size={20} />
            <span>{isLoadingAi ? 'Thinking...' : 'Learn a Little More'}</span>
          </button>
        )}

        <BigButton
          variant="secondary"
          onClick={() => {
            voiceService.stop();
            setAiExplanation(null);
            onNext();
          }}
          icon={<AccessibleIcon name="refresh" size={24} />}
          ariaLabel="Discover another verified fact"
        >
          Discover Another Fact
        </BigButton>
      </div>
    </article>
  );
}
