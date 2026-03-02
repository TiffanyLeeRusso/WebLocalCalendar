import { CalendarItem } from './db';

/**
 * Expands recurring events into a flat list of occurrences for a specific date range.
 */
export function expandEvents(events: CalendarItem[], startRangeMs: number, endRangeMs: number): CalendarItem[] {
  const occurrences: CalendarItem[] = [];

  events.forEach((event) => {
    // Always include the original master event if it's in range
    occurrences.push(event);

    // If no repeat rule, we are done with this event
    if (!event.repeat) return;

    const { interval, unit, until } = event.repeat;
    let currentStart = new Date(event.startMs);
    let currentEnd = new Date(event.endMs);
    const duration = event.endMs - event.startMs;

    // Safety: Determine the end of our expansion "loop"
    const expansionLimit = until ? Math.min(until, endRangeMs) : endRangeMs;

    // Keep generating occurrences until we hit the limit
    while (true) {
      // Advance the date based on the unit
      if (unit === 'day') currentStart.setDate(currentStart.getDate() + interval);
      else if (unit === 'week') currentStart.setDate(currentStart.getDate() + (7 * interval));
      else if (unit === 'month') currentStart.setMonth(currentStart.getMonth() + interval);
      else if (unit === 'year') currentStart.setFullYear(currentStart.getFullYear() + interval);

      const currentStartMs = currentStart.getTime();
      
      // Stop if we've passed the "until" date or the end of the current view range
      if (currentStartMs > expansionLimit) break;

      // Add this occurrence to our list
      occurrences.push({
        ...event,
        id: `${event.id}-occ-${currentStartMs}`, // Unique ID for React keys
        startMs: currentStartMs,
        endMs: currentStartMs + duration,
        isOccurrence: true, // Tag so we know it's a "ghost"
      } as any);
      
      // Safety break to prevent infinite loops if interval is 0
      if (interval <= 0) break;
    }
  });

  // Filter to ensure we only return events that actually fall within the requested range
  return occurrences.filter(occ => occ.startMs <= endRangeMs && occ.endMs >= startRangeMs);
}
