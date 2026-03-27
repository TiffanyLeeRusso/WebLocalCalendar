'use client';

import { useState, useRef } from 'react';
import { getAppColor, getTextClass, getIconSize } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useFocusOnMount } from '@/hooks/useFocusOnMount';
import { db } from '@/lib/db';
import { exportEventsToJson, importEventsFromJson } from '@/lib/data-transfer';
import { seedDatabase } from '@/lib/seedData';
import { Check, Download, Upload, Trash2, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function SettingsPanel() {
  const { 
    timeFormat, setTimeFormat, 
    weekStart, setWeekStart, 
    bigText, toggleBigText, 
    theme, setTheme 
  } = useSettingsStore();

  const focusRef = useFocusOnMount<HTMLDivElement>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  type StatusMessage = { text: string; isError: boolean };
  const [importStatus, setImportStatus] = useState<StatusMessage | null>(null);
  const [dbStatus, setDbStatus] = useState<StatusMessage | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importEventsFromJson(file);
      setImportStatus({ text: `Successfully imported ${count} items.`, isError: false });
    } catch (err) {
      setImportStatus({ text: 'Import failed. Check file format.', isError: true });
    }
    // Reset input so the same file can be re-imported if needed
    e.target.value = '';
  };

  // JS Function to Clear IndexedDB
  const handleClearDatabase = async () => {
    if (!confirm("Are you sure? This will delete all calendar events permanently.")) return;
    try {
      await db.events.clear();
      setDbStatus({ text: 'Database cleared successfully.', isError: false });
    } catch (err) {
      console.error("Failed to clear DB:", err);
      setDbStatus({ text: 'Failed to clear database.', isError: true });
    }
  };

  // JS Function to Re-Seed
  const handleReseedDatabase = async () => {
    try {
      await seedDatabase();
      setDbStatus({ text: 'Test data seeded successfully.', isError: false });
    } catch (err) {
      console.error("Failed to seed DB:", err);
      setDbStatus({ text: 'Failed to seed test data.', isError: true });
    }
  };

  return (
    <div ref={focusRef} tabIndex={-1} role="region" aria-label="Settings view" className="max-w-2xl mx-4 md:mx-auto pb-20">
      
      <div className={`overflow-hidden border rounded-xl shadow-sm mt-10
                       ${getAppColor('BG')} ${getAppColor('BORDER')}`}>

        {/* Time Format Row */}
        <div className={`flex justify-between items-center h-16 px-4 border-t first:border-t-0 transition-colors
                         ${getAppColor('BORDER')}`}>
          <label htmlFor="time-format" className="font-bold">Time Format</label>
          <select
            id="time-format"
            value={timeFormat} 
            onChange={(e) => setTimeFormat(e.target.value as '12h' | '24h')}
            className={`p-3 rounded-lg border ${getTextClass(bigText)} hover:cursor-pointer
                        ${getAppColor('BG')} ${getAppColor('BORDER')} ${getAppColor('BORDER_FOCUS')}`}
          >
            <option value="12h" aria-label="12 hour">12-Hour</option>
            <option value="24h" aria-label="24 hour">24-Hour</option>
          </select>
        </div>

        {/* Week Start Row */}
        <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0 ${getAppColor('BORDER')} ${getAppColor('BG_PANEL')}`}>
          <span className="font-bold">Week Starts On</span>
          <button
            aria-label={`Week starts on ${weekStart === 'Sun' ? 'Sunday' : 'Monday'}, activate to change`}
            onClick={() => setWeekStart(weekStart === 'Sun' ? 'Mon' : 'Sun')}
            className={`px-4 py-2 rounded-lg transition-all ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}
          >
            {weekStart === 'Sun' ? 'Sunday' : 'Monday'}
          </button>
        </div>

        {/* Large-Text Row */}
        <div className={`flex justify-between items-center h-16 px-4 border-t transition-colors first:border-t-0
                         ${getAppColor('BORDER')}`}>
          <label htmlFor="large-text" className="font-bold">Large Text Mode</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="large-text"
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
          <span id="theme-label" className="font-bold">Theme</span>
          <button
            aria-label={`Theme: ${theme === 'light' ? 'Light' : 'Dark'}, activate to change`}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}
          >
            {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* EVENT BACKUP */}
      <section className="mt-12 space-y-4">
        <div className="flex items-center gap-2 px-2">
          <h2 className={`font-black ${getAppColor('TEXT_SECONDARY')} ${getTextClass(bigText)}`}>
            Event Backup
          </h2>
        </div>

        <div className={`p-6 border-2 border-dashed rounded-2xl ${getAppColor('BORDER')}`}>
          {/* Warning */}
          <p id="import-warning" className={`mb-2 text-amber-500 flex items-center gap-2`}>
            <AlertTriangle size={20} aria-hidden="true" />
            Importing will overwrite all existing events.
          </p>

          {/* Status */}
          {importStatus && (
            <p
              role="status"
              aria-live="polite"
              className={`my-3 text-sm font-bold flex items-center gap-2
              ${importStatus.isError
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'}`}
              >
              {importStatus.isError
              ? <AlertTriangle size={16} aria-hidden="true" />
              : <Check size={16} aria-hidden="true" />}
              {importStatus.text}
            </p>
            )}

          <div className="grid grid-cols-2 gap-4">
            {/* Export */}
            <button
              onClick={exportEventsToJson}
              className={`flex items-center justify-center font-bold gap-2 p-4 rounded-xl ${getAppColor('BUTTON')}`}
            >
              <Download size={20} /> Export JSON
            </button>

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-describedby="import-warning"
              className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold cursor-pointer transition-all ${getAppColor('BUTTON')}`}
              >
              <Upload size={20} /> Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              />
          </div>
        </div>
      </section>

      {/* TECH ZONE */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center gap-2 px-2">
          <AlertTriangle className="text-amber-500" size={getIconSize(bigText)} />
          <h2 className={`font-black ${getAppColor('TEXT_SECONDARY')} ${getTextClass(bigText)}`}>
            Tech Zone
          </h2>
        </div>

        <div className={`p-6 border-2 border-dashed rounded-2xl ${getAppColor('BORDER')}`}>
          <div className="flex flex-col gap-4">
            {/* Status */}
            {dbStatus && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm font-bold text-center flex items-center justify-center gap-2
              ${dbStatus.isError
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'}`}
              >
              {dbStatus.isError
              ? <AlertTriangle size={16} aria-hidden="true" />
              : <Check size={16} aria-hidden="true" />}
              {dbStatus.text}
            </p>
            )}
            
            {/* Clear Button */}
            <button 
              onClick={handleClearDatabase}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold m-0 mx-auto
                          ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}
            >
            <Trash2 size={getIconSize(bigText)} />
              Clear Database
            </button>

            {/* Seed Button */}
            <button 
              onClick={handleReseedDatabase}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold m-0 mx-auto
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
