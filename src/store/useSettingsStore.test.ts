import { act, renderHook } from '@testing-library/react';
import { useSettingsStore } from './useSettingsStore';

// Reset store between tests
beforeEach(() => {
  useSettingsStore.setState({
    timeFormat: '12h',
    weekStart: 'Sun',
    bigText: false,
    theme: 'dark',
    currentView: 'schedule',
    focusDate: 0,
    isSidebarOpen: false,
  });
});

describe('useSettingsStore', () => {
  it('toggles bigText', () => {
    const { result } = renderHook(() => useSettingsStore());
    expect(result.current.bigText).toBe(false);
    act(() => result.current.toggleBigText());
    expect(result.current.bigText).toBe(true);
    act(() => result.current.toggleBigText());
    expect(result.current.bigText).toBe(false);
  });

  it('sets time format', () => {
    const { result } = renderHook(() => useSettingsStore());
    act(() => result.current.setTimeFormat('24h'));
    expect(result.current.timeFormat).toBe('24h');
  });

  it('sets week start', () => {
    const { result } = renderHook(() => useSettingsStore());
    act(() => result.current.setWeekStart('Mon'));
    expect(result.current.weekStart).toBe('Mon');
  });

  it('sets theme', () => {
    const { result } = renderHook(() => useSettingsStore());
    act(() => result.current.setTheme('light'));
    expect(result.current.theme).toBe('light');
  });

  it('sets current view', () => {
    const { result } = renderHook(() => useSettingsStore());
    act(() => result.current.setCurrentView('month'));
    expect(result.current.currentView).toBe('month');
  });

  it('opens and closes sidebar', () => {
    const { result } = renderHook(() => useSettingsStore());
    act(() => result.current.setSidebarOpen(true));
    expect(result.current.isSidebarOpen).toBe(true);
    act(() => result.current.setSidebarOpen(false));
    expect(result.current.isSidebarOpen).toBe(false);
  });
});
