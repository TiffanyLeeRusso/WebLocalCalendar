'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type CalendarItem } from '@/lib/db';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getAppColor, getEventColorClass } from '@/lib/utils';
import { Clock, Calendar as CalIcon } from 'lucide-react';

interface ScheduleViewProps {
  onEdit: (event: CalendarItem) => void;
}

export default function ScheduleView({ onEdit }: ScheduleViewProps) {
  const { timeFormat } = useSettingsStore();
  
  // Sort by start time
  const events = useLiveQuery(() => 
    db.events.orderBy('startMs').toArray()
  );

  const formatTime = (ms: number) => {
    return new Date(ms).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  };

  if (!events) return <div className="p-8 text-center">Loading schedule...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4 mt-10 mb-10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock /> Upcoming Schedule
      </h2>

      {events.length === 0 ? (
          <div className={`p-12 border-2 border-dashed rounded-xl text-center ${getAppcolor('TEXT')}`}>
          No events found. Add one to get started!
        </div>
      ) : (
        events.map((event) => (
          <div 
            key={event.id}
            className={`p-4 border rounded-xl shadow-sm
                       ${getEventColorClass(event.color)}
                       hover:shadow-md transition-shadow flex items-start justify-between`}
          >
            <div className="space-y-1">
                <h3 className={`font-bold text-lg ${getAppColor('TEXT')}`}>{event.title}</h3>
              {event.note && (
                  <p className={`text-sm line-clamp-2 ${getAppColor('TEXT_SECONDARY')}`}>
                  {event.note}
                </p>
              )}
              <div className="flex gap-4 mt-2 text-xs font-medium uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <CalIcon size={12} />
                  {new Date(event.startMs).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {event.allDay ? 'All Day' : formatTime(event.startMs)}
                </span>
              </div>
            </div>

            <button 
              onClick={() => onEdit(event)}
              className={`p-2 rounded font-medium text-sm ${getAppColor('BUTTON')}`}
            >
              Edit
            </button>
          </div>
        ))
      )}
    </div>
  );
}

