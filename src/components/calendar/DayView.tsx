'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CalendarItem } from '@/lib/db';
import { useSettingsStore } from '@/store/useSettingsStore';

const HOUR_HEIGHT = 60;

export default function DayView({ onEdit }: { onEdit: (event: CalendarItem) => void }) {
  const { focusDate, timeFormat } = useSettingsStore();
  const [now, setNow] = useState(new Date());

  // Update the "Now" line every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // 60 seconds
    return () => clearInterval(timer);
  }, []);

  const isToday = now.toDateString() === new Date(focusDate).toDateString();
  
  const nowTop = now.getHours() * 60 + now.getMinutes();
  const nowTimeString = now.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: timeFormat === '12h' 
  });

  const events = useLiveQuery(async () => {
    const startOfDay = new Date(focusDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(focusDate);
    endOfDay.setHours(23, 59, 59, 999);

    const items = await db.events
      .where('startMs')
      .between(startOfDay.getTime(), endOfDay.getTime())
      .toArray();

    // Sort by start time, then duration
    return items.sort((a, b) => a.startMs - b.startMs || (b.endMs - b.startMs) - (a.endMs - a.startMs));
  }, [focusDate]);

  // Helper to calculate overlap groups
  const getPositionedEvents = (items: CalendarItem[]) => {
    const columns: CalendarItem[][] = [];
    const results: { event: CalendarItem; col: number; totalCols: number }[] = [];

    // Grouping into columns
    items.forEach((item) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        // If this item doesn't overlap with the last item in this column
        const lastInCol = columns[i][columns[i].length - 1];
        if (item.startMs >= lastInCol.endMs) {
          columns[i].push(item);
          results.push({ event: item, col: i, totalCols: 0 }); // totalCols updated later
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([item]);
        results.push({ event: item, col: columns.length - 1, totalCols: 0 });
      }
    });

    // Simple column count for width (improvement: cluster-based width)
    return results.map(r => ({ ...r, totalCols: columns.length }));
  };

  const positionedEvents = events ? getPositionedEvents(events) : [];

  const formatHour = (hour: number) => {
    if (timeFormat === '24h') return `${hour.toString().padStart(2, '0')}:00`;
    const h = hour % 12 || 12;
    return `${h} ${hour < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
      <div className="relative flex w-full" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
        
        {/* Hour Labels */}
        <div className="w-20 flex-none border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="h-[60px] text-[11px] text-right pr-3 pt-1 text-slate-400 font-bold tabular-nums">
              {formatHour(i)}
            </div>
          ))}
        </div>

        {/* Right: Event Canvas */}
          <div className="flex-1 relative mr-4">
          {/* Horizontal Hour Lines (Solid) */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={`hour-${i}`} 
              className="absolute w-full border-b border-slate-200 dark:border-slate-800" 
              style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                  />
          ))}

          {/* Half-Hour Lines (Dashed) */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={`half-hour-${i}`} 
              className="absolute w-full border-b border-dashed border-slate-200 dark:border-slate-800" 
              style={{ top: `${(i * HOUR_HEIGHT) + (HOUR_HEIGHT / 2)}px` }}
                  />
          ))}

          {/* Current Time Indicator */}
          {isToday && (
              <div className="absolute left-0 w-full z-40 pointer-events-none flex items-center"
              style={{ top: `${nowTop}px` }} >
              {/* Time and Triangle Label */}
                  <div className="absolute right-full mr-1 flex items-center group">
                  <span className="text-[10px] font-black text-fuchsia-700 whitespace-nowrap bg-white dark:bg-slate-900 px-1 rounded">
                  {nowTimeString}
              </span>
                  {/* Triangle pointing right */}
                  <div 
              className="w-0 h-0 
border-t-[6px] border-t-transparent 
border-l-[10px] border-l-fuchsia-700 
border-b-[6px] border-b-transparent"
                  />
                  </div>

                  {/* The actual line */}
                  <div className="flex-1 border-t-2 border-fuchsia-700" />
                  </div>
          )}

          {/* Positioned Events */}
          {positionedEvents.map(({ event, col, totalCols }) => {
            const date = new Date(event.startMs);
            const startMinutes = date.getHours() * 60 + date.getMinutes();
            const durationMinutes = Math.max(25, (event.endMs - event.startMs) / (1000 * 60));

            // Horizontal math
            const widthPct = 100 / totalCols;
            const leftPct = col * widthPct;

            return (
              <button
                key={event.id}
                onClick={() => onEdit(event)}
                style={{
                  top: `${startMinutes}px`,
                  height: `${durationMinutes}px`,
                  left: `${leftPct}%`,
                  width: `${widthPct - 1}%`, // -1% for a small gap between cards
                }}
                className="absolute p-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg border-l-4 border-blue-900 shadow-md text-left overflow-hidden transition-all hover:brightness-110 cursor-pointer active:bg-blue-500 z-10"
              >
                <div className="text-xs font-black truncate">{event.title}</div>
                {durationMinutes > 40 && (
                  <div className="text-[10px] opacity-80 font-medium">
                    {new Date(event.startMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: timeFormat === '12h' })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
