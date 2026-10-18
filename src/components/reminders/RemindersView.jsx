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

  // Identify missed reminders from earlier today
  const missedList = getMissedReminders(reminders);

  // Sort reminders chronologically
  const sortedReminders = [...reminders].sort((a, b) => {
    const [hA, mA] = (a.time || '00:00').split(':').map(Number);
    const [hB, mB] = (b.time || '00:00').split(':').map(Number);
    return (hA * 60 + mA) - (hB * 60 + mB);
  });

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
      <section
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '2px solid var(--border-color)',
          padding: '28px 24px',
          marginBottom: '28px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
          aria-hidden="true"
        >
          <AccessibleIcon name="bell" size={32} />
        </div>

        <h2
          style={{
            fontSize: 'var(--font-h1)',
            color: 'var(--text-primary)',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}
        >
          My Daily Reminders
        </h2>

        <p
          style={{
            fontSize: 'var(--font-h3)',
            color: 'var(--text-secondary)',
            maxWidth: '620px',
            margin: '0 auto 20px auto',
            lineHeight: '1.5'
          }}
        >
          A friendly noticeboard to help you stay hydrated, take restful pauses, and enjoy your daily routine at your own pace.
        </p>

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <BigButton
            variant="primary"
            onClick={handleOpenAdd}
            icon={<AccessibleIcon name="plus" size={20} />}
            ariaLabel="Add a new reminder"
          >
            Add a Reminder
          </BigButton>

          {notificationPermission === 'default' && (
            <BigButton
              variant="secondary"
              onClick={handleRequestNotifications}
              icon={<AccessibleIcon name="bell" size={20} />}
              ariaLabel="Enable browser notifications"
            >
              Enable Browser Alerts
            </BigButton>
          )}

          {notificationPermission === 'granted' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                fontSize: 'calc(var(--font-base) * 0.9)',
                fontWeight: 'bold'
              }}
            >
              <AccessibleIcon name="check" size={20} />
              <span>Browser Alerts Active</span>
            </div>
          )}

          {notificationPermission === 'denied' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                fontSize: 'calc(var(--font-base) * 0.85)',
                fontWeight: '600'
              }}
            >
              <AccessibleIcon name="bell" size={18} />
              <span>Browser alerts blocked in settings (in-app alerts active)</span>
            </div>
          )}

          <BigButton
            variant="secondary"
            onClick={handleResetDefaults}
            icon={<AccessibleIcon name="refresh" size={18} />}
            ariaLabel="Reset to standard default reminders"
          >
            Restore Default Reminders
          </BigButton>
        </div>

        {feedbackMessage && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginTop: '16px',
              padding: '10px 16px',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              borderRadius: '10px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            {feedbackMessage}
          </div>
        )}
      </section>

      {/* Reminders List */}
      <section aria-labelledby="reminders-list-heading" style={{ marginBottom: '32px' }}>
        <h3
          id="reminders-list-heading"
          style={{
            fontSize: 'var(--font-h2)',
            color: 'var(--text-primary)',
            marginBottom: '16px',
            fontWeight: 'bold'
          }}
        >
          Scheduled Daily Notes ({sortedReminders.length})
        </h3>

        {sortedReminders.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '2px solid var(--border-color)',
              padding: '36px',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: 'var(--font-h3)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You do not have any reminders set right now.
            </p>
            <BigButton variant="primary" onClick={handleOpenAdd}>
              Create Your First Reminder
            </BigButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedReminders.map(rem => {
              const meta = getCategoryMeta(rem.category);
              const isEnabled = rem.enabled;

              return (
                <div
                  key={rem.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '16px',
                    border: isEnabled
                      ? '2px solid var(--border-color)'
                      : '2px dashed var(--border-color)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    opacity: isEnabled ? 1 : 0.65,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Left: Icon, Category & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 280px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
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
                      <AccessibleIcon name={meta.icon || 'bell'} size={30} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 'calc(var(--font-base) * 0.85)',
                          color: 'var(--text-secondary)',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span style={{ textTransform: 'uppercase' }}>{meta.label}</span>
                        <span>•</span>
                        <span
                          style={{
                            color: rem.recurrence === 'once' ? '#9333EA' : 'var(--text-secondary)',
                            fontWeight: '600'
                          }}
                        >
                          {rem.recurrence === 'once' ? 'Today Only' : 'Every Day'}
                        </span>
                        {missedList.some(m => m.id === rem.id) && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#FEF3C7',
                              color: '#B45309',
                              fontSize: 'calc(var(--font-base) * 0.75)',
                              fontWeight: 'bold'
                            }}
                          >
                            Scheduled earlier today
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 'var(--font-h2)',
                          color: 'var(--text-primary)',
                          fontWeight: 'bold',
                          margin: '2px 0'
                        }}
                      >
                        {formatTimeDisplay(rem.time)}
                      </div>

                      <div
                        style={{
                          fontSize: 'var(--font-base)',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4'
                        }}
                      >
                        {rem.title}
                      </div>

                      {rem.category === 'medication' && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: 'calc(var(--font-base) * 0.8)',
                            color: '#1E40AF',
                            fontStyle: 'italic'
                          }}
                        >
                          User-configured schedule reminder
                        </div>
                      )}

                      {rem.snoozedUntil && new Date(rem.snoozedUntil) > new Date() && (
                        <div
                          style={{
                            marginTop: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: 'calc(var(--font-base) * 0.85)',
                            color: '#D97706',
                            fontWeight: 'bold'
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
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #D97706',
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              cursor: 'pointer',
                              fontSize: 'calc(var(--font-base) * 0.75)',
                              fontWeight: 'bold'
                            }}
                          >
                            Clear Snooze
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <button
                      onClick={() => handleToggleReminder(rem.id)}
                      aria-label={isEnabled ? `Pause reminder: ${rem.title}` : `Turn on reminder: ${rem.title}`}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: isEnabled ? '2px solid #059669' : '2px solid var(--border-color)',
                        backgroundColor: isEnabled ? '#D1FAE5' : 'var(--bg-surface-elevated, #fff)',
                        color: isEnabled ? '#065F46' : 'var(--text-secondary)',
                        fontWeight: 'bold',
                        fontSize: 'calc(var(--font-base) * 0.85)',
                        cursor: 'pointer'
                      }}
                    >
                      {isEnabled ? 'Active' : 'Paused'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(rem)}
                      aria-label={`Edit reminder: ${rem.title}`}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '2px solid var(--border-color)',
                        backgroundColor: 'var(--bg-surface-elevated, #fff)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: 'calc(var(--font-base) * 0.85)',
                        fontWeight: '600'
                      }}
                    >
                      <AccessibleIcon name="edit" size={18} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      aria-label={`Delete reminder: ${rem.title}`}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '2px solid #FCA5A5',
                        backgroundColor: '#FEF2F2',
                        color: '#991B1B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: 'calc(var(--font-base) * 0.85)',
                        fontWeight: '600'
                      }}
                    >
                      <AccessibleIcon name="trash" size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Non-Clinical Notice Card */}
      <section
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '16px',
          border: '1px solid #CBD5E1',
          padding: '20px',
          marginBottom: '32px'
        }}
        aria-label="Non-clinical information notice"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ color: '#475569', marginTop: '2px' }} aria-hidden="true">
            <AccessibleIcon name="lightbulb" size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '4px' }}>
              Notice on Personal & Medication Reminders
            </div>
            <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.9)', color: '#475569', lineHeight: '1.5' }}>
              {NON_CLINICAL_DISCLAIMER} Acknowledging a reminder is recorded only as a personal note that the notice was seen. It does not verify that medication was taken or that a physical task was performed.
            </p>
          </div>
        </div>
      </section>

      {/* Back to Home Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <BigButton variant="primary" onClick={onExit} icon={<AccessibleIcon name="home" size={20} />}>
          Return to Home Screen
        </BigButton>
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <ReminderFormModal
          reminder={editingReminder}
          onSave={handleSaveReminder}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}
