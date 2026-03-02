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
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-6">
      <h3 className="text-lg font-bold">App Settings</h3>
      
      {/* Time Format */}
      <div className="flex justify-between items-center">
        <span>Time Format</span>
        <select value={timeFormat} 
                onChange={(e) => setTimeFormat(e.target.value as '12h' | '24h')}
                className="p-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500">
          <option value="12h" className="dark:border-slate-800 text-slate-900 dark:text-slate-100">
            12-Hour
          </option>
          <option value="24h" className="dark:border-slate-800 text-slate-900 dark:text-slate-100">
            24-Hour
          </option>
        </select>
      </div>

      {/* Week Start */}
      <div className="flex justify-between items-center">
        <span>Week Starts On</span>
        <button 
          onClick={() => setWeekStart(weekStart === 'Sun' ? 'Mon' : 'Sun')}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          {weekStart}
        </button>
      </div>

      {/* Accessibility: Big Text */}
      <div className="flex justify-between items-center">
        <span>Large Text Mode</span>
        <input 
          type="checkbox" 
          checked={bigText} 
          onChange={toggleBigText}
          className="w-5 h-5"
        />
      </div>

      {/* Theme */}
      <div className="flex justify-between items-center">
        <span>Theme</span>
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="px-3 py-1 border rounded"
        >
          {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </div>
  );
}
