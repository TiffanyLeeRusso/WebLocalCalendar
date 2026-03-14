'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, CalendarItem } from '@/lib/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { expandEvents } from '@/lib/recurrence';
import { getAppColor, getEventWithHoverStyles } from '@/lib/utils';

export default function MonthView({ onEdit }: { onEdit: (event: CalendarItem) => void }) {
  const { focusDate, bigText, timeFormat } = useSettingsStore();
  
  const viewDate = new Date(focusDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay(); 

  // Generate the 42 days (6 weeks) shown in the grid
  const gridDays = Array.from({ length: 42 }).map((_, i) => new Date(year, month, 1 - startOffset + i));

  const events = useLiveQuery(async () => {
      const startRange = gridDays[0].getTime();
      const endRange = gridDays[41].getTime() + 86400000;

      // Pull all events to ensure recurring ones started in the past are captured
      const rawEvents = await db.events.toArray();

      // Apply expansion logic for the visible 6-week window
      return expandEvents(rawEvents, startRange, endRange);
  }, [focusDate]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className={`max-w-6xl mx-auto shadow-2xl rounded-xl overflow-hidden border ${getAppColor('BORDER')}`}>
        
        {/* Day Headers */}
        <div className={`grid grid-cols-7 border-b ${getAppColor('BG')} ${getAppColor('BORDER')}`}>
          {daysOfWeek.map(day => (
            <div key={day} className="py-3 text-center text-[12px] sm:text-xs font-black uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div className={`grid grid-cols-7 grid-rows-6 border-t border-l ${getAppColor('BORDER')}`}>
          {gridDays.map((date, i) => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === new Date().toDateString();
            
            // Normalize current grid cell to day bounds for filtering
            const cellStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            const cellEnd = cellStart + 86400000 - 1;

            // Filter for events that touch THIS day (handles multi-day spans)
            const dayEvents = events?.filter(e => 
              e.startMs <= cellEnd && e.endMs >= cellStart
            ).sort((a, b) => {
                // Keep the same priority: Multi-day > All-day > Time
                const isAMulti = (a.endMs - a.startMs) > 86400000;
                const isBMulti = (b.endMs - b.startMs) > 86400000;
                if (isAMulti !== isBMulti) return isAMulti ? -1 : 1;
                if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
                return a.startMs - b.startMs;
            });

            return (
              <div 
                key={i} 
                className={`relative flex flex-col p-1 sm:p-2 min-h-[100px] sm:min-h-[120px]
                border-b border-r ${getAppColor('BORDER')}
                ${getAppColor('BG')}
                ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/50 opacity-40' : ''}`}
              >
                <span className={`
                  text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full mb-2
                  ${isToday ? 'bg-blue-600 text-white' : ''}
                `}>
                  {date.getDate()}
                </span>

                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                  {dayEvents?.map(event => {
                    const isOccurrenceStart = new Date(event.startMs).toDateString() === date.toDateString();
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => onEdit(event)}
                        className={`
                          w-full text-left px-2 py-1 rounded transition-all border-2
                          ${getEventWithHoverStyles(event.color)}
                        `}
                      >
                        <div className={`font-bold truncate ${getAppColor('TEXT')} ${bigText ? 'text-xs' : 'text-[12px]'}`}>
                          {event.title}
                        </div>
                        
                        {/* Only show time if it's the start day of the occurrence and not all-day */}
                        {!event.allDay && isOccurrenceStart && (
                          <div className="text-[9px] font-medium opacity-80">
                            {new Date(event.startMs).toLocaleTimeString([], { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: timeFormat === '12h' 
                            })}
                          </div>
                        )}
                        
                        {/* Indicator for continuing multi-day events */}
                        {!isOccurrenceStart && (
                          <div className="text-[8px] font-black uppercase opacity-80">
                            (Cont.)
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
