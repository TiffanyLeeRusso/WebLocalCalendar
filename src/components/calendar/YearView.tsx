'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getAppColor, getTextClass } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { expandEvents } from '@/lib/recurrence';

export default function YearView() {
  const { focusDate, bigText, setFocusDate, setCurrentView } = useSettingsStore();
  const year = new Date(focusDate).getFullYear();

  // 1. Fetch and Expand events for the entire year
  const yearEvents = useLiveQuery(async () => {
    const startOfYear = new Date(year, 0, 1).getTime();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).getTime();
    
    // Pull all events to ensure we catch those starting before Jan 1st that repeat/span into this year
    const rawEvents = await db.events.toArray();
    
    // Expand for the whole year
    return expandEvents(rawEvents, startOfYear, endOfYear);
  }, [year]);

  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const handleMonthClick = (date: Date) => {
    setFocusDate(date.getTime());
    setCurrentView('month');
  };

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {months.map((monthDate) => (
            <div 
              key={monthDate.getMonth()} 
              className={`p-4 rounded-2xl shadow-sm border hover:cursor-pointer group
                          md:transition-transform md:duration-200 md:hover:scale-105 md:hover:shadow-xl
                          active:bg-slate-100 dark:active:bg-slate-800 md:active:scale-105
                          ${getAppColor('BG')} ${getAppColor('BORDER')} ${getTextClass(bigText)}`}
              onClick={() => handleMonthClick(monthDate)}
            >
              <h3 className={`font-black mb-4 uppercase tracking-widest ${getAppColor('TEXT_HIGHLIGHT')}`}>
                {monthDate.toLocaleString('default', { month: 'long' })}
              </h3>

              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className={`font-black text-center ${getAppColor('TEXT_SECONDARY')}`}>
                    {d}
                  </div>
                ))}
                {renderMiniGrid(monthDate, yearEvents || [])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderMiniGrid(monthDate: Date, events: any[]) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`pad-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStart = new Date(year, month, d).getTime();
    const dayEnd = dayStart + 86400000 - 1;
    const today = new Date();
    const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

    // Check if any event instance overlaps with this specific 24-hour block
    const hasEvents = events.some(e => e.startMs <= dayEnd && e.endMs >= dayStart);

    cells.push(
      <div 
        key={d} 
        className={`
          aspect-square flex items-center justify-center rounded-full font-bold transition-colors
          ${hasEvents ? 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-blue-50' : getAppColor('TEXT_SECONDARY')}
          ${isToday ? 'ring-2 ring-blue-700 dark:ring-blue-200 ' : ''}
        `}
      >
        {d}
      </div>
    );
  }

  return cells;
}
