import React from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';

const GAME_METADATA = {
  'memory-match': { title: 'Memory Match', icon: 'flower' },
  'picture-sequence': { title: 'Picture Stories', icon: 'leaf' },
  'number-path': { title: 'Garden Path', icon: 'mountain' },
  'dice-match': { title: 'Dice Pattern Match', icon: 'star' },
  'word-match': { title: 'Word & Picture Match', icon: 'cup' },
  'gentle-moments': { title: 'A Gentle Moment', icon: 'bloom' }
};

function formatTimestamp(isoString) {
  if (!isoString) return 'Earlier';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Earlier';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today at ${timeStr}`;
    if (isYesterday) return `Yesterday at ${timeStr}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Earlier';
  }
}

function formatDuration(seconds) {
  const secs = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  if (mins === 0) return `${remSecs} seconds`;
  if (remSecs === 0) return `${mins} minute${mins > 1 ? 's' : ''}`;
  return `${mins}m ${remSecs}s`;
}

export function ActivityHistoryCard({ record, onPlayAgain }) {
  if (!record) return null;

  const meta = GAME_METADATA[record.gameId] || {
    title: record.gameId || 'Activity',
    icon: 'star'
  };

  return (
    <article
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '2px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}
      aria-label={`${meta.title} ${record.completed ? 'completed' : 'played'} on ${formatTimestamp(record.timestamp)}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '240px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          aria-hidden="true"
        >
          <AccessibleIcon name={meta.icon} size={32} />
        </div>

        <div>
          <h3
            style={{
              fontSize: 'var(--font-h3)',
              color: 'var(--text-primary)',
              fontWeight: 'bold',
              margin: '0 0 6px 0'
            }}
          >
            {meta.title}
          </h3>
          <div
            style={{
              fontSize: 'var(--font-base)',
              color: 'var(--text-secondary)'
            }}
          >
            {formatTimestamp(record.timestamp)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 'calc(var(--font-base) * 0.9)',
              color: 'var(--text-secondary)'
            }}
          >
            Status
          </div>
          <div
            style={{
              fontSize: 'var(--font-base)',
              fontWeight: 'bold',
              color: record.completed ? 'var(--success-color)' : 'var(--text-secondary)'
            }}
          >
            {record.completed ? 'Completed' : 'Explored'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 'calc(var(--font-base) * 0.9)',
              color: 'var(--text-secondary)'
            }}
          >
            Time Spent
          </div>
          <div
            style={{
              fontSize: 'var(--font-base)',
              fontWeight: 'bold',
              color: 'var(--text-primary)'
            }}
          >
            {formatDuration(record.durationSeconds)}
          </div>
        </div>

        {record.turnsTaken > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 'calc(var(--font-base) * 0.9)',
                color: 'var(--text-secondary)'
              }}
            >
              Turns
            </div>
            <div
              style={{
                fontSize: 'var(--font-base)',
                fontWeight: 'bold',
                color: 'var(--text-primary)'
              }}
            >
              {record.turnsTaken}
            </div>
          </div>
        )}

        {onPlayAgain && (
          <BigButton
            variant="secondary"
            onClick={() => onPlayAgain(record.gameId)}
            icon={<AccessibleIcon name="refresh" size={20} />}
            ariaLabel={`Play ${meta.title} again`}
            style={{ minHeight: '48px', padding: '10px 18px' }}
          >
            Play Again
          </BigButton>
        )}
      </div>
    </article>
  );
}
