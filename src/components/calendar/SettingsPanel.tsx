'use client';

import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsPanel() {
  const { 
    timeFormat, setTimeFormat, 
    weekStart, setWeekStart, 
    bigText, toggleBigText, 
    theme, setTheme 
  } = useSettingsStore();

  return (
  <div className="max-w-2xl mx-auto mt-10 overflow-hidden border rounded-xl shadow-sm
                  border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">

    {/* Time Format Row */}
    <div className="flex justify-between items-center h-16 px-4 border-t first:border-t-0 transition-colors
                    border-slate-100 dark:border-slate-800">
      <span className="font-bold text-slate-700 dark:text-slate-300">Time Format</span>
      <select 
        value={timeFormat} 
        onChange={(e) => setTimeFormat(e.target.value as '12h' | '24h')}
        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="12h">12-Hour</option>
        <option value="24h">24-Hour</option>
      </select>
    </div>

    {/* Week Start Row */}
    <div className="flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                    border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60">
      <span className="font-bold text-slate-700 dark:text-slate-300">Week Starts On</span>
      <button 
        onClick={() => setWeekStart(weekStart === 'Sun' ? 'Mon' : 'Sun')}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
      >
        {weekStart === 'Sun' ? 'Sunday' : 'Monday'}
      </button>
    </div>

    {/* Accessibility Row */}
    <div className="flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                    border-slate-100 dark:border-slate-800">
      <span className="font-bold text-slate-700 dark:text-slate-300">Large Text Mode</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={bigText} 
          onChange={toggleBigText}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>

    {/* Theme Row */}
    <div className="flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                    border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60">
      <span className="font-bold text-slate-700 dark:text-slate-300">Theme</span>
      <button 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-sm bg-white dark:bg-slate-800 hover:border-blue-500 transition-colors"
      >
        {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  </div>
  );
}
