/**
 * reminderService.js
 * Headless scheduler, time formatting, recurrence logic, and non-clinical validation.
 * Adheres strictly to non-diagnostic boundaries: medication alerts are schedule-only
 * labels with zero clinical or dosage claims.
 */

export const REMINDER_CATEGORIES = [
  {
    id: 'water',
    label: 'Hydration & Water',
    icon: 'cup',
    defaultTitle: 'A Refreshing Glass of Water',
    description: 'A gentle reminder to drink water, herbal tea, or warm fluids.'
  },
  {
    id: 'rest',
    label: 'Rest & Relaxation',
    icon: 'leaf',
    defaultTitle: 'Peaceful Afternoon Rest',
    description: 'Take a calm pause, sit comfortably, and rest your eyes.'
  },
  {
    id: 'routine',
    label: 'Daily Routine',
    icon: 'sun',
    defaultTitle: 'Daily Morning Routine',
    description: 'Time for your morning stretch, washing hands, or daily routine.'
  },
  {
    id: 'activity',
    label: 'Scheduled Activity',
    icon: 'bloom',
    defaultTitle: 'A Calm Evening Walk or Game',
    description: 'A pleasant time to enjoy a peaceful game, walk, or craft.'
  },
  {
    id: 'call',
    label: 'Family & Loved Ones',
    icon: 'heart',
    defaultTitle: 'Call with Family or Friends',
    description: 'Time for a warm conversation or visit with family or neighbors.'
  },
  {
    id: 'medication',
    label: 'Medication Schedule',
    icon: 'pill',
    defaultTitle: 'Scheduled Daily Drops / Medication',
    description: 'Scheduled reminder time configured by you or your caregiver.',
    disclaimer: 'User-configured schedule reminder only. Does not provide medical advice or verify dosage.'
  }
];

export const NON_CLINICAL_DISCLAIMER =
  'Reminders are personal notes configured by you or your caregiver. They do not provide clinical guidance, prescription tracking, or medical advice.';

/**
 * Gets metadata for a given category ID with safe fallback.
 * @param {string} categoryId
 * @returns {Object}
 */
export function getCategoryMeta(categoryId) {
  const found = REMINDER_CATEGORIES.find(c => c.id === categoryId);
  return found || REMINDER_CATEGORIES[2]; // Default to 'routine'
}

/**
 * Formats a 24-hour "HH:mm" time string into a friendly readable string.
 * @param {string} timeStr - "HH:mm"
 * @param {boolean} use24Hour - If true, formats as "HH:mm"
 * @returns {string} E.g., "10:30 AM" or "2:15 PM"
 */
