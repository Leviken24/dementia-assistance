import { describe, it, expect, beforeEach } from 'vitest';
import {
  REMINDER_CATEGORIES,
  NON_CLINICAL_DISCLAIMER,
  getCategoryMeta,
  formatTimeDisplay,
  getGreetingForTime,
  formatDateOrientation,
  formatDayOrientation,
  validateReminder,
  getNextUpcomingReminder,
  checkDueReminders,
  getMissedReminders
} from '../src/services/reminderService.js';
import { storageService, DEFAULT_REMINDERS } from '../src/services/storageService.js';

describe('Phase 5 Verification: Daily Reminders & Gentle Orientation', () => {
  const store = {};

  beforeEach(() => {
    globalThis.localStorage = {
      getItem: key => store[key] || null,
      setItem: (key, val) => {
        store[key] = String(val);
      },
      removeItem: key => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(k => delete store[k]);
      }
    };
    globalThis.localStorage.clear();
    storageService.resetReminders();
  });

  describe('Non-Clinical Boundaries & Safeguards', () => {
    it('guarantees medication reminders contain non-clinical schedule-only disclaimers', () => {
      const medCat = getCategoryMeta('medication');
      expect(medCat).toBeDefined();
      expect(medCat.disclaimer).toBeDefined();
      expect(medCat.disclaimer.toLowerCase()).toContain('does not provide medical advice');
      expect(medCat.disclaimer.toLowerCase()).toContain('verify dosage');
    });

    it('acknowledging a reminder strictly logs an interaction timestamp without asserting clinical task completion', () => {
      const ackTimestamp = '2026-10-18T10:05:00.000Z';
      const updated = storageService.acknowledgeReminder('rem_starter_water', ackTimestamp);
      expect(updated.lastAcknowledged).toBe(ackTimestamp);
      // Ensure no medical or diagnostic fields were added
      expect(updated.completedClinical).toBeUndefined();
      expect(updated.dosageTaken).toBeUndefined();
      expect(updated.complianceScore).toBeUndefined();
    });

    it('ensures global disclaimer text is non-punitive and adult-respectful', () => {
      expect(NON_CLINICAL_DISCLAIMER).toMatch(/personal notes/i);
      expect(NON_CLINICAL_DISCLAIMER).toMatch(/do not provide clinical guidance/i);
    });
  });

  describe('Orientation Banner Mechanics', () => {
    it('returns respectful temporal greetings across the full day cycle', () => {
      expect(getGreetingForTime(new Date('2026-10-18T05:00:00'))).toBe('Good morning');
      expect(getGreetingForTime(new Date('2026-10-18T11:59:00'))).toBe('Good morning');
      expect(getGreetingForTime(new Date('2026-10-18T12:00:00'))).toBe('Good afternoon');
      expect(getGreetingForTime(new Date('2026-10-18T16:59:00'))).toBe('Good afternoon');
      expect(getGreetingForTime(new Date('2026-10-18T17:00:00'))).toBe('Good evening');
      expect(getGreetingForTime(new Date('2026-10-18T23:59:00'))).toBe('Good evening');
    });

    it('formats date and day orientation consistently without locale throwing', () => {
      const sample = new Date(2026, 9, 18, 14, 0); // October 18, 2026
      expect(formatDayOrientation(sample)).toBe('Sunday');
      expect(formatDateOrientation(sample)).toContain('Sunday');
      expect(formatDateOrientation(sample)).toContain('October 18');
      expect(formatDateOrientation(sample)).toContain('2026');
    });

    it('correctly predicts the next upcoming reminder when multiple reminders are configured', () => {
      const reminders = [
        { id: 'rem_1', title: 'Breakfast Tea', time: '08:30', category: 'water', enabled: true },
        { id: 'rem_2', title: 'Mid-Morning Water', time: '10:30', category: 'water', enabled: true },
        { id: 'rem_3', title: 'Lunch Routine', time: '13:00', category: 'routine', enabled: true },
        { id: 'rem_4', title: 'Afternoon Rest', time: '15:00', category: 'rest', enabled: true }
      ];

      // At 10:00 AM, next is Mid-Morning Water
      const at1000 = new Date(2026, 9, 18, 10, 0);
      const next1000 = getNextUpcomingReminder(reminders, at1000);
      expect(next1000.reminder.id).toBe('rem_2');
      expect(next1000.isToday).toBe(true);
      expect(next1000.minutesUntil).toBe(30);

      // At 13:00 (exact time), next is Lunch Routine
      const at1300 = new Date(2026, 9, 18, 13, 0);
      const next1300 = getNextUpcomingReminder(reminders, at1300);
      expect(next1300.reminder.id).toBe('rem_3');
      expect(next1300.minutesUntil).toBe(0);

      // At 16:00 (after last reminder), rolls over to Breakfast Tea tomorrow
      const at1600 = new Date(2026, 9, 18, 16, 0);
      const nextTomorrow = getNextUpcomingReminder(reminders, at1600);
      expect(nextTomorrow.reminder.id).toBe('rem_1');
      expect(nextTomorrow.isToday).toBe(false);
      expect(nextTomorrow.minutesUntil).toBe((8 * 60) + (8 * 60 + 30)); // 8h remaining today + 8.5h tomorrow = 990 mins
    });
  });

  describe('Reminder Scheduling & Snooze Behavior', () => {
    it('detects due reminder matching current local minute', () => {
      const now = new Date(2026, 9, 18, 14, 30, 15);
      const reminders = [
        { id: 'r1', title: 'Rest', time: '14:30', enabled: true },
        { id: 'r2', title: 'Water', time: '15:00', enabled: true }
      ];

      const due = checkDueReminders(reminders, now);
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe('r1');
    });

    it('handles multiple reminders set for the exact same time', () => {
      const now = new Date(2026, 9, 18, 10, 0, 0);
      const reminders = [
        { id: 'r1', title: 'Morning Water', time: '10:00', enabled: true },
        { id: 'r2', title: 'Morning Drops', time: '10:00', enabled: true, category: 'medication' }
      ];

      const due = checkDueReminders(reminders, now);
      expect(due).toHaveLength(2);
      expect(due.map(r => r.id)).toEqual(['r1', 'r2']);
    });

    it('respects snoozing by postponing until snooze timestamp passes', () => {
      const now = new Date(2026, 9, 18, 10, 0, 0);
      const futureSnooze = new Date(2026, 9, 18, 10, 10, 0).toISOString();
      const reminders = [
        { id: 'r1', title: 'Water', time: '10:00', enabled: true, snoozedUntil: futureSnooze }
      ];

      // At 10:00, it is snoozed, so it should not trigger
      expect(checkDueReminders(reminders, now)).toHaveLength(0);

      // At 10:05, still snoozed
      const at1005 = new Date(2026, 9, 18, 10, 5, 0);
      expect(checkDueReminders(reminders, at1005)).toHaveLength(0);

      // At 10:10, snooze has expired, so it triggers
      const at1010 = new Date(2026, 9, 18, 10, 10, 0);
      expect(checkDueReminders(reminders, at1010)).toHaveLength(1);
    });
  });

  describe('Form Validation & CRUD Robustness', () => {
    it('validates and creates a custom reminder across every approved category', () => {
      for (const cat of REMINDER_CATEGORIES) {
        const payload = {
          title: `Test ${cat.label}`,
          time: '11:15',
          category: cat.id
        };
        const val = validateReminder(payload);
        expect(val.isValid).toBe(true);
        expect(val.sanitized.category).toBe(cat.id);

        const saved = storageService.saveReminder(val.sanitized);
        expect(saved.id).toBeDefined();
        expect(saved.title).toBe(`Test ${cat.label}`);
      }

      // Check all 6 were added to storage (in addition to 3 defaults = 9 total)
      const all = storageService.getReminders();
      expect(all.length).toBe(DEFAULT_REMINDERS.length + 6);
    });
  });

  describe('One-Time vs Daily Recurrence', () => {
    it('does not roll over one-time reminders to tomorrow if today has passed', () => {
      const reminders = [
        { id: 'rem_once', title: 'Doctor Visit', time: '11:00', recurrence: 'once', enabled: true },
        { id: 'rem_daily', title: 'Daily Water', time: '09:00', recurrence: 'daily', enabled: true }
      ];

      // At 12:00 PM, both 9:00 and 11:00 have passed today
      const now = new Date(2026, 9, 18, 12, 0, 0);
      const next = getNextUpcomingReminder(reminders, now);

      // Tomorrow earliest should be the daily reminder, NOT the one-time reminder
      expect(next).not.toBeNull();
      expect(next.reminder.id).toBe('rem_daily');
      expect(next.isToday).toBe(false);
    });

    it('returns null if only one-time reminders exist and have all passed today', () => {
      const reminders = [
        { id: 'rem_once', title: 'Doctor Visit', time: '11:00', recurrence: 'once', enabled: true }
      ];
      const now = new Date(2026, 9, 18, 12, 0, 0);
      expect(getNextUpcomingReminder(reminders, now)).toBeNull();
    });

    it('automatically disables one-time reminders upon acknowledgement', () => {
      const created = storageService.saveReminder({
        title: 'Neighbor Visit',
        time: '15:00',
        category: 'call',
        recurrence: 'once'
      });
      expect(created.enabled).toBe(true);

      const acked = storageService.acknowledgeReminder(created.id);
      expect(acked.enabled).toBe(false);

      // Verify in storage
      const fetched = storageService.getReminders().find(r => r.id === created.id);
      expect(fetched.enabled).toBe(false);
    });

    it('automatically disables one-time reminders upon dismissal', () => {
      const created = storageService.saveReminder({
        title: 'Special Event',
        time: '16:00',
        category: 'activity',
        recurrence: 'once'
      });
      expect(created.enabled).toBe(true);

      const dismissed = storageService.dismissReminder(created.id);
      expect(dismissed.enabled).toBe(false);

      const fetched = storageService.getReminders().find(r => r.id === created.id);
      expect(fetched.enabled).toBe(false);
    });
  });

  describe('Dismissal & Duplicate Prevention', () => {
    it('prevents duplicate modal alerts in the same minute after dismissal', () => {
      const now = new Date(2026, 9, 18, 10, 0, 10);
      const reminders = [
        {
          id: 'rem_1',
          title: 'Morning Water',
          time: '10:00',
          enabled: true,
          lastDismissed: new Date(2026, 9, 18, 10, 0, 5).toISOString()
        }
      ];

      // Within the same 10:00 minute, it must not trigger again
      expect(checkDueReminders(reminders, now)).toHaveLength(0);
    });

    it('dismissing clears any active snoozedUntil timestamp', () => {
      const snoozed = storageService.snoozeReminder('rem_starter_water', 10);
      expect(snoozed.snoozedUntil).not.toBeNull();

      const dismissed = storageService.dismissReminder('rem_starter_water');
      expect(dismissed.snoozedUntil).toBeNull();
      expect(dismissed.lastDismissed).not.toBeNull();
    });
  });

  describe('Missed Reminders Detection', () => {
    it('detects unacknowledged and undismissed reminders from earlier today', () => {
      const reminders = [
        { id: 'rem_past', title: 'Breakfast Water', time: '08:00', enabled: true },
        { id: 'rem_future', title: 'Lunch Routine', time: '13:00', enabled: true },
        { id: 'rem_disabled', title: 'Disabled Walk', time: '07:00', enabled: false }
      ];

      const now = new Date(2026, 9, 18, 11, 0, 0); // 11:00 AM
      const missed = getMissedReminders(reminders, now);

      expect(missed).toHaveLength(1);
      expect(missed[0].id).toBe('rem_past');
    });

    it('does not flag reminders as missed if already acknowledged or dismissed today', () => {
      const todayIso = new Date(2026, 9, 18, 8, 5, 0).toISOString();
      const reminders = [
        { id: 'r1', title: 'Breakfast Water', time: '08:00', enabled: true, lastAcknowledged: todayIso },
        { id: 'r2', title: 'Morning Stretch', time: '08:30', enabled: true, lastDismissed: todayIso }
      ];

      const now = new Date(2026, 9, 18, 11, 0, 0);
      expect(getMissedReminders(reminders, now)).toHaveLength(0);
    });
  });

  describe('Total Reminder Deletion & Persistence', () => {
    it('maintains an empty list when all reminders are deleted, without resurrecting starters', () => {
      const initial = storageService.getReminders();
      expect(initial.length).toBeGreaterThan(0);

      // Delete all reminders
      for (const rem of initial) {
        storageService.deleteReminder(rem.id);
      }

      // getReminders() must now return [] and NOT auto-populate defaults
      const afterDelete = storageService.getReminders();
      expect(afterDelete).toEqual([]);

      // Resetting must explicitly restore default starters
      const restored = storageService.resetReminders();
      expect(restored.length).toBe(DEFAULT_REMINDERS.length);
    });
  });

  describe('Timezone & Clock Shifts (DST Awareness)', () => {
    it('formats times and dates consistently across arbitrary hours and shifts', () => {
      // Midnight transition
      expect(formatTimeDisplay('00:00')).toBe('12:00 AM');
      expect(formatTimeDisplay('23:59')).toBe('11:59 PM');
      expect(formatTimeDisplay('12:00')).toBe('12:00 PM');

      // Spring-forward / Fall-back DST simulated timestamps
      const springForward = new Date(2026, 2, 29, 2, 0); // March DST
      const fallBack = new Date(2026, 9, 25, 2, 0); // October DST
      expect(formatDateOrientation(springForward)).toContain('2026');
      expect(formatDateOrientation(fallBack)).toContain('2026');
    });
  });
});
