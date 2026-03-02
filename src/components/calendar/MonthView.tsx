'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, CalendarItem } from '@/lib/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { expandEvents } from '@/lib/recurrence';
import { getColorClass } from '@/lib/utils';

export default function MonthView({ onEdit }: { onEdit: (event: CalendarItem) => void }) {
  const { focusDate, bigText, timeFormat } = useSettingsStore();
  
  const viewDate = new Date(focusDate);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay(); 

  const gridDays = Array.from({ length: 42 }).map((_, i) => new Date(year, month, 1 - startOffset + i));

  const events = useLiveQuery(async () => {
      const startRange = gridDays[0].getTime();
      const endRange = gridDays[41].getTime() + 86400000;

      const rawEvents = await db.events
          .where('startMs')
          .below(endRange) // Get everything that starts before the end of the view
          .toArray();

      // Apply the expansion logic
      return expandEvents(rawEvents, startRange, endRange);
  }, [focusDate]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    // Outer wrapper allows the page to scroll if the grid exceeds screen height
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto">
      {/* Centered container to prevent "too-wide" grid on ultra-wide monitors */}
      <div className="max-w-6xl mx-auto shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          {daysOfWeek.map(day => (
            <div key={day} className="py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* The Grid: aspect-square or fixed height on cells */}
        <div className="grid grid-cols-7 grid-rows-6 gap-px bg-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
          {gridDays.map((date, i) => {
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === new Date().toDateString();
            
            const dayEvents = events?.filter(e => 
              new Date(e.startMs).toDateString() === date.toDateString()
            ).sort((a, b) => a.startMs - b.startMs);

            return (
              <div 
                key={i} 
                // min-h-[120px] ensures cells are large enough to see, h-[15vh] keeps them proportional
                className={`relative flex flex-col p-1 sm:p-2 bg-white dark:bg-slate-900 min-h-[100px] sm:min-h-[120px] ${
                  !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/50 opacity-40' : ''
                }`}
              >
                <span className={`
                  text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full mb-2
                  ${isToday ? 'bg-blue-600 text-white' : 'text-slate-500'}
                `}>
                  {date.getDate()}
                </span>

                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                  {dayEvents?.map(event => (
                    <button
                      key={event.id}
                      onClick={() => onEdit(event)}
                      className={`w-full text-left px-2 py-1 rounded border-l-2 transition-all
                        hover:brightness-95 hover:cursor-pointer
                        ${getColorClass(event.color)}
                      `}
                    >
                      <div className={`font-bold truncate text-blue-900 dark:text-blue-100 ${bigText ? 'text-xs' : 'text-[10px]'}`}>
                        {event.title}
                      </div>
                      <div className="text-[9px] text-blue-600 dark:text-blue-400 font-medium opacity-80">
                        {new Date(event.startMs).toLocaleTimeString([], { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: timeFormat === '12h' 
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
