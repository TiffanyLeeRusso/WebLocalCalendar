import { expandEvents } from './recurrence';
import { CalendarItem } from './db';

const makeEvent = (overrides: Partial<CalendarItem> = {}): CalendarItem => ({
  id: 'evt-1',
  type: 'event',
  title: 'Test Event',
  note: '',
  startMs: new Date('2026-03-01T10:00:00').getTime(),
  endMs:   new Date('2026-03-01T11:00:00').getTime(),
  allDay: false,
  ...overrides,
});

const rangeStart = new Date('2026-03-01').getTime();
const rangeEnd   = new Date('2026-03-31T23:59:59').getTime();

describe('expandEvents', () => {
  describe('non-recurring events', () => {
    it('includes an event within the range', () => {
      const event = makeEvent();
      const result = expandEvents([event], rangeStart, rangeEnd);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('evt-1');
    });

    it('excludes an event outside the range', () => {
      const event = makeEvent({
        startMs: new Date('2026-04-05T10:00:00').getTime(),
        endMs:   new Date('2026-04-05T11:00:00').getTime(),
      });
      const result = expandEvents([event], rangeStart, rangeEnd);
      expect(result).toHaveLength(0);
    });

    it('includes a multi-day event that spans the range boundary', () => {
      const event = makeEvent({
        startMs: new Date('2026-02-28T10:00:00').getTime(),
        endMs:   new Date('2026-03-02T10:00:00').getTime(),
      });
      const result = expandEvents([event], rangeStart, rangeEnd);
      expect(result).toHaveLength(1);
    });
  });

  describe('daily recurrence', () => {
    it('generates daily occurrences within range', () => {
      const event = makeEvent({
        repeat: { interval: 1, unit: 'day' },
      });
      const result = expandEvents([event], rangeStart, rangeEnd);
      // Master + 30 occurrences for rest of March
      expect(result.length).toBe(31);
    });

    it('respects the until date', () => {
      const event = makeEvent({
        repeat: {
          interval: 1,
          unit: 'day',
          until: new Date('2026-03-05T23:59:59').getTime(),
        },
      });
      const result = expandEvents([event], rangeStart, rangeEnd);
      expect(result.length).toBe(5); // Mar 1–5
    });

    it('generates occurrences with unique ids', () => {
      const event = makeEvent({ repeat: { interval: 1, unit: 'day' } });
      const result = expandEvents([event], rangeStart, rangeEnd);
      const ids = result.map(e => e.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('weekly recurrence', () => {
    it('generates weekly occurrences', () => {
      const event = makeEvent({ repeat: { interval: 1, unit: 'week' } });
      const result = expandEvents([event], rangeStart, rangeEnd);
      // Mar 1, 8, 15, 22, 29 = 5
      expect(result.length).toBe(5);
    });

    it('respects interval > 1', () => {
      const event = makeEvent({ repeat: { interval: 2, unit: 'week' } });
      const result = expandEvents([event], rangeStart, rangeEnd);
      // Mar 1, 15, 29 = 3
      expect(result.length).toBe(3);
    });
  });

  describe('monthly recurrence', () => {
    it('generates one occurrence per month', () => {
      const event = makeEvent({
        startMs: new Date('2026-01-01T10:00:00').getTime(),
        endMs:   new Date('2026-01-01T11:00:00').getTime(),
        repeat: { interval: 1, unit: 'month' },
      });
      const result = expandEvents([event], rangeStart, rangeEnd);
      expect(result.length).toBe(1); // only March falls in range
      expect(new Date(result[0].startMs).getMonth()).toBe(2); // March
    });
  });

  describe('yearly recurrence', () => {
    it('generates a yearly occurrence', () => {
      const event = makeEvent({
        startMs: new Date('2025-03-15T10:00:00').getTime(),
        endMs:   new Date('2025-03-15T11:00:00').getTime(),
        repeat: { interval: 1, unit: 'year' },
      });
      const result = expandEvents([event], rangeStart, rangeEnd);
      expect(result.length).toBe(1);
      expect(new Date(result[0].startMs).getFullYear()).toBe(2026);
    });
  });

  describe('edge cases', () => {
    it('handles interval of 0 without infinite loop', () => {
      const event = makeEvent({ repeat: { interval: 0, unit: 'day' } });
      const result = expandEvents([event], rangeStart, rangeEnd);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array for empty input', () => {
      expect(expandEvents([], rangeStart, rangeEnd)).toEqual([]);
    });
  });
});
