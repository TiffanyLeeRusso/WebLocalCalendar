'use client';
import { Menu, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function AppHeader({ onAddEvent }: { onAddEvent: () => void }) {
  const { currentView, focusDate, setFocusDate, setSidebarOpen } = useSettingsStore();

  const date = new Date(focusDate);
  
  const getDisplayDate = () => {
    if (currentView === 'year') return date.getFullYear().toString();
    if (currentView === 'month') return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (currentView === 'schedule') return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (currentView === 'day') return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return 'test';
  };

  const handleAdjustDate = (offset: number) => {
    const newDate = new Date(focusDate);
    if (currentView === 'month') newDate.setMonth(newDate.getMonth() + offset);
    else if (currentView === 'day') newDate.setDate(newDate.getDate() + offset);
    else if (currentView === 'year') newDate.setFullYear(newDate.getFullYear() + offset);
    setFocusDate(newDate.getTime());
  };

    return (
<header className="py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-30 flex flex-col items-center gap-4">
  
  {/* Top Row: Navigation & View Title */}
  <div className="w-full max-w-4xl px-4 flex items-center">
    <div className="w-32 flex justify-start"> {/* Increased width for larger buttons */}
      <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-800 rounded-md">
        <Menu size={30} />
      </button>
    </div>

    <h1 className="flex-1 text-center font-bold text-xl uppercase tracking-widest truncate">
      {currentView}
    </h1>

    <div className="w-32 flex justify-end">
      <button onClick={onAddEvent} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 cursor-pointer shadow-lg active:scale-95 transition-transform">
        <Plus size={30} />
      </button>
    </div>
  </div>

  {/* Bottom Row: Date Controls */}
  <div className="w-full max-w-4xl px-4 grid grid-cols-3 items-center">
    
    {/* Left: Previous Button */}
    <div className="flex justify-start">
      <button onClick={() => handleAdjustDate(-1)} className="p-2 hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-800 rounded">
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
        className="px-3 py-0.5 text-[10px] font-black uppercase border-2 border-blue-200 dark:border-slate-700 rounded-full hover:bg-blue-50 cursor-pointer dark:hover:bg-slate-800 transition-colors"
        >
        Today
      </button>
      )}
    </div>

    {/* Right: Next Button */}
    <div className="flex justify-end">
      <button onClick={() => handleAdjustDate(1)} className="p-2 hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-800 rounded">
        <ChevronRight size={30} />
      </button>
    </div>
  </div>
</header>
  );
}

