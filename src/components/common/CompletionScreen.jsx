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
  onGentleMoment
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '20px',
        border: '3px solid var(--border-color)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
        maxWidth: '680px',
        margin: '20px auto'
      }}
    >
      <div
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          backgroundColor: 'var(--success-soft)',
          color: 'var(--success-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}
        aria-hidden="true"
      >
        <AccessibleIcon name="star" size={48} />
      </div>

      <h2
        style={{
          fontSize: 'var(--font-h1)',
          color: 'var(--text-primary)',
          marginBottom: '16px',
          fontWeight: 'bold'
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: 'var(--font-h3)',
          color: 'var(--text-secondary)',
          maxWidth: '500px',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}
      >
        {message}
      </p>

      {/* Activity Details Box (Non-clinical) */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '20px 32px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '36px'
        }}
      >
        {durationSeconds > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>Time Spent</div>
            <div style={{ fontSize: 'var(--font-h2)', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              {formatTime(durationSeconds)}
            </div>
          </div>
        )}

        {turnsTaken > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>Turns Enjoyed</div>
            <div style={{ fontSize: 'var(--font-h2)', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              {turnsTaken}
            </div>
          </div>
        )}

        {pairsMatched > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)' }}>Pairs Matched</div>
            <div style={{ fontSize: 'var(--font-h2)', fontWeight: 'bold', color: 'var(--success-color)' }}>
              {pairsMatched}
            </div>
          </div>
        )}
      </div>

      {/* Respectful Action Choices */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%'
        }}
      >
        <BigButton
          variant="primary"
          onClick={onPlayAgain}
          icon={<AccessibleIcon name="refresh" size={24} />}
        >
          Play Again
        </BigButton>
        {onGentleMoment && (
          <BigButton
            variant="secondary"
            onClick={onGentleMoment}
            icon={<AccessibleIcon name="bloom" size={24} />}
            ariaLabel="Take a peaceful pause with A Gentle Moment"
          >
            A Gentle Moment
          </BigButton>
        )}
        <BigButton
          variant="secondary"
          onClick={onReturnHome}
          icon={<AccessibleIcon name="home" size={24} />}
        >
          Return Home
        </BigButton>
      </div>
    </div>
  );
}
