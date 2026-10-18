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
  checkDueReminders
} from '../src/services/reminderService.js';
import { storageService, DEFAULT_REMINDERS } from '../src/services/storageService.js';

describe('reminderService - Pure Functions & Logic', () => {
  describe('Constants & Category Metadata', () => {
    it('provides all 6 approved reminder categories with proper icons', () => {
      expect(REMINDER_CATEGORIES).toHaveLength(6);
      const ids = REMINDER_CATEGORIES.map(c => c.id);
      expect(ids).toEqual(['water', 'rest', 'routine', 'activity', 'call', 'medication']);
    });

    it('includes a non-clinical disclaimer for medication schedule', () => {
      const medCategory = REMINDER_CATEGORIES.find(c => c.id === 'medication');
      expect(medCategory).toBeDefined();
      expect(medCategory.disclaimer).toContain('User-configured schedule reminder only');
    });

    it('defines global NON_CLINICAL_DISCLAIMER', () => {
      expect(NON_CLINICAL_DISCLAIMER).toContain('do not provide clinical guidance');
    });

    it('getCategoryMeta returns matching category or falls back to routine', () => {
      const water = getCategoryMeta('water');
      expect(water.id).toBe('water');
      expect(water.icon).toBe('cup');

      const fallback = getCategoryMeta('non_existent');
      expect(fallback.id).toBe('routine');
    });
  });

  describe('formatTimeDisplay', () => {
    it('formats morning 24h string into 12-hour AM display', () => {
      expect(formatTimeDisplay('09:05')).toBe('9:05 AM');
      expect(formatTimeDisplay('00:00')).toBe('12:00 AM');
      expect(formatTimeDisplay('00:30')).toBe('12:30 AM');
    });

    it('formats afternoon 24h string into 12-hour PM display', () => {
      expect(formatTimeDisplay('12:00')).toBe('12:00 PM');
      expect(formatTimeDisplay('14:30')).toBe('2:30 PM');
      expect(formatTimeDisplay('23:59')).toBe('11:59 PM');
    });

    it('respects use24Hour flag', () => {
      expect(formatTimeDisplay('14:30', true)).toBe('14:30');
      expect(formatTimeDisplay('09:05', true)).toBe('09:05');
    });

    it('handles invalid or null inputs safely', () => {
      expect(formatTimeDisplay(null)).toBe('--:--');
      expect(formatTimeDisplay('')).toBe('--:--');
      expect(formatTimeDisplay('invalid')).toBe('invalid');
    });
  });

  describe('getGreetingForTime', () => {
    it('returns "Good morning" before 12:00', () => {
      const d = new Date('2026-10-18T08:30:00');
      expect(getGreetingForTime(d)).toBe('Good morning');
    });

    it('returns "Good afternoon" between 12:00 and 16:59', () => {
      const d = new Date('2026-10-18T13:45:00');
      expect(getGreetingForTime(d)).toBe('Good afternoon');
    });

    it('returns "Good evening" at or after 17:00', () => {
      const d = new Date('2026-10-18T18:15:00');
      expect(getGreetingForTime(d)).toBe('Good evening');
    });
  });

  describe('formatDateOrientation & formatDayOrientation', () => {
    it('formats full orientation date correctly', () => {
      // 2026-10-18 is Sunday
      const d = new Date(2026, 9, 18); // month index 9 = October
      const formatted = formatDateOrientation(d);
      expect(formatted).toBe('Sunday, October 18, 2026');
      expect(formatDayOrientation(d)).toBe('Sunday');
    });
  });

  describe('validateReminder', () => {
    it('validates a complete, legal reminder input', () => {
      const res = validateReminder({
        title: 'Morning Water',
        time: '09:00',
        category: 'water'
      });
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
      expect(res.sanitized.title).toBe('Morning Water');
      expect(res.sanitized.category).toBe('water');
      expect(res.sanitized.enabled).toBe(true);
    });

    it('rejects empty or whitespace-only title', () => {
      const res = validateReminder({
        title: '   ',
        time: '09:00',
        category: 'water'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('gentle title');
    });

    it('rejects overly long title (>80 chars)', () => {
      const longTitle = 'A'.repeat(81);
      const res = validateReminder({
        title: longTitle,
        time: '09:00',
        category: 'water'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('80 characters or fewer');
    });

    it('rejects invalid time formats', () => {
      expect(validateReminder({ title: 'Walk', time: '25:00', category: 'activity' }).isValid).toBe(false);
      expect(validateReminder({ title: 'Walk', time: '9:00', category: 'activity' }).isValid).toBe(false);
      expect(validateReminder({ title: 'Walk', time: '12:65', category: 'activity' }).isValid).toBe(false);
      expect(validateReminder({ title: 'Walk', time: 'invalid', category: 'activity' }).isValid).toBe(false);
    });

    it('rejects unapproved category', () => {
      const res = validateReminder({
        title: 'Test',
        time: '10:00',
        category: 'unapproved_category'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors[0]).toContain('approved reminder category');
    });
  });

  describe('getNextUpcomingReminder', () => {
    const sampleReminders = [
      { id: '1', title: 'Water', time: '10:00', enabled: true },
      { id: '2', title: 'Rest', time: '14:30', enabled: true },
      { id: '3', title: 'Walk', time: '17:00', enabled: true }
    ];

    it('finds the next reminder today when earlier than reminder time', () => {
      const ref = new Date(2026, 9, 18, 9, 30); // 09:30
      const next = getNextUpcomingReminder(sampleReminders, ref);
      expect(next).not.toBeNull();
      expect(next.reminder.id).toBe('1');
      expect(next.isToday).toBe(true);
      expect(next.minutesUntil).toBe(30);
    });

    it('finds afternoon reminder when morning has passed', () => {
      const ref = new Date(2026, 9, 18, 11, 0); // 11:00
      const next = getNextUpcomingReminder(sampleReminders, ref);
      expect(next).not.toBeNull();
      expect(next.reminder.id).toBe('2');
      expect(next.isToday).toBe(true);
      expect(next.minutesUntil).toBe(210); // 14:30 is 3.5h away = 210 mins
    });

    it('rolls over to tomorrow earliest when all today have passed', () => {
      const ref = new Date(2026, 9, 18, 18, 0); // 18:00
      const next = getNextUpcomingReminder(sampleReminders, ref);
      expect(next).not.toBeNull();
      expect(next.reminder.id).toBe('1'); // 10:00 tomorrow
      expect(next.isToday).toBe(false);
    });

    it('skips disabled reminders', () => {
      const disabledSample = [
        { id: '1', title: 'Water', time: '10:00', enabled: false },
        { id: '2', title: 'Rest', time: '14:30', enabled: true }
      ];
      const ref = new Date(2026, 9, 18, 9, 0);
      const next = getNextUpcomingReminder(disabledSample, ref);
      expect(next.reminder.id).toBe('2');
    });

    it('returns null if no enabled reminders or empty array', () => {
      expect(getNextUpcomingReminder([])).toBeNull();
      expect(getNextUpcomingReminder([{ id: '1', time: '10:00', enabled: false }])).toBeNull();
    });
  });

  describe('checkDueReminders', () => {
    it('detects a reminder due at the exact current minute', () => {
      const ref = new Date(2026, 9, 18, 10, 0); // 10:00
      const reminders = [
        { id: '1', title: 'Water', time: '10:00', enabled: true },
        { id: '2', title: 'Rest', time: '14:30', enabled: true }
      ];
      const due = checkDueReminders(reminders, ref);
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe('1');
    });

    it('does not trigger disabled reminders', () => {
      const ref = new Date(2026, 9, 18, 10, 0);
      const reminders = [{ id: '1', title: 'Water', time: '10:00', enabled: false }];
      expect(checkDueReminders(reminders, ref)).toHaveLength(0);
    });

    it('does not re-fire within same minute if acknowledged', () => {
      const ref = new Date(2026, 9, 18, 10, 0, 30);
      const ackTimestamp = new Date(2026, 9, 18, 10, 0, 5).toISOString();
      const reminders = [
        {
          id: '1',
          title: 'Water',
          time: '10:00',
          enabled: true,
          lastAcknowledged: ackTimestamp
        }
      ];
      expect(checkDueReminders(reminders, ref)).toHaveLength(0);
    });

    it('triggers a snoozed reminder once snooze timestamp has passed', () => {
      const ref = new Date(2026, 9, 18, 10, 15);
      const reminders = [
        {
          id: '1',
          title: 'Water',
          time: '10:00',
          enabled: true,
          snoozedUntil: new Date(2026, 9, 18, 10, 10).toISOString() // Snoozed until 10:10, now is 10:15
        }
      ];
      const due = checkDueReminders(reminders, ref);
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe('1');
    });
  });
});

describe('storageService - Reminders Integration', () => {
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

  it('initializes default starter reminders on clean storage', () => {
    const list = storageService.getReminders();
    expect(list).toHaveLength(DEFAULT_REMINDERS.length);
    expect(list[0].id).toBe('rem_starter_water');
  });

  it('saves and updates a new reminder record', () => {
    const created = storageService.saveReminder({
      title: 'Herbal Tea Time',
      time: '16:00',
      category: 'water'
    });

    expect(created).not.toBeNull();
    expect(created.id).toMatch(/^rem_/);
    expect(created.title).toBe('Herbal Tea Time');
    expect(created.time).toBe('16:00');
    expect(created.category).toBe('water');

    // Retrieve and verify presence
    const list = storageService.getReminders();
    const found = list.find(r => r.id === created.id);
    expect(found).toBeDefined();

    // Update existing
    const updated = storageService.saveReminder({
      ...created,
      title: 'Warm Chamomile Tea'
    });
    expect(updated.title).toBe('Warm Chamomile Tea');
    const listAfterUpdate = storageService.getReminders();
    expect(listAfterUpdate.find(r => r.id === created.id).title).toBe('Warm Chamomile Tea');
  });

  it('toggles reminder enabled status', () => {
    const item = storageService.toggleReminder('rem_starter_water');
    expect(item).not.toBeNull();
    expect(item.enabled).toBe(false);

    const toggledBack = storageService.toggleReminder('rem_starter_water');
    expect(toggledBack.enabled).toBe(true);
  });

  it('deletes a reminder by ID', () => {
    const beforeCount = storageService.getReminders().length;
    const afterList = storageService.deleteReminder('rem_starter_water');
    expect(afterList).toHaveLength(beforeCount - 1);
    expect(afterList.some(r => r.id === 'rem_starter_water')).toBe(false);
  });

  it('records user acknowledgement as a non-clinical interaction', () => {
    const ackTime = new Date().toISOString();
    const acked = storageService.acknowledgeReminder('rem_starter_water', ackTime);
    expect(acked.lastAcknowledged).toBe(ackTime);
    expect(acked.snoozedUntil).toBeNull();
  });

  it('snoozes a reminder for given minutes', () => {
    const snoozed = storageService.snoozeReminder('rem_starter_water', 15);
    expect(snoozed.snoozedUntil).not.toBeNull();
    const snoozeDiff = new Date(snoozed.snoozedUntil).getTime() - Date.now();
    expect(snoozeDiff).toBeGreaterThanOrEqual(14 * 60 * 1000);
    expect(snoozeDiff).toBeLessThanOrEqual(16 * 60 * 1000);
  });

  it('resets reminders back to default starter list', () => {
    storageService.deleteReminder('rem_starter_water');
    storageService.deleteReminder('rem_starter_rest');
    expect(storageService.getReminders()).toHaveLength(1);

    const reset = storageService.resetReminders();
    expect(reset).toHaveLength(DEFAULT_REMINDERS.length);
    expect(storageService.getReminders().some(r => r.id === 'rem_starter_water')).toBe(true);
  });
});
