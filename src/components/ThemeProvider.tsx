'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { bigText, theme } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  // This prevents "Hydration Mismatch" by waiting until the 
  // component is mounted in the browser to apply settings.
  useEffect(() => {
    setMounted(true);
    // Add/remove the .dark class to the root HTML element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!mounted) {
    return <div className="antialiased text-base">{children}</div>;
  }

  return (
    <div className={`
      min-h-screen antialiased
      ${theme === 'dark' ? 'dark bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}
      ${bigText ? 'text-xl' : 'text-base'}
    `}>
      {children}
    </div>
  );
}
