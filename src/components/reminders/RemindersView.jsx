import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { ReminderFormModal } from './ReminderFormModal.jsx';
import {
  formatTimeDisplay,
  getCategoryMeta,
  NON_CLINICAL_DISCLAIMER,
  requestNotificationPermission,
  getMissedReminders
} from '../../services/reminderService.js';
import { storageService } from '../../services/storageService.js';

export function RemindersView({ onExit }) {
  const [reminders, setReminders] = useState(() => storageService.getReminders());
  const [editingReminder, setEditingReminder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'unsupported'
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const refreshReminders = () => {
    setReminders(storageService.getReminders());
  };

  const showTemporaryFeedback = msg => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  const handleOpenAdd = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = reminder => {
    setEditingReminder(reminder);
    setIsModalOpen(true);
  };

  const handleSaveReminder = sanitizedPayload => {
    storageService.saveReminder(sanitizedPayload);
    setIsModalOpen(false);
    setEditingReminder(null);
    refreshReminders();
    showTemporaryFeedback('Reminder saved successfully.');
  };

  const handleDeleteReminder = id => {
    storageService.deleteReminder(id);
    refreshReminders();
    showTemporaryFeedback('Reminder removed.');
  };

  const handleToggleReminder = id => {
    const updated = storageService.toggleReminder(id);
    refreshReminders();
    if (updated) {
      showTemporaryFeedback(
        updated.enabled ? 'Reminder turned on.' : 'Reminder paused.'
      );
    }
  };

  const handleResetDefaults = () => {
    storageService.resetReminders();
    refreshReminders();
    showTemporaryFeedback('Reset to default daily reminders.');
  };

  const handleRequestNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
    if (result === 'granted') {
      showTemporaryFeedback('Browser notifications enabled.');
    } else if (result === 'denied') {
      showTemporaryFeedback('Notifications were declined. In-app alerts will continue to work.');
    }
  };

  const missedList = getMissedReminders(reminders);

  const sortedReminders = [...reminders].sort((a, b) => {
    const [hA, mA] = (a.time || '00:00').split(':').map(Number);
    const [hB, mB] = (b.time || '00:00').split(':').map(Number);
    return (hA * 60 + mA) - (hB * 60 + mB);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header Card with Quick Actions */}
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
              My Daily Reminders
            </h2>
            <span className="badge badge-accent">
              {reminders.filter(r => r.enabled).length} Active
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
            Helpful notes for hydration, rest, and daily routines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <BigButton
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<AccessibleIcon name="plus" size={16} />}
            ariaLabel="Add a new reminder"
          >
            Add Reminder
          </BigButton>

          {notificationPermission === 'default' && (
            <BigButton
              variant="secondary"
              size="sm"
              onClick={handleRequestNotifications}
              icon={<AccessibleIcon name="bell" size={16} />}
              ariaLabel="Enable browser notifications"
            >
              Enable Alerts
            </BigButton>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            aria-label="Reset to default daily reminders"
            style={{
              padding: '6px 12px',
              minHeight: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-xs)',
              fontWeight: '600'
            }}
          >
            Defaults
          </button>
        </div>
      </section>

      {/* Temporary feedback banner */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '8px 14px',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-border)',
            fontSize: 'var(--font-sm)',
            fontWeight: '600',
            textAlign: 'center'
          }}
        >
          {feedbackMessage}
        </div>
      )}

      {/* 2. Reminders List */}
      <section aria-labelledby="reminders-list-heading">
        {sortedReminders.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: '36px 20px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You do not have any reminders set right now.
            </p>
            <BigButton variant="primary" size="md" onClick={handleOpenAdd}>
              Create Your First Reminder
            </BigButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedReminders.map(rem => {
              const meta = getCategoryMeta(rem.category);
              const isEnabled = rem.enabled;

              return (
                <div
                  key={rem.id}
                  className="card-base"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    opacity: isEnabled ? 1 : 0.65,
                    border: isEnabled ? '1px solid var(--border-color)' : '1px dashed var(--border-color)'
                  }}
                >
                  {/* Left: Time, Category Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 280px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--accent-soft)',
                        color: meta.color || 'var(--accent-color)',
                        border: '1px solid var(--accent-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      aria-hidden="true"
                    >
                      <AccessibleIcon name={meta.icon || 'bell'} size={22} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 'var(--font-base)',
                            fontWeight: '700',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {formatTimeDisplay(rem.time)}
                        </span>

                        <span className="badge badge-neutral" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                          {meta.label}
                        </span>

                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          • {rem.recurrence === 'once' ? 'Today Only' : 'Every Day'}
                        </span>

                        {missedList.some(m => m.id === rem.id) && (
                          <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                            Earlier today
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 'var(--font-sm)',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          marginTop: '2px'
                        }}
                      >
                        {rem.title}
                      </div>

                      {rem.snoozedUntil && new Date(rem.snoozedUntil) > new Date() && (
                        <div
                          style={{
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: 'var(--font-xs)',
                            color: 'var(--warning-color)',
                            fontWeight: '600'
                          }}
                        >
                          <span>Snoozed until {new Date(rem.snoozedUntil).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                          <button
                            type="button"
                            onClick={() => {
                              storageService.dismissReminder(rem.id);
                              refreshReminders();
                              showTemporaryFeedback('Snooze cleared.');
                            }}
                            style={{
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--warning-border)',
                              backgroundColor: 'var(--warning-soft)',
                              color: 'var(--warning-color)',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600',
                              minHeight: '24px'
                            }}
                          >
                            Clear Snooze
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(rem.id)}
                      aria-label={isEnabled ? `Pause reminder: ${rem.title}` : `Turn on reminder: ${rem.title}`}
                      style={{
                        padding: '6px 12px',
                        minHeight: '36px',
                        borderRadius: 'var(--radius-sm)',
                        border: isEnabled ? '1px solid var(--success-border)' : '1px solid var(--border-color)',
                        backgroundColor: isEnabled ? 'var(--success-soft)' : 'var(--bg-surface-elevated)',
                        color: isEnabled ? 'var(--success-color)' : 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: 'var(--font-xs)'
                      }}
                    >
                      {isEnabled ? 'Active' : 'Paused'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rem)}
                      aria-label={`Edit reminder: ${rem.title}`}
                      style={{
                        padding: '6px 10px',
                        minHeight: '36px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AccessibleIcon name="edit" size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(rem.id)}
                      aria-label={`Delete reminder: ${rem.title}`}
                      style={{
                        padding: '6px 10px',
                        minHeight: '36px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--danger-border)',
                        backgroundColor: 'var(--danger-soft)',
                        color: 'var(--danger-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AccessibleIcon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Non-Clinical Disclaimer */}
      <footer
        style={{
          padding: '12px',
          textAlign: 'center',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
          lineHeight: '1.4',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <p style={{ margin: 0 }}>
          {NON_CLINICAL_DISCLAIMER}
        </p>
      </footer>

      {/* Reminder Add/Edit Form Modal */}
      <ReminderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReminder}
        initialData={editingReminder}
      />
    </div>
  );
}
