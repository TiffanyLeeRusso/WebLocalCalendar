import { db, CalendarItem } from './db';

export async function seedDatabase() {
  // Use a transaction to prevent race conditions
  await db.transaction('rw', db.events, async () => {
    const count = await db.events.count();
    
    if (count > 0) {
      console.log("Database already contains data. Skipping seed.");
      return;
    }

    console.log("Seeding database with initial events...");

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    // Helper to create a specific time today
    const getTimeToday = (hours: number, minutes: number = 0) => 
      new Date(year, month, date, hours, minutes).getTime();

    const seedEvents: CalendarItem[] = [
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '🏃 Morning Run',
      note: 'Exercise! Route: Around the park.',
      startMs: getTimeToday(7, 0), // 7:00 AM
      endMs: getTimeToday(7, 45),   // 45 min run
      allDay: false,
      repeat: {
        interval: 1,
        unit: 'week',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '🍱 Weekly Team Lunch',
      note: 'Catch up with the crew. Location: Taco Place.',
      startMs: new Date(year, month, 5, 12, 0).getTime(),
      endMs: new Date(year, month, 5, 13, 0).getTime(),
      allDay: false,
      color: 'green',
      repeat: {
        interval: 1,
        unit: 'week',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '🍽️ Dinner with Friend',
      note: 'Catching up after work.',
      startMs: new Date(year, month, 3, 9, 0).getTime(),
      endMs: new Date(year, month, 3, 10, 0).getTime(),
      allDay: false,
      color: 'blue',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '💰 Pay Rent',
      note: 'Monthly reminder',
      startMs: new Date(year, month, 1, 9, 0).getTime(),
      endMs: new Date(year, month, 1, 10, 0).getTime(),
      allDay: true,
      repeat: {
        interval: 1,
        unit: 'month',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '🦷 Dentist',
      note: 'Doctor visit',
      startMs: new Date(year, month, 1, 9, 0).getTime(),
      endMs: new Date(year, month, 1, 10, 0).getTime(),
      allDay: false,
      color: 'amber',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '👀 Eye doctor',
      note: 'Doctor visit',
      startMs: new Date(year, month, 15, 9, 0).getTime(),
      endMs: new Date(year, month, 15, 10, 0).getTime(),
      allDay: false,
      color: 'amber',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '🏖️ Vacation',
      note: 'Beach',
      startMs: new Date(year, month, 17, 9, 0).getTime(),
      endMs: new Date(year, month, 19, 10, 0).getTime(),
      allDay: false,
      color: 'blue',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: 'Spa',
      note: 'appointment',
      startMs: new Date(year, month, 18, 13, 0).getTime(),
      endMs: new Date(year, month, 18, 14, 0).getTime(),
      allDay: false,
      color: 'blue',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: 'Buffet dinner',
      note: '',
      startMs: new Date(year, month, 18, 17, 0).getTime(),
      endMs: new Date(year, month, 18, 18, 0).getTime(),
      allDay: false,
      color: 'blue',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }];

    await db.events.bulkAdd(seedEvents);
    console.log("Database seeded with varied times.");
  });
}
