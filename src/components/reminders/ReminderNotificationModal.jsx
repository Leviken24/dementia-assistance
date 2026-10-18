import React from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { formatTimeDisplay, getCategoryMeta } from '../../services/reminderService.js';
import { useFocusTrap } from '../common/useFocusTrap.js';

/**
 * ReminderNotificationModal
 * Displays an active, due reminder in a gentle, reassuring in-app modal.
 * User can acknowledge ("I Saw This"), snooze ("Remind in 10 Min"), or dismiss.
 */
export function ReminderNotificationModal({ reminder, onAcknowledge, onSnooze, onDismiss }) {
  const modalRef = useFocusTrap(Boolean(reminder), () => {
    if (onDismiss && reminder) onDismiss(reminder.id);
  });

  if (!reminder) return null;

  const categoryMeta = getCategoryMeta(reminder.category);
  const timeFormatted = formatTimeDisplay(reminder.time);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="due-reminder-title"
      style={{ zIndex: 2000 }}
    >
      <div
        ref={modalRef}
        className="modal-content"
        style={{
          maxWidth: '460px',
          textAlign: 'center',
          padding: '24px 20px'
        }}
      >
        {/* Category Icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}
          aria-hidden="true"
        >
          <AccessibleIcon name={categoryMeta.icon || 'bell'} size={28} />
        </div>

        <div className="badge badge-accent" style={{ marginBottom: '8px' }}>
          Daily Reminder • {timeFormatted}
        </div>

        <h2
          id="due-reminder-title"
          style={{
            fontSize: 'var(--font-h2)',
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            fontWeight: '700',
            lineHeight: '1.3'
          }}
        >
          {reminder.title}
        </h2>

        <p
          style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--text-secondary)',
            margin: '0 0 16px 0',
            lineHeight: '1.4'
          }}
        >
          {categoryMeta.description}
        </p>

        {reminder.category === 'medication' && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              marginBottom: '16px',
              fontStyle: 'italic'
            }}
          >
            Personal schedule note. This does not confirm prescription adherence or provide medical advice.
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <BigButton
            variant="primary"
            size="md"
            onClick={() => onAcknowledge(reminder.id)}
            icon={<AccessibleIcon name="check" size={18} />}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            I Saw This Note
          </BigButton>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <BigButton
              variant="secondary"
              size="sm"
              onClick={() => onSnooze(reminder.id, 10)}
              icon={<AccessibleIcon name="clock" size={16} />}
              style={{ justifyContent: 'center' }}
            >
              Remind in 10 Min
            </BigButton>

            <BigButton
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(reminder.id)}
              style={{ justifyContent: 'center' }}
            >
              Dismiss
            </BigButton>
          </div>
        </div>
      </div>
    </div>
  );
}
