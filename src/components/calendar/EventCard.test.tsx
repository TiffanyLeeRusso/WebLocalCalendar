import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCard from './EventCard';
import { CalendarItem } from '@/lib/db';

const baseEvent: CalendarItem = {
  id: 'evt-1',
  type: 'event',
  title: 'Team Standup',
  note: 'Daily sync',
  startMs: new Date('2026-03-28T09:00:00').getTime(),
  endMs:   new Date('2026-03-28T09:30:00').getTime(),
  allDay: false,
  color: 'transparent',
};

describe('EventCard', () => {
  describe('compact-date mode', () => {
    it('renders the event title', () => {
      render(<EventCard event={baseEvent} mode="compact-date" bigText={false} timeFormat="12h" onClick={jest.fn()} />);
      expect(screen.getByText('Team Standup')).toBeInTheDocument();
    });

    it('has an aria-label with title and date', () => {
      render(<EventCard event={baseEvent} mode="compact-date" bigText={false} timeFormat="12h" onClick={jest.fn()} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Team Standup'));
    });

    it('calls onClick when clicked', async () => {
      const onClick = jest.fn();
      render(<EventCard event={baseEvent} mode="compact-date" bigText={false} timeFormat="12h" onClick={onClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith(baseEvent);
    });
  });

  describe('compact-time mode', () => {
    it('includes repeat indicator in aria-label', () => {
      const event = { ...baseEvent, repeat: { interval: 1, unit: 'week' as const } };
      render(<EventCard event={event} mode="compact-time" bigText={false} timeFormat="12h" onClick={jest.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('Repeats'));
    });

    it('includes reminder indicator in aria-label', () => {
      const event = { ...baseEvent, reminders: [{ offsetSeconds: 600 }] };
      render(<EventCard event={event} mode="compact-time" bigText={false} timeFormat="12h" onClick={jest.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('reminder'));
    });

    it('shows All Day for all-day events', () => {
      const event = { ...baseEvent, allDay: true };
      render(<EventCard event={event} mode="compact-time" bigText={false} timeFormat="12h" onClick={jest.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringContaining('All day'));
    });
  });
});
