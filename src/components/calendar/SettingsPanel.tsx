'use client';

import { getAppColor } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsPanel() {
  const { 
    timeFormat, setTimeFormat, 
    weekStart, setWeekStart, 
    bigText, toggleBigText, 
    theme, setTheme 
  } = useSettingsStore();

  return (
      <div className={`max-w-2xl mx-auto overflow-hidden border rounded-xl shadow-sm mt-10
                       ${getAppColor('BG')} ${getAppColor('BORDER')}`}>

    {/* Time Format Row */}
    <div className={`flex justify-between items-center h-16 px-4 border-t first:border-t-0 transition-colors
                     ${getAppColor('BORDER')}`}>
      <span className="font-bold text-slate-700 dark:text-slate-300">Time Format</span>
      <select 
        value={timeFormat} 
        onChange={(e) => setTimeFormat(e.target.value as '12h' | '24h')}
        className={`p-2 rounded-lg border text-sm font-bold outline-none focus:ring-2
                    ${getAppColor('BG')} ${getAppColor('BORDER')} focus:ring-blue-500`}
      >
        <option value="12h">12-Hour</option>
        <option value="24h">24-Hour</option>
      </select>
    </div>

    {/* Week Start Row */}
    <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0 bg-blue-100/50 dark:bg-slate-800/60 ${getAppColor('BORDER')}`}>
      <span className="font-bold text-slate-700 dark:text-slate-300">Week Starts On</span>
      <button 
        onClick={() => setWeekStart(weekStart === 'Sun' ? 'Mon' : 'Sun')}
        className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${getAppColor('BUTTON')}`}
      >
        {weekStart === 'Sun' ? 'Sunday' : 'Monday'}
      </button>
    </div>

    {/* Accessibility Row */}
    <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                     ${getAppColor('BORDER')}`}>
      <span className="font-bold text-slate-700 dark:text-slate-300">Large Text Mode</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={bigText} 
          onChange={toggleBigText}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer
             peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px]
             after:border after:rounded-full after:h-5 after:w-5 after:transition-all
             bg-slate-200 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-slate-700
             peer-checked:after:border-white after:bg-white after:border-gray-300
             dark:border-gray-600 peer-checked:bg-blue-600`}></div>
      </label>
    </div>

    {/* Theme Row */}
    <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                    ${getAppColor('BORDER')} bg-blue-100/50 dark:bg-slate-800/60`}>
      <span className="font-bold text-slate-700 dark:text-slate-300">Theme</span>
      <button 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${getAppColor('BUTTON')}`}
      >
        {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  </div>
  );
}
