// src/lib/utils.ts

export const EVENT_COLORS = [
  { name: 'blue', bg: 'bg-blue-500', border: 'border-blue-600' },
  { name: 'green', bg: 'bg-emerald-500', border: 'border-emerald-600' },
  { name: 'amber', bg: 'bg-amber-500', border: 'border-amber-600' },
  { name: 'rose', bg: 'bg-rose-500', border: 'border-rose-600' },
];

/**
 * getColorClass
 * Maps a color name to specific Tailwind CSS classes for consistent styling.
 * Returns a string of classes for background, text, and border.
 */
export const getColorClass = (colorName?: string) => {
  switch (colorName?.toLowerCase()) {
    case 'green':
      return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-600';
    case 'amber':
      return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-600';
    case 'rose':
      return 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-600';
    case 'blue':
    default:
      return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-600';
  }
};
