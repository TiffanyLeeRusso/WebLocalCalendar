'use client';

import { useState, useRef } from 'react';
import { CalendarItem, db } from '@/lib/db';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFocusOnMount } from '@/hooks/useFocusOnMount';
import { X, Clock, AlertTriangle } from 'lucide-react';
import { EVENT_COLORS, getAppColor, getEventColorClass, getTextClass, getIconSize } from '@/lib/utils';

import { useSettingsStore } from '@/store/useSettingsStore';

interface EventFormProps {
  initialData?: CalendarItem;
  mode: 'add' | 'edit';
  onClose: () => void;
}

export default function EventForm({ initialData, mode, onClose }: EventFormProps) {
  const { bigText, timeFormat } = useSettingsStore();
    
  const focusRef = useFocusOnMount<HTMLDivElement>();
  const formRef = useFocusTrap(true, onClose);

  // Helper: Format Date for input[type="date"]
  const formatDate = (ms: number) => new Date(ms).toISOString().split('T')[0];
  // Helper: Format Time for input[type="time"]
  const formatTime = (ms: number) => new Date(ms).toTimeString().slice(0, 5);

  // Helper to show the user a preview of their time format preference
  const formatDisplayTime = (ms: number) => {
    return new Date(ms).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: timeFormat === '12h' 
    });
  };

  const [title, setTitle] = useState(initialData?.title || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [isAllDay, setIsAllDay] = useState(initialData?.allDay || false);
  const [selectedColor, setSelectedColor] = useState(initialData?.color || 'transparent');

  // Date/Time States
  const [startDate, setStartDate] = useState(formatDate(initialData?.startMs || Date.now()));
  const [startTime, setStartTime] = useState(formatTime(initialData?.startMs || Date.now()));
  const [endDate, setEndDate] = useState(formatDate(initialData?.endMs || (Date.now() + 3600000)));
  const [endTime, setEndTime] = useState(formatTime(initialData?.endMs || (Date.now() + 3600000)));

  // Reminders
  const [hasReminder, setHasReminder] = useState(!!initialData?.reminders?.length);
  const [reminderType, setReminderType] = useState(() => {
    const offset = initialData?.reminders?.[0]?.offsetSeconds;
    if (offset === 600) return "10 minutes before";
    if (offset === 3600) return "1 hour before";
    if (offset === 86400) return "1 day before";
    return "At time";
  });

  // Repeat
  const [isRepeating, setIsRepeating] = useState(!!initialData?.repeat);
  const [repeatValue, setRepeatValue] = useState(initialData?.repeat?.interval || 1);
  const [repeatUnit, setRepeatUnit] = useState(() => {
    const unit = initialData?.repeat?.unit || 'day';
    // Capitalize and add 's' to match your UI dropdown: 'day' -> 'Days'
    return unit.charAt(0).toUpperCase() + unit.slice(1) + 's';
  });
  const [repeatUntilType, setRepeatUntilType] = useState(initialData?.repeat?.until ? 'date' : 'forever');
  const [repeatUntilDate, setRepeatUntilDate] = useState(
    initialData?.repeat?.until ? formatDate(initialData.repeat.until) : formatDate(Date.now() + 31536000000)
  );
  // Validation
  const [errors, setErrors] = useState<{ startEnd?: string; db?: string }>({});

  // Remembered duration in ms. Updated whenever end time changes validly
  const lastDurationRef = useRef<number>(
    (initialData?.endMs ?? Date.now() + 3600000) - (initialData?.startMs ?? Date.now())
  );
  const suppressTimeEvents = useRef(false);

  /* We just update the dates and times now automatically
  const validateDates = (sDate: string, eDate: string, sTime: string, eTime: string, allDay: boolean) => {
      if (allDay) {
          const start = new Date(sDate).getTime();
          const end = new Date(eDate).getTime();
          if (end < start) {
              setErrors(e => ({ ...e, startEnd: 'End date cannot be before start date.' }));
          } else {
              setErrors(e => { const { startEnd, ...rest } = e; return rest; });
          }
      } else {
          const start = new Date(`${sDate}T${sTime}`).getTime();
          const end = new Date(`${eDate}T${eTime}`).getTime();
          if (end < start) {
              setErrors(e => ({ ...e, startEnd: 'End time cannot be before start time.' }));
          } else {
              setErrors(e => { const { startEnd, ...rest } = e; return rest; });
          }
      }
  };
  */

  const handleStartDate = (val: string) => {
        setStartDate(val);
        // Push end date forward if it's now before start
        if (endDate < val) {
            setEndDate(val);
        }
        clampRepeatUntil(val);
        clearStartEndError();
  };

  const handleEndDate = (val: string) => {
        // Clamp to start date if before it
        const clamped = val < startDate ? startDate : val;
        setEndDate(clamped);
        clearStartEndError();
  };

  const handleStartTime = (val: string) => {
        if (suppressTimeEvents.current) return;
        suppressTimeEvents.current = true;

        setStartTime(val);

        // Compute new end by preserving duration
        const newStartMs = new Date(`${startDate}T${val}`).getTime();
        const newEndMs = newStartMs + lastDurationRef.current;
        const newEndDate = new Date(newEndMs);

        setEndDate(formatDate(newEndMs));
        setEndTime(formatTime(newEndMs));

        // If the duration push moved end to a new date, clamp repeat until
        clampRepeatUntil(formatDate(newEndDate.getTime()));
        clearStartEndError();

        suppressTimeEvents.current = false;
  };

  const handleEndTime = (val: string) => {
        if (suppressTimeEvents.current) return;

        setEndTime(val);

        const startMs = new Date(`${startDate}T${startTime}`).getTime();
        const endMs   = new Date(`${endDate}T${val}`).getTime();
        const duration = endMs - startMs;

        if (duration > 0) {
            lastDurationRef.current = duration;
            clearStartEndError();
        } else {
            // Invalid — reset to 1 hour, same as Unity
            lastDurationRef.current = 3600000;
            setErrors(e => ({ ...e, startEnd: 'End time cannot be before start time.' }));
        }
  };

  const handleAllDay = (val: boolean) => {
        setIsAllDay(val);
        clearStartEndError();
  };

  const clampRepeatUntil = (newStartDate: string) => {
        if (repeatUntilType === 'date' && repeatUntilDate < newStartDate) {
            setRepeatUntilDate(newStartDate);
        }
  };

  const clearStartEndError = () => {
      setErrors(e => { const { startEnd, ...rest } = e; return rest; });
  };

  const handleNow = () => {
        const now = new Date();
        const newStart     = formatDate(now.getTime());
        const newStartTime = formatTime(now.getTime());
        const laterMs      = now.getTime() + 3600000;
        const newEnd       = formatDate(laterMs);
        const newEndTime   = formatTime(laterMs);
        lastDurationRef.current = 3600000;
        setStartDate(newStart);
        setStartTime(newStartTime);
        setEndDate(newEnd);
        setEndTime(newEndTime);
        clearStartEndError();
  };

  const handleSave = async () => {
        // Final guard -- shouldn't normally be reachable if realtime validation is working
        const startMs = new Date(`${startDate}T${startTime}`).getTime();
        const endMs   = new Date(`${endDate}T${endTime}`).getTime();

        if (isNaN(startMs) || isNaN(endMs)) {
            setErrors(e => ({ ...e, startEnd: 'Invalid date or time value.' }));
            return;
        }
        if (endMs < startMs) {
            setErrors(e => ({ ...e, startEnd: 'End time cannot be before start time.' }));
            return;
        }

        const getOffset = (type: string) => {
            switch (type) {
            case "10 minutes before": return 600;
            case "1 hour before":     return 3600;
            case "1 day before":      return 86400;
            default:                  return 0;
            }
        };

        let targetId: string;
        if (mode === 'edit' && initialData?.id) {
            targetId = initialData.id.split('-occ-')[0];
        } else {
            targetId = crypto.randomUUID();
        }

        const eventData: CalendarItem = {
            id: targetId,
            type: 'event',
            title: title || '(No Title)',
            note,
            allDay: isAllDay,
            startMs,
            endMs,
            color: selectedColor,
            repeat: isRepeating ? {
                interval: repeatValue,
                unit: repeatUnit.toLowerCase().replace(/s$/, '') as 'day' | 'week' | 'month' | 'year',
                until: repeatUntilType === 'date' ? new Date(`${repeatUntilDate}T23:59:59`).getTime() : undefined
            } : undefined,
            reminders: hasReminder ? [{ offsetSeconds: getOffset(reminderType) }] : []
        };

        try {
            setErrors({});
            await db.events.put(eventData);
            onClose();
        } catch (err) {
            console.error("Save Error:", err);
            setErrors(e => ({ ...e, db: 'Could not save event. Please try again.' }));
        }
  };

  return (
    <div tabIndex={-1}
         role="dialog"
         ref={formRef as React.RefObject<HTMLDivElement>}
         className={`z-30 flex flex-col h-full shadow-xl border-l ${getAppColor('BG')} ${getAppColor('BORDER')}`}>
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-950 ${getAppColor('BORDER')}`}>
        <h2 className={`font-black uppercase tracking-tight ${getTextClass(bigText)}`}>
          {mode} Event
        </h2>
          <button aria-label="Close" onClick={onClose} className={`${getAppColor('BUTTON_SECONDARY')}`}>
          <X size={getIconSize(bigText)} />
        </button>
      </div>

      <div aria-label={mode === 'add' ? 'Add event' : `Edit event: ${initialData?.title}`}
           className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <input 
            className={`w-full font-bold bg-transparent border-b-2 outline-none pb-1 transition-all ${getAppColor('BORDER')} ${getAppColor('BORDER_FOCUS')} ${getTextClass(bigText)} focus-visible:!outline-none`}
            placeholder="Event Title"
            aria-label="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {/* Note */}
          <textarea 
            className={`w-full p-3 rounded outline-none border
                       ${getAppColor('BG_PANEL')} ${getAppColor('BORDER')} ${getAppColor('BORDER_FOCUS')} ${getTextClass(bigText)}`}
            placeholder="Add notes..."
            aria-label="Event notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        {/* Timing Controls */}
        <fieldset className={`space-y-4 p-4 rounded-2xl border ${getAppColor('BG_PANEL')} ${getAppColor('BORDER')}`}>
          <legend className={`mb-0 font-bold px-1 ${getTextClass(bigText)}`}>Date &amp; Time</legend>

          <div className="flex items-center justify-between">
            <button onClick={handleNow} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-transform active:scale-95 ${getAppColor('BUTTON')} ${getTextClass(bigText)}`}>
              <Clock size={getIconSize(bigText)} /> Set Now
            </button>
            <label className={`flex items-center gap-3 hover:cursor-pointer ${getTextClass(bigText)}`}>
              All Day
              <input type="checkbox" checked={isAllDay} onChange={(e) => handleAllDay(e.target.checked)} className="w-5 h-5 rounded-md hover:cursor-pointer" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block ${getTextClass(bigText)}`}>Start</label>
              <input aria-label="Start date" type="date" value={startDate} onChange={(e) => handleStartDate(e.target.value)} className={`w-full border p-2 rounded-lg font-bold ${getAppColor('BG')} ${getAppColor('BORDER')} ${getTextClass(bigText)}`} />
              {!isAllDay && (
                <div className="relative">
                  <input aria-label="Start time" type="time" value={startTime} onChange={(e) => handleStartTime(e.target.value)} className={`w-full p-2 rounded-lg font-bold border ${getAppColor('BG')} ${getAppColor('BORDER')} ${getTextClass(bigText)}`} />
                  <p className="mt-1 text-[12px] font-bold text-right">{timeFormat === '12h' ? '12-Hour Mode' : '24-Hour Mode'}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className={`block ${getTextClass(bigText)}`}>End</label>
              <input aria-label="End date" type="date" value={endDate} onChange={(e) => handleEndDate(e.target.value)} className={`w-full border p-2 rounded-lg font-bold ${getAppColor('BG')} ${getAppColor('BORDER')} ${getTextClass(bigText)}`} />
              {!isAllDay && (
                <input aria-label="End time" type="time" value={endTime} onChange={(e) => handleEndTime(e.target.value)} className={`w-full p-2 rounded-lg font-bold border ${getAppColor('BG')} ${getAppColor('BORDER')} ${getTextClass(bigText)}`} />
              )}
            </div>
          </div>
        </fieldset>

        {/* Color picker */}
        <fieldset className="space-y-3">
          <legend className={`block ${getTextClass(bigText)}`}>Event Color</legend>
          <div className="flex flex-wrap gap-3">
            {EVENT_COLORS.map((color) => (
              <button
                key={color.NAME}
                aria-label={`${color.NAME} ${selectedColor === color.NAME ? '(selected)' : ''}`}
                onClick={() => setSelectedColor(color.NAME)}
                className={`w-9 h-9 rounded-full border shadow-sm hover:cursor-pointer
                           ${getEventColorClass(color.NAME)}
                           ${selectedColor === color.NAME ? 'ring-4 ring-offset-2 ring-blue-500' : 'hover:brightness-210'}`}
              />
            ))}
          </div>
        </fieldset>

        {/* Reminders */}
        <div className="space-y-3">
          <label htmlFor="add-reminder" className={`flex items-center gap-2 font-bold ${getTextClass(bigText)} hover:cursor-pointer`}>
            <input id="add-reminder" type="checkbox" checked={hasReminder} onChange={(e) => setHasReminder(e.target.checked)} className="w-4 h-4 hover:cursor-pointer" />
            Add Reminder
          </label>
          {hasReminder && (
            <select 
              value={reminderType}
              aria-label="Reminder timing"
              onChange={(e) => setReminderType(e.target.value)}
              className={`w-full p-2 border rounded ${getTextClass(bigText)} ${getAppColor('BORDER')} ${getAppColor('BG_PANEL')}`}
            >
              {["At time", "10 minutes before", "1 hour before", "1 day before"].map(opt => <option key={opt}>{opt}</option>)}
            </select>
          )}
        </div>

        {/* Repeat Logic */}
        <div className="space-y-3">
          <label htmlFor="add-repeat" className={`flex items-center gap-2 font-bold ${getTextClass(bigText)} hover:cursor-pointer`}>
            <input id="add-repeat"
              type="checkbox" 
              checked={isRepeating} 
              onChange={(e) => setIsRepeating(e.target.checked)} 
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 hover:cursor-pointer" 
            />
            <span>Repeat Event</span>
          </label>

          {isRepeating && (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Frequency Row */}
            <div className="flex gap-2 items-center">
              <label htmlFor="repeat-interval" className={`${getTextClass(bigText)}`}>Every</label>
              <input id="repeat-interval"
                type="number" 
                value={repeatValue}
                aria-label="Repeat interval"
                onChange={(e) => setRepeatValue(Number(e.target.value))} 
              className={`w-16 p-2 ${getTextClass(bigText)} font-bold rounded-lg bg-white dark:bg-slate-900 border ${getAppColor('BORDER')} ${getAppColor('BORDER_FOCUS')} outline-none`} 
              min="1" 
              />
              <select
                value={repeatUnit}
                aria-label="Repeat unit"
                onChange={(e) => setRepeatUnit(e.target.value)} 
                className={`flex-1 p-2 ${getTextClass(bigText)} font-bold rounded-lg bg-white dark:bg-slate-900 border ${getAppColor('BORDER')} ${getAppColor('BORDER_FOCUS')}`}
                >
                {["Days", "Weeks", "Months", "Years"].map(unit => <option key={unit}>{unit}</option>)}
              </select>
            </div>

            {/* Until Logic */}
            <div className={`pt-2 border-t ${getAppColor('BORDER')}`}>
              <label className={`block ${getTextClass(bigText)} mb-2`}>Repeat Until</label>
              <div className="flex flex-col gap-3">
                {/* Forever vs Date Toggles */}
                <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                  <button
                    aria-label="Repeat forever"
                    aria-pressed={repeatUntilType === 'forever'}
                    onClick={() => setRepeatUntilType('forever')}
                    className={`flex-1 py-1.5 ${getTextClass(bigText)} font-bold rounded-md transition-all ${repeatUntilType === 'forever' ? getAppColor('BG') : 'hover:cursor-pointer'}`}
                    >
                    Forever
                  </button>
                  <button
                    aria-label="Repeat until specific date"
                    aria-pressed={repeatUntilType === 'date'}
                    onClick={() => setRepeatUntilType('date')}
                    className={`flex-1 py-1.5 ${getTextClass(bigText)} font-bold rounded-md transition-all ${repeatUntilType === 'date' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'hover:cursor-pointer'}`}
                    >
                    Specific Date
                  </button>
                </div>

                {/* Date Picker (Hidden if Forever) */}
                {repeatUntilType === 'date' && (
                <input aria-label="Repeat until date"
                  type="date" 
                  value={repeatUntilDate} 
                  onChange={(e) => setRepeatUntilDate(e.target.value)} 
                  className={`w-full p-2 border ${getTextClass(bigText)} font-bold rounded-lg ${getAppColor('BG')} ${getAppColor('BORDER')} `} 
                />
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <div className={`p-4 border-t bg-slate-50 dark:bg-slate-950 flex flex-col gap-2 ${getAppColor('BORDER')}`}>

        {/* Inline validation errors (aria-live region so they're announced immediately) */}
        {(errors.startEnd || errors.db) && (
        <div
          role="alert"
          aria-live="assertive"
          className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2"
          >
          <AlertTriangle size={16} aria-hidden="true" />
          {errors.startEnd || errors.db}
        </div>
        )}

        <div className="flex gap-2">
          {mode === 'edit' && (
          <button
            aria-label={`Delete event: ${initialData?.title}`}
            onClick={async () => {
            if (confirm('Delete?')) {
            await db.events.delete(initialData!.id!);
            onClose();
            }
            }}
            className={`px-4 py-2 text-red-600 font-bold ${getTextClass(bigText)} hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
            >
            Delete
          </button>
          )}
          <button
            onClick={handleSave}
            disabled={!!errors.startEnd}
            aria-disabled={!!errors.startEnd}
            className={`flex-1 tracking-widest py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all
            ${errors.startEnd
            ? 'opacity-50 cursor-not-allowed'
            : getAppColor('BUTTON')}`}
            >
            Save Event
          </button>
        </div>
      </div>

    </div>
  );
}
