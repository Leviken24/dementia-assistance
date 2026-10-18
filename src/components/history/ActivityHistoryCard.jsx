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
  if (mins === 0) return `${remSecs}s`;
  if (remSecs === 0) return `${mins}m`;
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
      className="card-base"
      style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}
      aria-label={`${meta.title} ${record.completed ? 'completed' : 'played'} on ${formatTimestamp(record.timestamp)}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          aria-hidden="true"
        >
          <AccessibleIcon name={meta.icon} size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3
              style={{
                fontSize: 'var(--font-base)',
                color: 'var(--text-primary)',
                fontWeight: '700',
                margin: 0
              }}
            >
              {meta.title}
            </h3>

            {record.completed && (
              <span className="badge badge-success">Completed</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              {formatTimestamp(record.timestamp)}
            </span>

            {record.durationSeconds > 0 && (
              <>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {formatDuration(record.durationSeconds)}
                </span>
              </>
            )}

            {record.turnsTaken > 0 && (
              <>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  {record.turnsTaken} turns
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {onPlayAgain && (
        <BigButton
          variant="secondary"
          size="sm"
          onClick={() => onPlayAgain(record.gameId)}
          ariaLabel={`Play ${meta.title} again`}
        >
          Play Again
        </BigButton>
      )}
    </article>
  );
}
