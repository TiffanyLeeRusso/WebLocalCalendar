'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CalendarItem } from '@/lib/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getAppColor, getEventColorClass } from '@/lib/utils';
import { expandEvents } from '@/lib/recurrence'; // Import your helper
import { Clock, Calendar as CalIcon, ChevronRight } from 'lucide-react';

interface ScheduleViewProps {
  onEdit: (event: CalendarItem) => void;
}

export default function ScheduleView({ onEdit }: ScheduleViewProps) {
  const { timeFormat, focusDate } = useSettingsStore();
  
  const focus = new Date(focusDate);
  const startOfMonth = new Date(focus.getFullYear(), focus.getMonth(), 1).getTime();
  const endOfMonth = new Date(focus.getFullYear(), focus.getMonth() + 1, 0, 23, 59, 59).getTime();

  // Fetch all events. Since recurring events can start years ago, 
  // we pull them all and let expandEvents filter the relevant occurrences.
  const rawEvents = useLiveQuery(() => db.events.toArray(), [focusDate]);

  const formatTime = (ms: number) => {
    return new Date(ms).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  };

  if (!rawEvents) return <div className="p-8 text-center">Loading schedule...</div>;

  // Expand recurrences into a flat list for the current month view
  const expandedEvents = expandEvents(rawEvents, startOfMonth, endOfMonth);

  // Group events by day (Handling Multi-day spans)
  const groupedEvents: Record<string, CalendarItem[]> = {};

  expandedEvents.forEach(event => {
    const eventStart = new Date(event.startMs);
    const eventEnd = new Date(event.endMs);
    
    // Normalize current day to midnight for the loop
    let current = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
    const end = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());

    // Loop through every day this specific instance spans
    while (current <= end) {
      const currentMs = current.getTime();
      // Only include the day if it falls within our focused month
      if (currentMs >= startOfMonth && currentMs <= endOfMonth) {
        const dateKey = current.toDateString();
        if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
        groupedEvents[dateKey].push(event);
      }
      current.setDate(current.getDate() + 1);
    }
  });

  // Ensure Today is always visible if it's the current month
  const todayKey = new Date().toDateString();
  const isCurrentMonth = new Date().getMonth() === focus.getMonth() && new Date().getFullYear() === focus.getFullYear();
  if (isCurrentMonth && !groupedEvents[todayKey]) {
    groupedEvents[todayKey] = [];
  }

  // Sort days and sort internal events (Multi-day > All-day > Time)
  const sortedDays = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-10 mb-20 px-4">
      {sortedDays.length === 0 ? (
        <div className={`p-12 border-2 border-dashed rounded-2xl text-center ${getAppColor('TEXT_SECONDARY')}`}>
          No events scheduled for this month.
        </div>
      ) : (
        sortedDays.map((dateStr) => {
          const isToday = dateStr === todayKey;
          const dateObj = new Date(dateStr);
          
          // Sort events for THIS day specifically
          const dayEvents = [...groupedEvents[dateStr]].sort((a, b) => {
            const isAMulti = (a.endMs - a.startMs) > 86400000;
            const isBMulti = (b.endMs - b.startMs) > 86400000;
            if (isAMulti !== isBMulti) return isAMulti ? -1 : 1;
            if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
            return a.startMs - b.startMs;
          });

          return (
            <div key={dateStr} className="space-y-3">
              {/* Day Header */}
              <div className="flex items-center gap-4 py-2 sticky top-0 z-10 backdrop-blur-sm">
                <div className={`
                  flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-colors
                  ${isToday 
                    ? 'bg-blue-700 border-blue-700 text-white shadow-lg' 
                    : `${getAppColor('BG')} ${getAppColor('BORDER')} ${getAppColor('TEXT')}`
                  }
                `}>
                  <span className="text-[12px] uppercase font-bold leading-none mb-1">
                    {dateObj.toLocaleDateString('default', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {dateObj.getDate()}
                  </span>
                </div>
                <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Day's Events */}
              <div className="pl-16 space-y-3">
                {dayEvents.length === 0 ? (
                  <p className={`text-sm italic py-2 ${getAppColor('TEXT_SECONDARY')}`}>
                    No events scheduled.
                  </p>
                ) : (
                  dayEvents.map((event) => {
                    const isMulti = (event.endMs - event.startMs) > 86400000;
                    
                    return (
                      <div 
                        key={event.id}
                        className={`
                          group p-4 border-2 rounded-2xl transition-all hover:shadow-md
                          flex items-start justify-between gap-4
                          ${getEventColorClass(event.color)}
                        `}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-lg leading-tight ${getAppColor('TEXT')}`}>
                              {event.title}
                            </h3>
                            {isMulti && (
                              <span className="text-[10px] bg-white/40 dark:bg-black/20 px-1.5 py-0.5 rounded font-black uppercase">
                                Multi-Day
                              </span>
                            )}
                          </div>
                          
                          {event.note && (
                            <p className={`text-sm line-clamp-2 opacity-80 ${getAppColor('TEXT_SECONDARY')}`}>
                              {event.note}
                            </p>
                          )}

                          <div className={`flex items-center gap-3 mt-2 text-[12px] font-bold uppercase tracking-widest opacity-80 ${getAppColor('TEXT_SECONDARY')}`}>
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              {event.allDay ? 'All Day' : formatTime(event.startMs)}
                            </span>
                            {event.repeat && (
                              <span className="flex items-center gap-1">
                                <CalIcon size={14} /> 
                                {event.repeat.unit}ly
                              </span>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => onEdit(event)}
                          className={`
                            flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm
                            ${getAppColor('BUTTON')}
                          `}
                        >
                          Edit <ChevronRight size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
