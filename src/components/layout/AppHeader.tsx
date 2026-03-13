'use client';
import { Menu, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getAppColor } from '@/lib/utils';

export default function AppHeader({ onAddEvent }: { onAddEvent: () => void }) {
  const { currentView, focusDate, setFocusDate, setSidebarOpen } = useSettingsStore();

  const date = new Date(focusDate);
  
  const getDisplayDate = () => {
    if (currentView === 'year') return date.getFullYear().toString();
    if (currentView === 'month') return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (currentView === 'schedule') return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (currentView === 'day') return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return '';
  };

  const handleAdjustDate = (offset: number) => {
    const newDate = new Date(focusDate);
    if (currentView === 'month') newDate.setMonth(newDate.getMonth() + offset);
    else if (currentView === 'day') newDate.setDate(newDate.getDate() + offset);
    else if (currentView === 'year') newDate.setFullYear(newDate.getFullYear() + offset);
    setFocusDate(newDate.getTime());
  };

  return (
  <header className={`py-3 border-b z-30 flex flex-col items-center gap-4
                      ${getAppColor('BG')} ${getAppColor('BORDER')}`}>
  {/* Top Row: Navigation & View Title */}
  <div className="w-full max-w-4xl px-4 flex items-center justify-between">
    
    {/* Left Side: Dynamic width based on button */}
    <div className="flex-1 flex justify-start">
      <button 
        onClick={() => setSidebarOpen(true)} 
        className={`p-2 rounded-md ${getAppColor('BUTTON')}`}>
        <Menu size={30} />
      </button>
    </div>

    {/* Center: Takes up all available space */}
    <h1 className={`px-2 font-black text-xl sm:text-2xl uppercase tracking-[0.2em] truncate
                   ${getAppColor('TEXT')}`}>
      {currentView}
    </h1>

    {/* Right Side: Dynamic width based on button */}
    <div className="flex-1 flex justify-end">
      <button 
        onClick={onAddEvent} 
        className={`p-3 rounded-full shadow-lg transition-all
                    ${getAppColor('BUTTON')}`}
        >
        <Plus size={30} />
      </button>
    </div>
  </div>

  {/* Bottom Row: Date Controls */}
  <div className="w-full max-w-4xl px-4 grid grid-cols-3 items-center">
    
    {/* Left: Previous Button */}
    <div className="flex justify-start">
      <button onClick={() => handleAdjustDate(-1)}
              className="p-2 rounded hover:bg-slate-200 hover:cursor-pointer dark:hover:bg-slate-700">
        <ChevronLeft size={30} />
      </button>
    </div>

    {/* Center: Date & Today (Stacked or Grouped) */}
    <div className="flex flex-col items-center gap-1">
      <span className="font-bold text-lg sm:text-xl whitespace-nowrap">
        {getDisplayDate()}
      </span>
      {currentView !== 'settings' && currentView !== 'schedule' && (
      <button 
        onClick={() => setFocusDate(Date.now())} 
          className={`px-3 py-0.5 text-[12px] font-black uppercase transition-colors rounded-full
                      ${getAppColor('BUTTON')}`}
        >
        Today
      </button>
      )}
    </div>

    {/* Right: Next Button */}
    <div className="flex justify-end">
      <button onClick={() => handleAdjustDate(1)}
              className={`p-2 hover:cursor-pointer rounded
                          hover:bg-slate-200 dark:hover:bg-slate-700`}>
        <ChevronRight size={30} />
      </button>
    </div>
  </div>
</header>
  );
}

