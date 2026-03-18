// src/lib/utils.ts

export type AppColorKey = 'TEXT'|'BG'|'BG_PANEL'|'BORDER'|'BORDER_FOCUS'|'BUTTON'|'BUTTON_SECONDARY'|'TEXT_SECONDARY'|'TEXT_HIGHLIGHT';

const APP_COLORS: Record<AppColorKey, string> = {
  TEXT: "text-slate-950 dark:text-slate-100",
  BG: "bg-white dark:bg-slate-900",
  BG_PANEL: "bg-blue-100/50 dark:bg-slate-800",
  BORDER: "border-slate-500",
  BORDER_FOCUS: "focus:border-blue-500 focus:outline focus:outline-solid focus-visible:outline focus-visible:outline-solid",
  BUTTON: "bg-blue-700 dark:bg-blue-900 text-white hover:bg-sky-600 dark:hover:bg-sky-700 hover:cursor-pointer transition-colors",
  BUTTON_SECONDARY: "p-4 transition-colors hover:cursor-pointer rounded hover:bg-slate-200 dark:hover:bg-slate-800",
  TEXT_SECONDARY: "text-slate-700 dark:text-slate-300/70",
  TEXT_HIGHLIGHT: "text-blue-600 dark:text-blue-400"
};

export const getAppColor = (key: AppColorKey): string => {
  return APP_COLORS[key] || "";
};

// We have to use the full Tailwind color-class names (with utility classes!)
// in our code (instead of piecing them together in JS or JSX) or Tailwind will
// not generate those classes in the stylesheet. Or we can use Tailwind's
// 'safelist' in the config.
export const EVENT_COLORS = [
    { NAME: 'transparent',
      BG: '',
      BORDER: '',
      BORDER_HOVER: 'hover:border-t-slate-900 dark:hover:border-t-slate-300 hover:border-r-slate-900 dark:hover:border-r-slate-300 hover:border-b-slate-900 dark:hover:border-b-slate-300 hover:border-l-slate-900 dark:hover:border-l-slate-300',
      BORDER_L: 'border-l-slate-900 dark:border-l-slate-300' },

    { NAME: 'blue',
      BG: 'bg-blue-200/30 dark:bg-blue-900/20',
      BORDER: 'border-blue-800',
      BORDER_HOVER: 'hover:border-t-blue-800 hover:border-r-blue-800 hover:border-b-blue-800 hover:border-l-blue-800',
      BORDER_L: 'border-l-blue-800' },

    { NAME: 'green',
      BG: 'bg-emerald-200/40 dark:bg-emerald-900/20',
      BORDER: 'border-emerald-800',
      BORDER_HOVER: 'hover:border-t-emerald-800 hover:border-r-emerald-800 hover:border-b-emerald-800 hover:border-l-emerald-800',
      BORDER_L: 'border-l-emerald-800' },

    { NAME: 'amber',
      BG: 'bg-amber-200/30 dark:bg-amber-900/20',
      BORDER: 'border-amber-800',
      BORDER_HOVER: 'hover:border-t-amber-800 hover:border-r-amber-800 hover:border-b-amber-800 hover:border-l-amber-800',
      BORDER_L: 'border-l-amber-800' },

    { NAME: 'rose',
      BG: 'bg-pink-300/40 dark:bg-pink-900/20',
      BORDER: 'border-pink-800',
      BORDER_HOVER: 'hover:border-t-pink-800 hover:border-r-pink-800 hover:border-b-pink-800 hover:border-l-pink-800',
      BORDER_L: 'border-l-pink-800' },
];

export const findEventColorClass = (colorName?: string) => {
    return EVENT_COLORS.find(c => c.NAME === colorName?.toLowerCase()) || EVENT_COLORS[0];
}

export const getEventColorClass = (colorName?: string,
                                   part?: 'BG'|'BORDER'|'BORDER_HOVER'|'BORDER_L') => {
    const color = findEventColorClass(colorName);
    return part ? color[part] : `${color.BG} ${color.BORDER}`;
};

// Event colors plus the left-side border and full border on hover.
export const getEventWithHoverStyles = (colorName?: string) => {
    return `
${getEventColorClass(colorName)}
hover:brightness-110 hover:cursor-pointer
${getEventColorClass(colorName, 'BORDER_L')} border-t-transparent border-r-transparent border-b-transparent
${getEventColorClass(colorName, 'BORDER_HOVER')}
`;
};

export const getTextClass = (bigText:boolean) => {
  return bigText ? 'text-xl' : 'text-base';
};

// For icons
export const getIconSize = (bigText:boolean) => {
  return bigText ? '24' : '16';
};
