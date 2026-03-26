import { CalendarItem } from './db';
import { expandEvents } from '@/lib/recurrence';

// Module-level map so we can cancel scheduled timeouts on reschedule
const scheduledTimers = new Map<string, ReturnType<typeof setTimeout>>();

const requestPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

const scheduleNotification = (event: CalendarItem, offsetSeconds: number) => {
  const fireAtMs = event.startMs - offsetSeconds * 1000;
  const delayMs = fireAtMs - Date.now();

  // Don't schedule if it's already past
  if (delayMs <= 0) return;

  // Use event id + offset as a stable key so we can cancel/replace
  const key = `${event.id}-${offsetSeconds}`;

  // Cancel any existing timer for this event
  if (scheduledTimers.has(key)) {
    clearTimeout(scheduledTimers.get(key)!);
  }

  const timer = setTimeout(() => {
    new Notification(event.title, {
      body: offsetSeconds === 0
        ? 'Starting now'
        : `Starting ${formatOffset(offsetSeconds)}`,
      icon: '/icon.png', // swap for your app icon if you have one
      tag: key,          // prevents duplicate OS notifications for the same event
    });
    scheduledTimers.delete(key);
  }, delayMs);

  scheduledTimers.set(key, timer);
};

const formatOffset = (seconds: number): string => {
  if (seconds < 3600) return `in ${seconds / 60} minutes`;
  if (seconds < 86400) return `in ${seconds / 3600} hour(s)`;
  return `in ${seconds / 86400} day(s)`;
};

export const scheduleAllNotifications = async (events: CalendarItem[]) => {
  const granted = await requestPermission();
  if (!granted) return;

  // Clear all existing timers before rescheduling
  scheduledTimers.forEach(timer => clearTimeout(timer));
  scheduledTimers.clear();

  // One-week lookahead. setTimeout with a multi-day delay is unreliable
  // (browsers throttle or drop them on sleep/suspend). A week seems like a reasonable window.
  const now = Date.now();
  const lookaheadMs = 7 * 24 * 60 * 60 * 1000; // 1 week lookahead

  // Expand recurring events within the lookahead window
  const expanded = expandEvents(events, now, now + lookaheadMs);

  expanded.forEach(event => {
    if (!event.reminders?.length) return;
    // Only schedule events within the lookahead window
    if (event.startMs < now || event.startMs > now + lookaheadMs) return;
    event.reminders.forEach(reminder => {
      scheduleNotification(event, reminder.offsetSeconds);
    });
  });
};
