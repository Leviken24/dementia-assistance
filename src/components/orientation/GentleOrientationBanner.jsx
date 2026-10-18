import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import {
  getGreetingForTime,
  formatDateOrientation,
  formatTimeDisplay,
  getNextUpcomingReminder,
  getCategoryMeta
} from '../../services/reminderService.js';
import { storageService } from '../../services/storageService.js';

/**
 * GentleOrientationBanner
 * Provides live temporal orientation (greeting, full date, live clock) and the
 * immediate upcoming reminder in a balanced, compact, dignified layout.
 */
export function GentleOrientationBanner({ onManageReminders }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [reminders, setReminders] = useState(() => storageService.getReminders());

  // Refresh clock and reminder queue every 10 seconds to keep orientation current
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setReminders(storageService.getReminders());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Update reminders when storage or component updates
  useEffect(() => {
    const handleStorageChange = () => {
      setReminders(storageService.getReminders());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const greeting = getGreetingForTime(currentTime);
  const dateFormatted = formatDateOrientation(currentTime);
  const timeFormatted = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const nextUpcoming = getNextUpcomingReminder(reminders, currentTime);

  const nextCategoryMeta = nextUpcoming
    ? getCategoryMeta(nextUpcoming.reminder.category)
    : null;

  return (
    <section
      aria-label="Daily orientation and upcoming reminder"
      className="card-base"
      style={{
        padding: '16px 20px',
        marginBottom: '20px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        {/* Left: Greeting, Date & Live Clock */}
        <div style={{ flex: '1 1 280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-accent">
              <AccessibleIcon name="sun" size={14} />
              <span>{greeting}</span>
            </span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              • {timeFormatted}
            </span>
          </div>

          <h2
            style={{
              fontSize: 'var(--font-h2)',
              color: 'var(--text-primary)',
              margin: 0,
              fontWeight: '700',
              lineHeight: 1.2
            }}
          >
            {dateFormatted}
          </h2>
        </div>

        {/* Right: Next Scheduled Reminder */}
        <div
          style={{
            flex: '1 1 300px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                color: nextCategoryMeta ? nextCategoryMeta.color : 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-hidden="true"
            >
              <AccessibleIcon name={nextCategoryMeta ? nextCategoryMeta.icon : 'clock'} size={20} />
            </div>

            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>
                {nextUpcoming ? `Upcoming (${nextUpcoming.timeFormatted})` : 'Daily Reminder'}
              </div>
              <div
                style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}
              >
                {nextUpcoming ? nextUpcoming.reminder.title : 'All peaceful for today'}
              </div>
            </div>
          </div>

          {onManageReminders && (
            <button
              type="button"
              onClick={onManageReminders}
              aria-label="View and manage daily reminders"
              style={{
                fontSize: 'var(--font-xs)',
                fontWeight: '600',
                color: 'var(--accent-color)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                minHeight: '32px',
                whiteSpace: 'nowrap'
              }}
            >
              All Notes
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