export function formatTimeDisplay(timeStr, use24Hour = false) {
  if (!timeStr || typeof timeStr !== 'string') return '--:--';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const paddedMin = minutes < 10 ? '0' + minutes : String(minutes);

  if (use24Hour) {
    const paddedHours = hours < 10 ? '0' + hours : String(hours);
    return `${paddedHours}:${paddedMin}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${paddedMin} ${period}`;
}

/**
 * Returns a warm, non-confrontational greeting based on the hour.
 * @param {Date} date
 * @returns {string} E.g., "Good morning", "Good afternoon", "Good evening"
 */
export function getGreetingForTime(date = new Date()) {
  const hours = date.getHours();
  if (hours < 12) return 'Good morning';
  if (hours < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Formats a date into a respectful, clear orientation string.
 * @param {Date} date
 * @returns {string} E.g., "Saturday, October 18, 2026"
 */
export function formatDateOrientation(date = new Date()) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();

  return `${dayName}, ${monthName} ${dayNum}, ${year}`;
}

/**
 * Formats just the day of the week.
 * @param {Date} date
 * @returns {string}
 */
export function formatDayOrientation(date = new Date()) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Validates a reminder input payload.
 * @param {Object} input - { title, time, category }
 * @returns {{ isValid: boolean, errors: Array<string>, sanitized: Object }}
 */
export function validateReminder(input) {
  const errors = [];
  if (!input || typeof input !== 'object') {
    return { isValid: false, errors: ['Reminder data is required.'], sanitized: null };
  }

  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title) {
    errors.push('Please provide a gentle title or description for the reminder.');
  } else if (title.length > 80) {
    errors.push('Title must be 80 characters or fewer.');
  }

  const time = typeof input.time === 'string' ? input.time.trim() : '';
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    errors.push('Please enter a valid time in HH:mm format (00:00 to 23:59).');
  }

  const category = input.category;
  const validCategoryIds = REMINDER_CATEGORIES.map(c => c.id);
  if (!validCategoryIds.includes(category)) {
    errors.push('Please select an approved reminder category.');
  }

  const sanitized = {
    title,
    time,
    category: validCategoryIds.includes(category) ? category : 'routine',
    recurrence: input.recurrence === 'once' ? 'once' : 'daily',
    days: Array.isArray(input.days) && input.days.length > 0 ? input.days : ['daily'],
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : true
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
}

/**
 * Finds the immediate next upcoming active reminder relative to referenceDate.
 * Looks for the next one today; if none remain today, picks the earliest tomorrow (daily recurring only).
 * One-time reminders that have passed today do not roll over to tomorrow.
 * @param {Array<Object>} reminders
 * @param {Date} referenceDate
 * @returns {{ reminder: Object, isToday: boolean, minutesUntil: number } | null}
 */
export function getNextUpcomingReminder(reminders, referenceDate = new Date()) {
  if (!Array.isArray(reminders)) return null;

  const activeReminders = reminders.filter(r => r && r.enabled);
  if (activeReminders.length === 0) return null;

  const currentHours = referenceDate.getHours();
  const currentMinutes = referenceDate.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // Map to minute offsets
  const parsed = activeReminders.map(r => {
    const [h, m] = (r.time || '00:00').split(':').map(Number);
    const totalMin = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    return { reminder: r, totalMin };
  });

  // Sort ascending by time
  parsed.sort((a, b) => a.totalMin - b.totalMin);

  // Look for first one today that hasn't passed
  const todayUpcoming = parsed.find(item => item.totalMin >= currentTotalMinutes);
  if (todayUpcoming) {
    return {
      reminder: todayUpcoming.reminder,
      isToday: true,
      minutesUntil: todayUpcoming.totalMin - currentTotalMinutes
    };
  }

  // All reminders for today have passed; roll over to tomorrow only for daily recurring ones
  const tomorrowEligible = parsed.filter(item => item.reminder.recurrence !== 'once');
  if (tomorrowEligible.length === 0) {
    return null; // All passed items were one-time only
  }

  const tomorrowEarliest = tomorrowEligible[0];
  const minutesUntilTomorrow = (24 * 60 - currentTotalMinutes) + tomorrowEarliest.totalMin;

  return {
    reminder: tomorrowEarliest.reminder,
    isToday: false,
    minutesUntil: minutesUntilTomorrow
  };
}

/**
 * Checks which active reminders are currently due.
 * A reminder is due if:
 * 1. It is enabled.
 * 2. EITHER:
 *    - Its time matches current "HH:mm" AND it has not already been acknowledged or dismissed this minute.
 *    - OR its snoozedUntil timestamp exists and is <= referenceDate AND not acknowledged/dismissed in the last 60s.
 * @param {Array<Object>} reminders
 * @param {Date} referenceDate
 * @returns {Array<Object>} Due reminder records
 */
export function checkDueReminders(reminders, referenceDate = new Date()) {
  if (!Array.isArray(reminders)) return [];

  const currentHours = referenceDate.getHours();
  const currentMinutes = referenceDate.getMinutes();
  const currentHH = currentHours < 10 ? '0' + currentHours : String(currentHours);
  const currentMM = currentMinutes < 10 ? '0' + currentMinutes : String(currentMinutes);
  const currentTimeString = `${currentHH}:${currentMM}`;
  const nowMs = referenceDate.getTime();

  return reminders.filter(r => {
    if (!r || !r.enabled) return false;

    // Check if snoozedUntil is reached
    if (r.snoozedUntil) {
      const snoozeMs = new Date(r.snoozedUntil).getTime();
      if (!isNaN(snoozeMs) && snoozeMs <= nowMs) {
        // If snooze is due, check if already dismissed or acknowledged in this minute
        if (r.lastAcknowledged) {
          const lastAckMs = new Date(r.lastAcknowledged).getTime();
          if (Math.abs(nowMs - lastAckMs) < 60000) return false;
        }
        if (r.lastDismissed) {
          const lastDismMs = new Date(r.lastDismissed).getTime();
          if (Math.abs(nowMs - lastDismMs) < 60000) return false;
        }
        return true;
      }
      return false; // Still snoozed
    }

    // Check standard scheduled time
    if (r.time === currentTimeString) {
      // Avoid firing repeatedly within the exact same minute if acknowledged
      if (r.lastAcknowledged) {
        const lastAck = new Date(r.lastAcknowledged);
        if (
          lastAck.getFullYear() === referenceDate.getFullYear() &&
          lastAck.getMonth() === referenceDate.getMonth() &&
          lastAck.getDate() === referenceDate.getDate() &&
          lastAck.getHours() === currentHours &&
          lastAck.getMinutes() === currentMinutes
        ) {
          return false;
        }
      }

      // Avoid firing repeatedly within the exact same minute if dismissed
      if (r.lastDismissed) {
        const lastDism = new Date(r.lastDismissed);
        if (
          lastDism.getFullYear() === referenceDate.getFullYear() &&
          lastDism.getMonth() === referenceDate.getMonth() &&
          lastDism.getDate() === referenceDate.getDate() &&
          lastDism.getHours() === currentHours &&
          lastDism.getMinutes() === currentMinutes
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  });
}

/**
 * Identifies active reminders that were scheduled earlier today and not acknowledged or dismissed.
 * @param {Array<Object>} reminders
 * @param {Date} referenceDate
 * @returns {Array<Object>}
 */
export function getMissedReminders(reminders, referenceDate = new Date()) {
  if (!Array.isArray(reminders)) return [];
  const currentTotalMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();

  return reminders.filter(r => {
    if (!r || !r.enabled) return false;
    const [h, m] = (r.time || '00:00').split(':').map(Number);
    const reminderTotalMinutes = (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);

    // Scheduled for earlier today
    if (reminderTotalMinutes < currentTotalMinutes) {
      // Check if acknowledged today
      if (r.lastAcknowledged) {
        const ack = new Date(r.lastAcknowledged);
        if (
          ack.getFullYear() === referenceDate.getFullYear() &&
          ack.getMonth() === referenceDate.getMonth() &&
          ack.getDate() === referenceDate.getDate()
        ) {
          return false;
        }
      }
      // Check if dismissed today
      if (r.lastDismissed) {
        const dism = new Date(r.lastDismissed);
        if (
          dism.getFullYear() === referenceDate.getFullYear() &&
          dism.getMonth() === referenceDate.getMonth() &&
          dism.getDate() === referenceDate.getDate()
        ) {
          return false;
        }
      }
      return true;
    }
    return false;
  });
}

/**
 * Requests browser Web Notifications permission.
 * Strictly user-initiated (e.g. on explicit button click in UI).
 * @returns {Promise<string>} 'granted' | 'denied' | 'default' | 'unsupported'
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await window.Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Sends a native Web Notification if permissions allow.
 * @param {string} title
 * @param {Object} options
 * @returns {boolean} True if sent
 */
export function sendBrowserNotification(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (window.Notification.permission === 'granted') {
    try {
      new window.Notification(title, {
        badge: '/favicon.ico',
        icon: '/favicon.ico',
        ...options
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
