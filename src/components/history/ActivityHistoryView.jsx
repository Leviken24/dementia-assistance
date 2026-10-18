import React, { useState } from 'react';
import { ActivityHistoryCard } from './ActivityHistoryCard.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { storageService } from '../../services/storageService.js';
import { useFocusTrap } from '../common/useFocusTrap.js';

export function ActivityHistoryView({ onExit, onSelectGame }) {
  const [history, setHistory] = useState(() => storageService.getGameHistory());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const confirmModalRef = useFocusTrap(showClearConfirm, () => setShowClearConfirm(false));

  const handleClearHistory = () => {
    storageService.clearGameHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* 1. Header Card */}
      <section
        className="card-base"
        style={{
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2
              style={{
                fontSize: 'var(--font-h3)',
                color: 'var(--text-primary)',
                fontWeight: '700',
                margin: 0
              }}
            >
              Your Activity Journal
            </h2>
            <span className="badge badge-neutral">
              {history.length} Sessions
            </span>
          </div>

          <p
            style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.4
            }}
          >
            A gentle record of peaceful activities you have played. There are no tests or clinical scores.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            aria-label="Clear all activity journal entries"
            style={{
              padding: '6px 12px',
              minHeight: '36px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--danger-border)',
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger-color)',
              fontSize: 'var(--font-xs)',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <AccessibleIcon name="trash" size={14} />
            <span>Clear History</span>
          </button>
        )}
      </section>

      {/* 2. Privacy Notice */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-secondary)'
        }}
      >
        <AccessibleIcon name="sun" size={18} />
        <div>
          <strong>Stored privately on this device.</strong> Activity records are saved locally and are never shared or uploaded to cloud analytics.
        </div>
      </div>

      {/* 3. History List */}
      <section aria-label="Past activity records">
        {history.length === 0 ? (
          <div
            className="card-base"
            style={{
              textAlign: 'center',
              padding: '36px 20px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}
              aria-hidden="true"
            >
              <AccessibleIcon name="bloom" size={24} />
            </div>

            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Your journal is clean. Choose any game to begin your first session.
            </p>

            <BigButton variant="primary" size="sm" onClick={() => onSelectGame('memory-match')}>
              Start a Calming Game
            </BigButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map(record => (
              <ActivityHistoryCard
                key={record.resultId}
                record={record}
                onPlayAgain={onSelectGame}
              />
            ))}
          </div>
        )}
      </section>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-title"
        >
          <div
            ref={confirmModalRef}
            className="modal-content"
            style={{ maxWidth: '420px' }}
          >
            <h3
              id="clear-title"
              style={{
                fontSize: 'var(--font-h2)',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}
            >
              Clear activity history?
            </h3>
            <p
              style={{
                fontSize: 'var(--font-base)',
                color: 'var(--text-secondary)',
                marginBottom: '20px',
                lineHeight: '1.4'
              }}
            >
              Would you like to clear your past activity journal on this device?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" size="md" onClick={() => setShowClearConfirm(false)}>
                Keep Records
              </BigButton>
              <BigButton variant="danger" size="md" onClick={handleClearHistory}>
                Yes, Clear All
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
