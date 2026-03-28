import { importEventsFromJson, exportEventsToJson } from './data-transfer';
import { db } from './db';

const mockEvents = [
  {
    id: 'abc-123',
    type: 'event' as const,
    title: 'Test Event',
    note: 'A note',
    startMs: new Date('2026-03-01T10:00:00Z').getTime(),
    endMs:   new Date('2026-03-01T11:00:00Z').getTime(),
    allDay: false,
    color: 'transparent',
  }
];

const makeJsonFile = (payload: object) => {
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  return new File([blob], 'backup.json', { type: 'application/json' });
};

describe('importEventsFromJson', () => {
  beforeEach(() => jest.clearAllMocks());

  it('imports valid version-1 format', async () => {
    const payload = {
      Version: 1,
      Items: [{
        Id: 'abc-123',
        Type: 'event',
        Title: 'Test Event',
        Note: '',
        StartUtc: '2026-03-01T10:00:00Z',
        EndUtc:   '2026-03-01T11:00:00Z',
        AllDay: false,
        Color: 'transparent',
      }],
    };
    const count = await importEventsFromJson(makeJsonFile(payload));
    expect(count).toBe(1);
    expect(db.events.clear).toHaveBeenCalled();
    expect(db.events.bulkAdd).toHaveBeenCalled();
  });

  it('converts PascalCase keys to camelCase', async () => {
    const payload = {
      Version: 1,
      Items: [{
        Id: 'xyz-456',
        Type: 'event',
        Title: 'Converted',
        Note: 'note',
        StartUtc: '2026-03-01T09:00:00Z',
        EndUtc:   '2026-03-01T10:00:00Z',
        AllDay: true,
        Color: 'blue',
      }],
    };
    await importEventsFromJson(makeJsonFile(payload));
    const [items] = (db.events.bulkAdd as jest.Mock).mock.calls[0];
    expect(items[0]).toMatchObject({
      id: 'xyz-456',
      title: 'Converted',
      allDay: true,
    });
  });

  it('correctly converts UTC strings to ms timestamps', async () => {
    const payload = {
      Version: 1,
      Items: [{
        Id: 'ts-test',
        Type: 'event',
        Title: 'Timestamp Test',
        Note: '',
        StartUtc: '2026-03-01T10:00:00Z',
        EndUtc:   '2026-03-01T11:00:00Z',
        AllDay: false,
        Color: 'transparent',
      }],
    };
    await importEventsFromJson(makeJsonFile(payload));
    const [items] = (db.events.bulkAdd as jest.Mock).mock.calls[0];
    expect(items[0].startMs).toBe(new Date('2026-03-01T10:00:00Z').getTime());
    expect(items[0].endMs).toBe(new Date('2026-03-01T11:00:00Z').getTime());
  });

  it('rejects invalid format', async () => {
    const file = makeJsonFile({ garbage: true });
    await expect(importEventsFromJson(file)).rejects.toThrow();
  });

  it('imports reminders and repeat rules', async () => {
    const payload = {
      Version: 1,
      Items: [{
        Id: 'repeat-1',
        Type: 'event',
        Title: 'Repeating',
        Note: '',
        StartUtc: '2026-03-01T10:00:00Z',
        EndUtc:   '2026-03-01T11:00:00Z',
        AllDay: false,
        Color: 'transparent',
        RepeatRule: { Interval: 1, Unit: 'week' },
        Reminders: [{ OffsetSeconds: 600 }],
      }],
    };
    await importEventsFromJson(makeJsonFile(payload));
    const [items] = (db.events.bulkAdd as jest.Mock).mock.calls[0];
    expect(items[0].repeat).toEqual({ interval: 1, unit: 'week' });
    expect(items[0].reminders).toEqual([{ offsetSeconds: 600 }]);
  });
});
