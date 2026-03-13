'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { seedDatabase } from '@/lib/seedData';
import { db, type CalendarItem } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAppColor } from '@/lib/utils';

import AppHeader from '@/components/layout/AppHeader';
import EventForm from '@/components/calendar/EventForm';
import SettingsPanel from '@/components/calendar/SettingsPanel';
import MonthView from '@/components/calendar/MonthView';
import DayView from '@/components/calendar/DayView';
import YearView from '@/components/calendar/YearView';
import ScheduleView from '@/components/calendar/ScheduleView';

import { Plus, Settings as SettingsIcon, Calendar as CalendarIcon } from 'lucide-react';

// Home
export default function Home() {
    const { bigText, isSidebarOpen, setSidebarOpen, currentView, setCurrentView } = useSettingsStore();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [selectedEvent, setSelectedEvent] = useState<CalendarItem | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
      // Forces the sidebar closed on the very first mount
        setSidebarOpen(false);
        //seedDatabase();
    }, []);

    const handleEditClick = (event: CalendarItem) => {
        setSelectedEvent(event);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleAddClick = () => {
        setSelectedEvent(undefined);
        setFormMode('add');
        setIsFormOpen(true);
    };

    // Query the DB whenever searchQuery changes
    const searchResults = useLiveQuery(async () => {
      if (searchQuery.length < 2) return [];

      // Basic case-insensitive filter
      return await db.events
          .filter(event => 
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.note.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .toArray();
    }, [searchQuery]);

    return (
    <div className={`flex h-screen overflow-hidden
                     ${getAppColor('BG')} ${getAppColor('TEXT')}
                     ${bigText ? 'big-text-mode' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`
        flex flex-col h-full overflow-hidden border-r
        fixed inset-y-0 left-0 z-50 w-72
        bg-slate-50 dark:bg-slate-950 ${getAppColor('BORDER')}
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
             `}>
        <div className={`p-4 flex justify-between items-center border-b
                        ${getAppColor('BORDER')}`}>
          <span className="font-bold text-xl">Local Calendar</span>
          <button onClick={() => setSidebarOpen(false)}
        className={`p-2 hover:cursor-pointer rounded
                    hover:bg-slate-200 dark:hover:bg-slate-800`}>
            X
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {['Month', 'Day', 'Year', 'Schedule', 'Settings'].map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view.toLowerCase() as any)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${currentView === view.toLowerCase() ? 'bg-blue-200 dark:bg-blue-900 font-bold' : 'hover:bg-slate-200 hover:cursor-pointer dark:hover:bg-slate-800'}`}
            >
              {view}
            </button>
          ))}
        </nav>

        <div className={`flex-1 min-h-0 flex flex-col p-4 border-t
                         ${getAppColor('BORDER')}`}>
          <label htmlFor="sidebar-search" className="block text-sm font-semibold mb-2">Search Events:</label>
          <input 
            id="sidebar-search"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..." 
            className={`w-full p-2 mb-4 rounded outline-none border focus:ring-2
                        border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500`}
            />
          
          {/* The Scrollable Wrapper */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-300">
            {searchResults?.map(event => (
            <button
              key={event.id}
              onClick={() => {
                handleEditClick(event);
                setSidebarOpen(false); // Close sidebar after selecting search result
              }}
                className={`w-full text-left p-3 rounded-xl border transition-all shadow-sm
                            hover:bg-slate-200 dark:hover:bg-slate-800 border-transparent hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50`} >
              <div className="font-bold text-sm truncate">{event.title}</div>
              <div className="text-xs text-slate-500">
                {new Date(event.startMs).toLocaleDateString()}
              </div>
            </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CLICK-TO-CLOSE OVERLAY */}
      {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-black/10 dark:bg-black/30 z-40 transition-opacity"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onAddEvent={handleAddClick} />

        <main className="flex-1 overflow-scroll custom-scrollbar">
          {currentView === 'day' && <DayView onEdit={handleEditClick} />}
          {currentView === 'month' && <MonthView onEdit={handleEditClick} />}
          {currentView === 'year' && <YearView />}
          {currentView === 'schedule' && <ScheduleView onEdit={handleEditClick} />}
          {currentView === 'settings' && <SettingsPanel />}
          {/* other views go here */}
        </main>
      </div>

      {isFormOpen && (
      <EventForm key={selectedEvent?.id || 'new-event'}
                 mode={formMode}
                 initialData={selectedEvent}
                 onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}
