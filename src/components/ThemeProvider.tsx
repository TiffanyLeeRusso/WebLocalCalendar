'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { bigText, theme } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  // Wait for mount to ensure Zustand has hydrated from localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply the class to the <html> tag
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  // Prevent the UI from "jumping" by not rendering 
  // the theme-specific UI until we know what the theme is.
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <div className={`min-h-screen ${bigText ? 'text-xl' : 'text-base'}`}>
      {children}
    </div>
  );
}
