'use client';

import { getAppColor, getTextClass, getIconSize } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { db } from '@/lib/db';
import { seedDatabase } from '@/lib/seedData';
import { Trash2, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function SettingsPanel() {
  const { 
    timeFormat, setTimeFormat, 
    weekStart, setWeekStart, 
    bigText, toggleBigText, 
    theme, setTheme 
  } = useSettingsStore();

  // JS Function to Clear IndexedDB
  const handleClearDatabase = async () => {
    if (confirm("Are you sure? This will delete all calendar events permanently.")) {
      try {
        await db.events.clear();
        alert("Database cleared successfully.");
      } catch (err) {
        console.error("Failed to clear DB:", err);
      }
    }
  };

  // JS Function to Re-Seed (Assumes you have a seed function or logic)
  const handleReseedDatabase = async () => {
    try {
      seedDatabase();
      alert("Test data seeded.");
    } catch (err) {
      console.error("Failed to seed DB:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-4 md:mx-auto pb-20"> {/* mx-4 adds the margin at small sizes */}
      
      <div className={`overflow-hidden border rounded-xl shadow-sm mt-10
                       ${getAppColor('BG')} ${getAppColor('BORDER')}`}>

        {/* Time Format Row */}
        <div className={`flex justify-between items-center h-16 px-4 border-t first:border-t-0 transition-colors
                         ${getAppColor('BORDER')}`}>
          <span className="font-bold">Time Format</span>
          <select 
            value={timeFormat} 
            onChange={(e) => setTimeFormat(e.target.value as '12h' | '24h')}
            className={`p-3 rounded-lg border ${getTextClass(bigText)}
                        ${getAppColor('BG')} ${getAppColor('BORDER')} ${getAppColor('BORDER_FOCUS')}`}
          >
            <option value="12h">12-Hour</option>
            <option value="24h">24-Hour</option>
          </select>
        </div>

        {/* Week Start Row */}
        <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0 ${getAppColor('BORDER')} ${getAppColor('BG_PANEL')}`}>
          <span className="font-bold">Week Starts On</span>
          <button 
            onClick={() => setWeekStart(weekStart === 'Sun' ? 'Mon' : 'Sun')}
            className={`px-4 py-2 rounded-lg transition-all ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}
          >
            {weekStart === 'Sun' ? 'Sunday' : 'Monday'}
          </button>
        </div>

        {/* Accessibility Row */}
        <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                         ${getAppColor('BORDER')}`}>
          <span className="font-bold">Large Text Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={bigText} 
              onChange={toggleBigText}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-3 rounded-full peer
                 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                 bg-slate-200 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-300 dark:bg-slate-700
                 peer-checked:after:border-white after:bg-white after:border-gray-300
                 dark:border-gray-600 peer-checked:bg-blue-600`}></div>
          </label>
        </div>

        {/* Theme Row */}
        <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                        ${getAppColor('BORDER')} ${getAppColor('BG_PANEL')}`}>
          <span className="font-bold">Theme</span>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}
          >
            {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* TECH ZONE */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center gap-2 px-2">
          <AlertTriangle className="text-amber-500" size={getIconSize(bigText)} />
          <h2 className={`font-black ${getAppColor('TEXT_SECONDARY')} ${getTextClass(bigText)}`}>
            Tech Zone
          </h2>
        </div>

        <div className={`p-6 border-2 border-dashed rounded-2xl ${getAppColor('BORDER')} bg-slate-50/30 dark:bg-slate-900/30`}>
          {/* Flex column instead of Grid for vertical stacking */}
          <div className="flex flex-col gap-4">
            
            {/* Clear Button */}
            <button 
              onClick={handleClearDatabase}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-sm m-0 mx-auto
                          ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}
            >
            <Trash2 size={getIconSize(bigText)} />
              Clear Database
            </button>

            {/* Seed Button */}
            <button 
              onClick={handleReseedDatabase}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-sm m-0 mx-auto
                          ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}
            >
              <RefreshCcw size={getIconSize(bigText)} />
              Seed Test Data
            </button>
            
          </div>
        </div>
      </div>

    </div>
  );
}
