import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Settings
  timeFormat: '12h' | '24h';
  weekStart: 'Sun' | 'Mon';
  bigText: boolean;
  theme: 'light' | 'dark';
  // Actions
  setTimeFormat: (format: '12h' | '24h') => void;
  setWeekStart: (day: 'Sun' | 'Mon') => void;
  toggleBigText: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  // Views
  currentView: 'month' | 'day' | 'year' | 'schedule' | 'settings';
  focusDate: number; // Unix timestamp
  isSidebarOpen: boolean;
  
  setCurrentView: (view: 'month' | 'day' | 'year' | 'schedule' | 'settings') => void;
  setFocusDate: (date: number) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      timeFormat: '12h',
      weekStart: 'Sun',
      bigText: false,
      theme: 'dark',

      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setWeekStart: (weekStart) => set({ weekStart }),
      toggleBigText: () => set((state) => ({ bigText: !state.bigText })),
      setTheme: (theme) => set({ theme }),

      currentView: 'schedule',
      focusDate: Date.now(),
      isSidebarOpen: true,

      setCurrentView: (currentView) => set({ currentView }),
      setFocusDate: (focusDate) => set({ focusDate }),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    {
      name: 'local-calendar-settings', // Key for localStorage
    }
  )
);
