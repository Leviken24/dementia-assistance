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
        maxWidth: '720px',
        margin: '0 auto',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}
    >
      {/* Introduction Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'var(--font-h1)',
            color: 'var(--text-primary)',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}
        >
          A Gentle Moment
        </h2>
        <p
          style={{
            fontSize: 'var(--font-base)',
            color: 'var(--text-secondary)',
            margin: '0 auto',
            maxWidth: '500px',
            lineHeight: '1.5'
          }}
        >
          Take a quiet pause to enjoy comforting words or a pleasant glimpse of the world around us.
        </p>
      </div>

      {/* Dual-Tab Segmented Selector */}
      <div
        role="tablist"
        aria-label="Gentle Moments categories"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '8px',
          borderRadius: '16px',
          border: '2px solid var(--border-color)',
          maxWidth: '520px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'calm'}
          aria-controls="calm-panel"
          id="tab-calm"
          onClick={() => setActiveTab('calm')}
          style={{
            flex: 1,
            padding: '14px 20px',
            fontSize: 'var(--font-base)',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: activeTab === 'calm' ? '2px solid var(--accent-color)' : '2px solid transparent',
            backgroundColor: activeTab === 'calm' ? 'var(--accent-color)' : 'transparent',
            color: activeTab === 'calm' ? 'var(--button-primary-text, #ffffff)' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <AccessibleIcon name="bloom" size={22} />
          <span>A Moment of Calm</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'discovery'}
          aria-controls="discovery-panel"
          id="tab-discovery"
          onClick={() => setActiveTab('discovery')}
          style={{
            flex: 1,
            padding: '14px 20px',
            fontSize: 'var(--font-base)',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: activeTab === 'discovery' ? '2px solid var(--accent-color)' : '2px solid transparent',
            backgroundColor: activeTab === 'discovery' ? 'var(--accent-color)' : 'transparent',
            color: activeTab === 'discovery' ? 'var(--button-primary-text, #ffffff)' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <AccessibleIcon name="flower" size={22} />
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

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginTop: '12px'
        }}
      >
        {onReturnToGame && (
          <BigButton
            variant="secondary"
            onClick={onReturnToGame}
            icon={<AccessibleIcon name="arrow-left" size={24} />}
            ariaLabel="Return to previous activity results"
          >
            Back to Game Results
          </BigButton>
        )}
        <BigButton
          variant="secondary"
          onClick={onExit}
          icon={<AccessibleIcon name="home" size={24} />}
          ariaLabel="Return to home screen"
        >
          Return to Home Screen
        </BigButton>
      </div>
    </div>
  );
}
