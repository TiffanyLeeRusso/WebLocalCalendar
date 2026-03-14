'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CalendarItem } from '@/lib/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { expandEvents } from '@/lib/recurrence';
import { getAppColor, getEventColorClass } from '@/lib/utils';
import { Clock, Calendar as CalIcon } from 'lucide-react';

const HOUR_HEIGHT = 60;

export default function DayView({ onEdit }: { onEdit: (event: CalendarItem) => void }) {
  const { bigText, focusDate, timeFormat } = useSettingsStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const focus = new Date(focusDate);
  const startOfDayMs = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate()).getTime();
  const endOfDayMs = startOfDayMs + 86400000 - 1;

  const isToday = now.toDateString() === focus.toDateString();
  const nowTop = now.getHours() * 60 + now.getMinutes();
  const nowTimeString = now.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: timeFormat === '12h' 
  });
    
  const events = useLiveQuery(async () => {
    const rawEvents = await db.events.toArray();
    const expanded = expandEvents(rawEvents, startOfDayMs, endOfDayMs);
    return expanded;
  }, [focusDate]);

  // Split logic
  const allDayOrMulti = events?.filter(e => e.allDay || (e.endMs - e.startMs) > 86400000) || [];
  const timedEvents = events?.filter(e => !e.allDay && (e.endMs - e.startMs) <= 86400000) || [];

  // Sort "Top Shelf" by duration descending
  allDayOrMulti.sort((a, b) => (b.endMs - b.startMs) - (a.endMs - a.startMs));

  // Position Timed events for the grid
  const positionedTimed = getPositionedEvents(timedEvents, startOfDayMs, endOfDayMs);

  const formatHour = (hour: number) => {
    if (timeFormat === '24h') return `${hour.toString().padStart(2, '0')}:00`;
    const h = hour % 12 || 12;
    return `${h} ${hour < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <div className={`flex flex-col h-full max-w-3xl mx-auto border-x ${getAppColor('BORDER')} ${getAppColor('BG')}`}>
      
      {/* Pinned Top Section (Static) */}
      {allDayOrMulti.length > 0 && (
        <div className={`z-50 border-b bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md p-2 pl-20 space-y-1 ${getAppColor('BORDER')}`}>
          {allDayOrMulti.map(event => (
            <button
              key={event.id}
              onClick={() => onEdit(event)}
              className={`w-full text-left px-3 py-1.5 rounded-lg border-l-4 shadow-sm text-xs font-bold truncate transition-all hover:brightness-105 ${getEventColorClass(event.color)}`}
            >
              {event.title}
              {(event.endMs - event.startMs) > 86400000 && (
                <span className="ml-2 text-[9px] opacity-60 font-medium">
                  (Ends {new Date(event.endMs).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Scrolling Timeline Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="relative flex w-full" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          
          {/* Hour Labels */}
          <div className={`flex-none border-r ${getAppColor('BORDER')} bg-slate-100/50 dark:bg-slate-950/20 ${bigText ? 'w-24' : 'w-20'}`}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={`h-[60px] text-right pr-3 pt-1 font-bold tabular-nums text-xs ${getAppColor('TEXT')} opacity-60`}>
                {formatHour(i)}
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="flex-1 relative mr-4">
            {/* Grid Lines */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={`hour-${i}`} className={`absolute w-full border-b ${getAppColor('BORDER')}`} style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
            ))}

            {/* Current Time Indicator */}
            {isToday && (
              <div className="absolute left-0 w-full z-40 pointer-events-none flex items-center"
                   style={{ top: `${nowTop}px` }} >
                {/* Time and Triangle Label */}
                <div className="absolute right-full mr-1 flex items-center">
                  <span className="text-[10px] font-black text-fuchsia-700 dark:text-purple-400 whitespace-nowrap bg-white dark:bg-slate-900 px-1 rounded">
                    {nowTimeString}
                  </span>
                  {/* Triangle pointing right */}
                  <div className="w-0 h-0 
                                  border-t-[6px] border-t-transparent 
                                  border-l-[10px] border-l-fuchsia-700 dark:border-l-purple-400
                                  border-b-[6px] border-b-transparent"
                  />
                </div>

                {/* The actual line */}
                <div className="flex-1 border-t-2 border-fuchsia-700 dark:border-purple-400" />
              </div>
            )}

            {/* Timed Events */}
            {positionedTimed.map(({ event, col, totalCols }) => {
              const date = new Date(event.startMs);
              const startMinutes = date.getHours() * 60 + date.getMinutes();
              const durationMinutes = Math.max(25, (event.endMs - event.startMs) / (1000 * 60));

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
                    width: `${widthPct - 1}%`,
                  }}
                  className={`absolute p-2 rounded-xl border-l-4 shadow-md text-left overflow-hidden transition-all hover:scale-[1.02] hover:z-20 z-10 ${getEventColorClass(event.color)}`}
                >
                  <div className="text-xs font-black truncate">{event.title}</div>
                  {durationMinutes > 40 && (
                    <div className="text-[10px] opacity-80 font-bold mt-1">
                      {new Date(event.startMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: timeFormat === '12h' })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Positioning Helper
function getPositionedEvents(items: CalendarItem[], startOfDayMs: number, endOfDayMs: number) {
  const columns: CalendarItem[][] = [];
  const results: { event: CalendarItem; col: number; totalCols: number }[] = [];

  items.forEach((item) => {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const lastInCol = columns[i][columns[i].length - 1];
      if (item.startMs >= lastInCol.endMs) {
        columns[i].push(item);
        results.push({ event: item, col: i, totalCols: 0 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([item]);
      results.push({ event: item, col: columns.length - 1, totalCols: 0 });
    }
  });

  return results.map(r => ({ ...r, totalCols: columns.length }));
}
