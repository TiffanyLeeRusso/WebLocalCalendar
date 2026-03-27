'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CalendarItem } from '@/lib/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useFocusOnMount } from '@/hooks/useFocusOnMount';
import { getAppColor, getTextClass } from '@/lib/utils';
import { expandEvents } from '@/lib/recurrence'; // Import your helper

import EventCard from '@/components/calendar/EventCard';

interface ScheduleViewProps {
  onEdit: (event: CalendarItem) => void;
}

export default function ScheduleView({ onEdit }: ScheduleViewProps) {
  const { timeFormat, bigText, focusDate } = useSettingsStore();

  const focusRef = useFocusOnMount<HTMLDivElement>();
    
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
    <div ref={focusRef} tabIndex={-1} role="region" aria-label="Schedule view" className="max-w-3xl mx-auto space-y-8 mt-10 mb-20 px-4">
      {sortedDays.length === 0 ? (
        <div tabIndex={0}
             aria-label="No events scheduled for this month"
             className={`p-12 border-2 border-dashed rounded-2xl text-center ${getAppColor('TEXT_SECONDARY')}`}>
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
            <div key={dateStr}
                 tabIndex={0}
                 aria-label={`${isToday ? 'Today, ' : ''}${dateObj.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}, ${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}`}
                 className="space-y-3">
              {/* Day Header */}
              <div className="flex items-center gap-4 py-2 sticky top-0 z-10 backdrop-blur-sm">
                <div aria-hidden="true" className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-colors
                                 ${getTextClass(bigText)}
                  ${isToday
                    ? 'bg-blue-700 border-blue-700 text-white shadow-lg'
                    : `${getAppColor('BG')} ${getAppColor('BORDER')} ${getAppColor('TEXT')}`
                  }
                `}>
                  <span className="uppercase font-bold leading-none mb-1">
                    {dateObj.toLocaleDateString('default', { weekday: 'short' })}
                  </span>
                  <span className="font-black leading-none">
                    {dateObj.getDate()}
                  </span>
                </div>
                <div aria-hidden="true" className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Day's Events */}
              <div className="space-y-3">
                {dayEvents.length === 0 ? (
                  <p className={`text-sm italic py-2 ${getAppColor('TEXT_SECONDARY')}`}>
                    No events scheduled.
                  </p>
                ) : (
                dayEvents.map((event) => {
                  return(
                    <EventCard key={event.id}
                      event={event}
                      mode="full"
                      bigText={bigText}
                      timeFormat={timeFormat}
                      currentDate={dateObj}
                      onClick={() => onEdit(event)}/>
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
