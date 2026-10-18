import React, { useState } from 'react';
import { ActivityHistoryCard } from './ActivityHistoryCard.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { storageService } from '../../services/storageService.js';

export function ActivityHistoryView({ onExit, onSelectGame }) {
  const [history, setHistory] = useState(() => storageService.getGameHistory());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearHistory = () => {
    storageService.clearGameHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <div
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px'
      }}
    >
      {/* Header */}
      <section style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'var(--font-h1)',
            color: 'var(--text-primary)',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}
        >
          Your Activity Journal
        </h2>
        <p
          style={{
            fontSize: 'var(--font-base)',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}
        >
          A gentle record of the peaceful activities you have enjoyed. There are no tests, grades, or comparisons here.
        </p>
      </section>

      {/* Non-medical Privacy & Safety Notice */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: 'calc(var(--font-base) * 0.9)',
          color: 'var(--text-secondary)'
        }}
      >
        <AccessibleIcon name="sun" size={24} />
        <div>
          <strong>Private to this device.</strong> Activity records stay in your local browser and are never uploaded to the internet or shared with anyone.
        </div>
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '2px dashed var(--border-color)',
            margin: '12px 0'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
            aria-hidden="true"
          >
            <AccessibleIcon name="bloom" size={36} />
          </div>
          <h3
            style={{
              fontSize: 'var(--font-h2)',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}
          >
            Your Journal is Empty
          </h3>
          <p
            style={{
              fontSize: 'var(--font-base)',
              color: 'var(--text-secondary)',
              maxWidth: '460px',
              margin: '0 auto 24px auto',
              lineHeight: '1.5'
            }}
          >
            Whenever you finish a game or spend time in Gentle Moments, it will appear here so you can easily revisit it.
          </p>
          <BigButton
            variant="primary"
            onClick={onExit}
            icon={<AccessibleIcon name="flower" size={24} />}
          >
            Explore Activities
          </BigButton>
        </div>
      ) : (
        <section aria-labelledby="history-list-heading">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <h3
              id="history-list-heading"
              style={{
                fontSize: 'var(--font-h3)',
                color: 'var(--text-primary)',
                fontWeight: 'bold',
                margin: 0
              }}
            >
              Recent Sessions ({history.length})
            </h3>
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 'calc(var(--font-base) * 0.9)',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '6px 10px'
              }}
              aria-label="Clear all recorded history"
            >
              Clear Journal
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {history
              .filter(record => record && typeof record === 'object')
              .map((record, index) => (
                <ActivityHistoryCard
                  key={record.resultId || `history_item_${index}`}
                  record={record}
                  onPlayAgain={onSelectGame}
                />
              ))}
          </div>
        </section>
      )}

      {/* Return Home Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <BigButton
          variant="secondary"
          onClick={onExit}
          icon={<AccessibleIcon name="home" size={24} />}
          ariaLabel="Return to home screen"
        >
          Return to Home Screen
        </BigButton>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '3px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
          >
            <h3
              id="clear-modal-title"
              style={{
                fontSize: 'var(--font-h2)',
                color: 'var(--text-primary)',
                marginBottom: '12px'
              }}
            >
              Clear Your Journal?
            </h3>
            <p
              style={{
                fontSize: 'var(--font-base)',
                color: 'var(--text-secondary)',
                marginBottom: '28px',
                lineHeight: '1.5'
              }}
            >
              This will remove your past activity records on this device. Your favorite games and display settings will remain safe.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <BigButton
                variant="primary"
                onClick={handleClearHistory}
                ariaLabel="Confirm clear journal"
              >
                Yes, Clear
              </BigButton>
              <BigButton
                variant="secondary"
                onClick={() => setShowClearConfirm(false)}
                ariaLabel="Cancel clear journal"
              >
                Keep Journal
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
