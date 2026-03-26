import { db, CalendarItem, RepeatRule, Reminder } from './db';

// ── Helpers ──────────────────────────────────────────────────────────────────

const toFilenameTimestamp = (d: Date): string => {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return (
    String(d.getFullYear()) +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) + '_' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
};

// CalendarItem (web/camelCase) → JSON item (Unity/PascalCase)
const toJsonItem = (event: CalendarItem): Record<string, unknown> => {
  const entry: Record<string, unknown> = {
    Id:       event.id,
    Type:     event.type,
    Title:    event.title,
    Note:     event.note ?? '',
    StartUtc: new Date(event.startMs).toISOString(),
    EndUtc:   new Date(event.endMs).toISOString(),
    AllDay:   event.allDay ?? false,
    Color:    event.color ?? 'transparent',
  };
  if (event.repeat) {
    entry.RepeatRule = {
      Interval: event.repeat.interval,
      Unit:     event.repeat.unit,
      ...(event.repeat.until !== undefined && {
        Until: new Date(event.repeat.until).toISOString(),
      }),
    };
  }
  if (event.reminders?.length) {
    entry.Reminders = event.reminders.map(r => ({ OffsetSeconds: r.offsetSeconds }));
  }
  return entry;
};

// JSON item (Unity/PascalCase) → CalendarItem (web/camelCase)
const fromJsonItem = (item: any) => ({
  id:        item.Id,
  type:      item.Type,
  title:     item.Title      ?? '',
  note:      item.Note       ?? '',
  allDay:    item.AllDay     ?? false,
  color:     item.Color      ?? 'transparent',
  startMs:   new Date(item.StartUtc).getTime(),
  endMs:     new Date(item.EndUtc).getTime(),
  repeat:    item.RepeatRule ? {
    interval: item.RepeatRule.Interval,
    unit:     item.RepeatRule.Unit,
    ...(item.RepeatRule.Until !== undefined && {
      until: new Date(item.RepeatRule.Until).getTime(),
    }),
  } : undefined,
  reminders: item.Reminders
    ? item.Reminders.map((r: any) => ({ offsetSeconds: r.OffsetSeconds }))
    : undefined,
});

// ── Export ────────────────────────────────────────────────────────────────────

export const exportEventsToJson = async () => {
  const allEvents = await db.events.toArray();
  const now = new Date();

  const payload = {
    Version: 1,
    Items: allEvents.map(toJsonItem),
  };

  const data = JSON.stringify(payload, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `LocalCalendar_Backup_${toFilenameTimestamp(now)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ── Import ────────────────────────────────────────────────────────────────────

export const importEventsFromJson = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (!json?.Items || !Array.isArray(json.Items)) {
          throw new Error("Invalid format: Expected { Version, Items }.");
        }

        await db.transaction('rw', db.events, async () => {
          await db.events.clear();
          const sanitized = json.Items.map(fromJsonItem);
          await db.events.bulkAdd(sanitized);
          resolve(sanitized.length);
        });
      } catch (err) {
        console.error("Import Error:", err);
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};
