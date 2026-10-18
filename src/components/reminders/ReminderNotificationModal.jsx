import React from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { formatTimeDisplay, getCategoryMeta } from '../../services/reminderService.js';

/**
 * ReminderNotificationModal
 * Displays an active, due reminder in a gentle, reassuring in-app modal.
 * User can acknowledge ("I Saw This"), snooze ("Remind in 10 Min"), or dismiss.
 */
export function ReminderNotificationModal({ reminder, onAcknowledge, onSnooze, onDismiss }) {
  if (!reminder) return null;

  const categoryMeta = getCategoryMeta(reminder.category);
  const timeFormatted = formatTimeDisplay(reminder.time);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="due-reminder-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '3px solid var(--accent-color)',
          maxWidth: '520px',
          width: '100%',
          padding: '36px 28px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          textAlign: 'center'
        }}
      >
        {/* Category Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
          aria-hidden="true"
        >
          <AccessibleIcon name={categoryMeta.icon || 'bell'} size={44} />
        </div>

        <div
          style={{
            fontSize: 'calc(var(--font-base) * 0.9)',
            color: 'var(--accent-color)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}
        >
          Daily Reminder ({timeFormatted})
        </div>

        <h2
          id="due-reminder-title"
          style={{
            fontSize: 'var(--font-h1)',
            color: 'var(--text-primary)',
            margin: '0 0 12px 0',
            fontWeight: 'bold',
            lineHeight: '1.3'
          }}
        >
          {reminder.title}
        </h2>

        <p
          style={{
            fontSize: 'var(--font-h3)',
            color: 'var(--text-secondary)',
            margin: '0 0 24px 0',
            lineHeight: '1.5'
          }}
        >
          {categoryMeta.description}
        </p>

        {reminder.category === 'medication' && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #93C5FD',
              borderRadius: '12px',
              fontSize: 'calc(var(--font-base) * 0.85)',
              color: '#1E40AF',
              marginBottom: '24px',
              lineHeight: '1.4'
            }}
          >
            <strong>Note:</strong> {categoryMeta.disclaimer}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '16px'
          }}
        >
          <BigButton
            variant="primary"
            onClick={() => onAcknowledge(reminder.id)}
            icon={<AccessibleIcon name="check" size={24} />}
            ariaLabel="I have seen this reminder"
          >
            I Saw This Note
          </BigButton>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <BigButton
              variant="secondary"
              onClick={() => onSnooze(reminder.id, 10)}
              icon={<AccessibleIcon name="clock" size={20} />}
              ariaLabel="Remind me again in 10 minutes"
              style={{ flex: 1, minWidth: '160px' }}
            >
              Remind in 10 Min
            </BigButton>

            <BigButton
              variant="secondary"
              onClick={() => onDismiss(reminder.id)}
              ariaLabel="Dismiss reminder"
              style={{ flex: 1, minWidth: '140px' }}
            >
              Dismiss
            </BigButton>
          </div>
        </div>
      </div>
    </div>
  );
}
