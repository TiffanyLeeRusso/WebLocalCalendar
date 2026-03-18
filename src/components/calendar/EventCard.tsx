import { CalendarItem } from '@/lib/db';
import { Clock, Pencil, Repeat, Bell } from 'lucide-react';
import {
  getAppColor,
  getEventColorClass,
  getTextClass,
  getEventWithHoverStyles,
  getIconSize
} from '@/lib/utils';

type CardMode = 'compact-date' | 'compact-time' | 'full';

interface EventCardProps {
  event: CalendarItem;
  bigText: boolean;
  mode: CardMode;
  currentDate?: Date;
  onClick: (event: CalendarItem) => void;
  timeFormat?: '12h' | '24h'; // Optional, defaults to 12h logic
}

export default function EventCard({
  event,
  bigText,
  mode,
  currentDate = new Date(),
  onClick,
  timeFormat = '12h'
}: EventCardProps) {

  // Helpers
  const formatTime = (ms: number) => {
    return new Date(ms).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h'
    });
  };

  const hasReminder = event.reminders && event.reminders.length > 0;

  // Identify relationship between event and "Today" (currentDate)
  const today = new Date(currentDate).setHours(0, 0, 0, 0);
  const startDay = new Date(event.startMs).setHours(0, 0, 0, 0);
  const endDay = new Date(event.endMs).setHours(0, 0, 0, 0);

  const isFirstDay = today === startDay;
  const isLastDay = today === endDay;
  const isMiddleDay = today > startDay && today < endDay;
  const isSingleDay = isFirstDay && isLastDay;

  let timeDisplay = "";
  if (event.allDay) {
    timeDisplay = "All Day";
  } else if (isSingleDay) {
    timeDisplay = `${formatTime(event.startMs)} - ${formatTime(event.endMs)}`;
  } else if (isFirstDay) {
    timeDisplay = `${formatTime(event.startMs)} →`;
  } else if (isLastDay) {
    timeDisplay = `→ ${formatTime(event.endMs)}`;
  } else if (isMiddleDay) {
    timeDisplay = "→";
  }

  // --- COMPACT MODE (with date) ---
  if (mode === 'compact-date') {
    return (
      <button
        onClick={() => onClick(event)}
        className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all
          ${getEventWithHoverStyles(event.color)} ${getTextClass(bigText)}
        `}
      >
        <div className="font-bold truncate">{event.title}</div>
            <div className="flex justify-between items-start gap-2">
            <div className="flex gap-1 opacity-60 mt-1">
            {event.repeat && <Repeat size={getIconSize(bigText)} />}
            {hasReminder && <Bell size={getIconSize(bigText)} />}
           </div>
        </div>
        <div className={`${getAppColor('TEXT_SECONDARY')}`}>
          {new Date(event.startMs).toLocaleDateString()}
        </div>
      </button>
    );
  }

  // --- COMPACT MODE (with time) ---
  if (mode === 'compact-time') {
    return (
      <button
        onClick={() => onClick(event)}
        className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all shadow-sm
${getEventWithHoverStyles(event.color)} ${bigText ? 'text-xl' : 'text-xs'}
        `}
      >
        <div className="font-bold truncate leading-tight">{event.title}</div>
        <div className="flex justify-between items-start gap-2">
          <div className={`flex gap-1 ${getAppColor('TEXT_SECONDARY')}`}>
            {event.repeat && <Repeat size={getIconSize(bigText)} />}
            {hasReminder && <Bell size={getIconSize(bigText)} />}
          </div>
        </div>
        <div className={`uppercase mt-0.5 ${getAppColor('TEXT_SECONDARY')}`}>
          {timeDisplay}
        </div>
      </button>
    );
  }

  // --- FULL MODE ---
  return (
    <div
      className={`
        group p-4 border-2 rounded-2xl transition-all hover:shadow-md
        flex items-start justify-between gap-4
        ${getEventColorClass(event.color)}
      `}
    >
      <div className="space-y-1 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-bold leading-tight truncate ${getTextClass(bigText)} ${getAppColor('TEXT')}`}>
            {event.title}
          </h3>
          {hasReminder && (<Bell size={getIconSize(bigText)} />)}
        </div>

        {event.note && (
          <p className={`line-clamp-2 font-medium ${getAppColor('TEXT_SECONDARY')}`}>
            {event.note}
          </p>
        )}

        <div className={`flex flex-wrap items-center gap-3 mt-2 ${getAppColor('TEXT_SECONDARY')}`}>
          <span className="flex items-center gap-1.5">
          <Clock size={getIconSize(bigText)} />
          {timeDisplay}
          </span>

          {event.repeat && (
            <span className="flex items-center gap-1">
              <Repeat size={getIconSize(bigText)} />
              <span className="capitalize">
                {event.repeat.unit}ly
              </span>
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onClick(event)}
        className={`
          flex items-center gap-4 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-transform active:scale-95
          ${getAppColor('BUTTON')} ${getTextClass(bigText)}}
        `}
      >
          <Pencil size={getIconSize(bigText)} />
      </button>
    </div>
  );
}
