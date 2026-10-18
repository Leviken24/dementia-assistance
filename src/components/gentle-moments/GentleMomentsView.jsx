import React, { useState } from 'react';
import { MomentOfCalmCard } from './MomentOfCalmCard.jsx';
import { LittleDiscoveryCard } from './LittleDiscoveryCard.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import {
  getCalmMessages,
  getLittleDiscoveries,
  getNextCalmMessage,
  getNextLittleDiscovery,
  FALLBACK_CALM_MESSAGE,
  FALLBACK_LITTLE_DISCOVERY
} from '../../games/gentle-moments/gentleMomentsEngine.js';
import { storageService } from '../../services/storageService.js';
import { getNextRotatedContent } from '../../services/personalizationEngine.js';

export function GentleMomentsView({ onExit, onReturnToGame, initialTab = 'calm' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const calmList = getCalmMessages();
  const discoveryList = getLittleDiscoveries();
  const prefs = storageService.getUserPreferences();
  const { nextCalmId, nextDiscoveryId } = getNextRotatedContent(
    prefs.contentState,
    calmList,
    discoveryList
  );

  const [currentCalm, setCurrentCalm] = useState(
    () => (nextCalmId ? calmList.find(c => c.id === nextCalmId) : calmList[0]) || FALLBACK_CALM_MESSAGE
  );
  const [currentDiscovery, setCurrentDiscovery] = useState(
    () => (nextDiscoveryId ? discoveryList.find(d => d.id === nextDiscoveryId) : discoveryList[0]) || FALLBACK_LITTLE_DISCOVERY
  );

  const handleNextCalm = () => {
    setCurrentCalm(prev => {
      const next = getNextCalmMessage(prev ? prev.id : null);
      if (next && next.id) {
        storageService.saveUserPreferences({
          contentState: {
            ...storageService.getUserPreferences().contentState,
            lastCalmId: next.id
          }
        });
      }
      return next;
    });
  };

  const handleNextDiscovery = () => {
    setCurrentDiscovery(prev => {
      const next = getNextLittleDiscovery(prev ? prev.id : null);
      if (next && next.id) {
        storageService.saveUserPreferences({
          contentState: {
            ...storageService.getUserPreferences().contentState,
            lastDiscoveryId: next.id
          }
        });
      }
      return next;
    });
  };

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Introduction Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'var(--font-h2)',
            color: 'var(--text-primary)',
            fontWeight: '700',
            marginBottom: '4px'
          }}
        >
          A Gentle Moment
        </h2>
        <p
          style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--text-secondary)',
            margin: '0 auto',
            maxWidth: '440px',
            lineHeight: '1.4'
          }}
        >
          Take a quiet pause to enjoy comforting thoughts or a glimpse of the natural world.
        </p>
      </div>

      {/* Segmented Selector */}
      <div
        role="tablist"
        aria-label="Gentle Moments categories"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          maxWidth: '440px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'calm'}
          aria-controls="calm-panel"
          id="tab-calm"
          onClick={() => setActiveTab('calm')}
          style={{
            flex: 1,
            padding: '8px 14px',
            minHeight: '38px',
            fontSize: 'var(--font-sm)',
            fontWeight: '600',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'calm' ? '1px solid var(--accent-color)' : '1px solid transparent',
            backgroundColor: activeTab === 'calm' ? 'var(--accent-color)' : 'transparent',
            color: activeTab === 'calm' ? '#FFFFFF' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <AccessibleIcon name="bloom" size={16} />
          <span>Moment of Calm</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'discovery'}
          aria-controls="discovery-panel"
          id="tab-discovery"
          onClick={() => setActiveTab('discovery')}
          style={{
            flex: 1,
            padding: '8px 14px',
            minHeight: '38px',
            fontSize: 'var(--font-sm)',
            fontWeight: '600',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'discovery' ? '1px solid var(--accent-color)' : '1px solid transparent',
            backgroundColor: activeTab === 'discovery' ? 'var(--accent-color)' : 'transparent',
            color: activeTab === 'discovery' ? '#FFFFFF' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <AccessibleIcon name="flower" size={16} />
          <span>A Little Discovery</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ width: '100%' }}>
        {activeTab === 'calm' && (
          <div role="tabpanel" id="calm-panel" aria-labelledby="tab-calm">
            <MomentOfCalmCard message={currentCalm} onNext={handleNextCalm} />
          </div>
        )}

        {activeTab === 'discovery' && (
          <div role="tabpanel" id="discovery-panel" aria-labelledby="tab-discovery">
            <LittleDiscoveryCard discovery={currentDiscovery} onNext={handleNextDiscovery} />
          </div>
        )}
      </div>

      {/* Return to Activity or Home */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
        {onReturnToGame && (
          <BigButton
            variant="secondary"
            size="sm"
            onClick={onReturnToGame}
            icon={<AccessibleIcon name="arrow-left" size={16} />}
          >
            Back to Game Results
          </BigButton>
        )}

        <BigButton
          variant="ghost"
          size="sm"
          onClick={onExit}
          icon={<AccessibleIcon name="home" size={16} />}
        >
          Return to Home
        </BigButton>
      </div>
    </div>
  );
}
