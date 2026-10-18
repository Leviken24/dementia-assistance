import React from 'react';
import { BigButton } from './BigButton.jsx';
import { AccessibleIcon } from './AccessibleIcons.jsx';

export function CompletionScreen({
  title = 'Well Done!',
  message = 'You completed this relaxing activity.',
  durationSeconds = 0,
  turnsTaken = 0,
  pairsMatched = 0,
  onPlayAgain,
  onReturnHome,
  onGentleMoment,
  pacingMessage
}) {
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    if (secs === 0) return `${mins} minute${mins > 1 ? 's' : ''}`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      className="card-base"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 20px',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '20px auto'
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--success-soft)',
          color: 'var(--success-color)',
          border: '1px solid var(--success-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
        aria-hidden="true"
      >
        <AccessibleIcon name="star" size={32} />
      </div>

      <h2
        style={{
          fontSize: 'var(--font-h2)',
          color: 'var(--text-primary)',
          marginBottom: '8px',
          fontWeight: '700'
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: 'var(--font-base)',
          color: 'var(--text-secondary)',
          maxWidth: '440px',
          lineHeight: '1.4',
          marginBottom: pacingMessage ? '12px' : '20px'
        }}
      >
        {message}
      </p>

      {/* Gentle Pacing / Rest Recommendation */}
      {pacingMessage && (
        <div
          style={{
            backgroundColor: 'var(--accent-soft)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-border)',
            padding: '10px 16px',
            maxWidth: '460px',
            marginBottom: '18px',
            fontSize: 'var(--font-sm)',
            color: 'var(--text-primary)',
            lineHeight: '1.4'
          }}
        >
          {pacingMessage}
        </div>
      )}

      {/* Non-clinical Activity Details Box */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>
            TIME SPENT
          </div>
          <div style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatTime(durationSeconds)}
          </div>
        </div>

        {turnsTaken > 0 && (
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>
              TURNS ENJOYED
            </div>
            <div style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-primary)' }}>
              {turnsTaken}
            </div>
          </div>
        )}

        {pairsMatched > 0 && (
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>
              PAIRS FOUND
            </div>
            <div style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-primary)' }}>
              {pairsMatched}
            </div>
          </div>
        )}
      </div>

      {/* Primary & Secondary Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '360px'
        }}
      >
        <BigButton
          variant="primary"
          size="md"
          onClick={onPlayAgain}
          icon={<AccessibleIcon name="refresh" size={18} />}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Play Again
        </BigButton>

        {onGentleMoment && (
          <BigButton
            variant="secondary"
            size="md"
            onClick={onGentleMoment}
            icon={<AccessibleIcon name="bloom" size={18} />}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Enjoy a Gentle Moment
          </BigButton>
        )}

        <BigButton
          variant="ghost"
          size="sm"
          onClick={onReturnHome}
          icon={<AccessibleIcon name="home" size={18} />}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Return to Home
        </BigButton>
      </div>
    </div>
  );
}
