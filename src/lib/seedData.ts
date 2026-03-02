import { db, CalendarItem } from './db';

export async function seedDatabase() {
  const count = await db.events.count();
  if (count > 0) return; 

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
      note: 'Stay active! Route: Around the park.',
      startMs: getTimeToday(7, 0), // 7:00 AM
      endMs: getTimeToday(7, 45),   // 45 min run
      allDay: false,
      color: 'green',
      repeat: {
        interval: 1,
        unit: 'day',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '🍱 Weekly Team Lunch',
      note: 'Catch up with the crew. Location: Taco Place.',
      startMs: getTimeToday(12, 0), // 12:00 PM
      endMs: getTimeToday(13, 0),   // 1:00 PM
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
      title: '🍽️ Dinner with Friend',
      note: 'Catching up after work.',
      startMs: getTimeToday(17, 0), // 5:00 PM
      endMs: getTimeToday(19, 0),   // 7:00 PM
      allDay: false,
      color: 'green',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      type: 'event',
      title: '💰 Pay Rent',
      note: 'Monthly reminder',
      startMs: new Date(year, month, 1, 9, 0).getTime(), // 1st of this month
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
      note: '',
      startMs: new Date(year, month, 1, 9, 0).getTime(), // 1st of this month
      endMs: new Date(year, month, 1, 10, 0).getTime(),
      allDay: false,
      color: 'rose',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ];

  await db.events.bulkAdd(seedEvents);
  console.log("Database seeded with varied times.");
}
