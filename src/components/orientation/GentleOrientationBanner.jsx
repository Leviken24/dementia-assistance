import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
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
 * Provides live temporal orientation (day, full date, live clock) and the
 * immediate upcoming reminder in a calm, non-confrontational design.
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
      aria-label="Daily orientation and next reminder"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '20px',
        border: '2px solid var(--border-color)',
        padding: '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        {/* Left Column: Greeting, Date & Live Clock */}
        <div style={{ flex: '1 1 300px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              fontSize: 'calc(var(--font-base) * 0.9)',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}
          >
            <AccessibleIcon name="sun" size={18} />
            <span>{greeting}</span>
          </div>

          <h2
            style={{
              fontSize: 'var(--font-h1)',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              fontWeight: 'bold',
              lineHeight: '1.2'
            }}
          >
            {dateFormatted}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: 'var(--font-h2)',
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}
            aria-label={`Current time: ${timeFormatted}`}
          >
            <AccessibleIcon name="clock" size={24} />
            <span>{timeFormatted}</span>
          </div>
        </div>

        {/* Right Column: Next Reminder Notice & Action */}
        <div
          style={{
            flex: '1 1 320px',
            backgroundColor: 'var(--bg-surface-elevated, #fbfbf9)',
            borderRadius: '16px',
            border: '2px solid var(--border-color)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div
              style={{
                fontSize: 'calc(var(--font-base) * 0.85)',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px'
              }}
            >
              {nextUpcoming
                ? nextUpcoming.isToday
                  ? 'Next Upcoming Today'
                  : 'Next Upcoming Tomorrow'
                : 'Upcoming Reminders'}
            </div>

            {nextUpcoming ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  aria-hidden="true"
                >
                  <AccessibleIcon name={nextCategoryMeta?.icon || 'bell'} size={24} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--font-h3)',
                      color: 'var(--text-primary)',
                      fontWeight: 'bold'
                    }}
                  >
                    {nextUpcoming.reminder.title}
                  </div>
                  <div
                    style={{
                      fontSize: 'calc(var(--font-base) * 0.9)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Scheduled for {formatTimeDisplay(nextUpcoming.reminder.time)}
                  </div>
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontSize: 'var(--font-base)',
                  color: 'var(--text-secondary)',
                  margin: 0
                }}
              >
                No active reminders for today. Enjoy your peaceful, comfortable day.
              </p>
            )}
          </div>

          <div style={{ alignSelf: 'flex-start' }}>
            <BigButton
              variant="secondary"
              onClick={onManageReminders}
              icon={<AccessibleIcon name="bell" size={20} />}
              ariaLabel="View and manage all daily reminders"
              style={{ padding: '8px 16px', minHeight: '44px', fontSize: 'calc(var(--font-base) * 0.9)' }}
            >
              My Daily Reminders
            </BigButton>
          </div>
        </div>
      </div>
    </section>
  );
}
