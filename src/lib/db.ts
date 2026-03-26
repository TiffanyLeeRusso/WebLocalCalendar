import Dexie, { type EntityTable } from 'dexie';
import { seedDatabase } from './seedData';

// Define the Interfaces (The TypeScript side)
export interface RepeatRule {
  interval: number;
  unit: 'day' | 'week' | 'month' | 'year';
  until?: number; // Unix timestamp ms
}

export interface Reminder {
  offsetSeconds: number;
}

export interface CalendarItem {
  id: string;           // UUID
  type: 'event' | 'task';
  title: string;
  note: string;
  startMs: number;      // Unix timestamp ms
  endMs: number;        // Unix timestamp ms
  allDay: boolean;
  color?: string;

  // Optional relations (Nested for ease of local-first access)
  repeat?: RepeatRule;
  reminders?: Reminder[];
}

// Initialize the Database
const db = new Dexie('LocalCalendarDB') as Dexie & {
  events: EntityTable<CalendarItem, 'id'>;
};

// Define Schema (The IndexedDB side)
// Syntax: 'primaryKey, index1, index2, index.nestedProperty'
db.version(1).stores({
  events: 'id, type, startMs, endMs, title'
});

db.on('ready', () => {
  return seedDatabase();
});

export { db };
