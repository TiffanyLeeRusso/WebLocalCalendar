'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { getAppColor } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function YearView() {
  const { focusDate, setFocusDate, setCurrentView } = useSettingsStore();
  const year = new Date(focusDate).getFullYear();

  // 1. Fetch all events for the entire year
  const yearEvents = useLiveQuery(async () => {
    const startOfYear = new Date(year, 0, 1).getTime();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).getTime();
    return await db.events.where('startMs').between(startOfYear, endOfYear).toArray();
  }, [year]);

  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const handleMonthClick = (date: Date) => {
    setFocusDate(date.getTime());
    setCurrentView('month');
  };

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">

        {/* Responsive Grid: 1 col on mobile, 2 on tablet, 3 or 4 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {months.map((monthDate) => (
            <div 
              key={monthDate.getMonth()} 
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow hover:cursor-pointer"
              onClick={() => handleMonthClick(monthDate)}
            >
                  <h3 className={`font-black mb-4 uppercase text-sm tracking-widest ${getAppColor('TEXT_HIGHLIGHT')}`}>
                {monthDate.toLocaleString('default', { month: 'long' })}
              </h3>

              <div className="grid grid-cols-7 gap-1">
                {/* Simplified Day Headers */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className={`text-[15px] font-bold text-center ${getAppColor('TEXT')}`}>
                    {d}
                  </div>
                ))}

                {/* Mini Grid Logic */}
                {renderMiniGrid(monthDate, yearEvents || [])}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to render the tiny squares
function renderMiniGrid(monthDate: Date, events: any[]) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  // Padding for start of month
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`pad-${i}`} />);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const currentFullDate = new Date(year, month, d).toDateString();
    const hasEvents = events.some(e => new Date(e.startMs).toDateString() === currentFullDate);
    const isToday = new Date().toDateString() === currentFullDate;

    cells.push(
      <div 
        key={d} 
        className={`
          aspect-square flex items-center justify-center text-[15px] rounded-full font-bold
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
