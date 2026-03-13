'use client';

import { useState, useEffect } from 'react';
import { CalendarItem, db } from '@/lib/db';
import { X, Clock } from 'lucide-react';
import { EVENT_COLORS, getAppColor, getEventColorClass } from '@/lib/utils';

interface EventFormProps {
  initialData?: CalendarItem;
  mode: 'add' | 'edit';
  onClose: () => void;
}

export default function EventForm({ initialData, mode, onClose }: EventFormProps) {
  // Helper: Format Date for input[type="date"]
  const formatDate = (ms: number) => new Date(ms).toISOString().split('T')[0];
  // Helper: Format Time for input[type="time"]
  const formatTime = (ms: number) => new Date(ms).toTimeString().slice(0, 5);

    
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

  const handleNow = () => {
    const now = new Date();
    setStartDate(formatDate(now.getTime()));
    setStartTime(formatTime(now.getTime()));
    // Set end time to 1 hour from now
    const later = new Date(now.getTime() + 3600000);
    setEndDate(formatDate(later.getTime()));
    setEndTime(formatTime(later.getTime()));
  };

  const handleSave = async () => {
    const startMs = new Date(`${startDate}T${startTime}`).getTime();
    const endMs = new Date(`${endDate}T${endTime}`).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      alert("Invalid Date/Time");
      return;
    }

    if (endMs < startMs) {
      alert("End time cannot be before start time!");
      return;
    }

    const getOffset = (type: string) => {
          switch(type) {
              case "10 minutes before": return 600;
              case "1 hour before": return 3600;
              case "1 day before": return 86400;
              default: return 0; // "At time"
          }
    };

    // Determine the correct ID for this event. New event? Existing event? "Ghost" of a recurring event?
    let targetId: string;
  
    if (mode === 'edit' && initialData?.id) {
      // If it's a "ghost" occurrence, strip the suffix to get the real DB ID
      // Example: "uuid-123-occ-171456" -> "uuid-123"
      targetId = initialData.id.split('-occ-')[0];
    } else {
      // Brand new event gets a brand new UUID
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
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
      color: selectedColor,
      repeat: isRepeating ? {
          interval: repeatValue,
          unit: repeatUnit.toLowerCase().replace(/s$/, '') as 'day' | 'week' | 'month' | 'year',
          until: repeatUntilType === 'date' ? new Date(`${repeatUntilDate}T23:59:59`).getTime() : undefined
      } : undefined,
      reminders: hasReminder ? [{ offsetSeconds: getOffset(reminderType) }] : []
    };

    try {
      // dexie.put handles both "add" and "update" if the ID matches
      await db.events.put(eventData);
      onClose();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Database Error: Check console.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <h2 className="font-black uppercase tracking-tight text-lg">{mode} Event</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <input 
            className={`w-full text-xl font-bold bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none pb-1`}
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea 
            className={`w-full p-2 rounded text-sm min-h-[80px] outline-none
                        bg-slate-50 dark:bg-slate-800`}
            placeholder="Add notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Timing Controls */}
        <div className="space-y-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
          <button onClick={handleNow} className={`flex items-center gap-2 text-xs font-black uppercase px-3 py-1.5 rounded-full ${getAppColor('BUTTON')}`}>
              <Clock size={14} /> Set Now
            </button>
            <label className="flex items-center gap-2 text-xs font-bold uppercase hover:cursor-pointer">
              All Day
              <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="w-4 h-4" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-black uppercase mb-1 ${getAppColor('TEXT')}`}>Start</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`w-full border p-2 rounded text-sm ${getAppColor('BG')} ${getAppColor('BORDER')}`} />
              {!isAllDay && <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`w-full mt-2 p-2 rounded text-sm border ${getAppColor('BG')} ${getAppColor('BORDER')}`} />}
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase mb-1 ${getAppColor('TEXT')}`}>End</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`w-full border p-2 rounded text-sm ${getAppColor('BG')} ${getAppColor('BORDER')}`} />
              {!isAllDay && <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`w-full mt-2 border p-2 rounded text-sm ${getAppColor('BG')} ${getAppColor('BORDER')}`} />}
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-slate-500">Event Color</label>
          <div className="flex gap-4">
          {EVENT_COLORS.map((color) => (
              <button
              key={color.NAME}
              onClick={() => setSelectedColor(color.NAME)}
              className={`w-8 h-8 rounded-full transition-all transform hover:cursor-pointer border
                         ${getEventColorClass(color.NAME)}
                         ${selectedColor === color.NAME ? 'ring-4 ring-offset-2 ring-slate-300 dark:ring-slate-600 scale-110' : ''}`}
              title={color.NAME}
                  />
          ))}
          </div>
        </div>

        {/* Reminders */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 font-bold text-sm hover:cursor-pointer">
            <input type="checkbox" checked={hasReminder} onChange={(e) => setHasReminder(e.target.checked)} className="w-4 h-4" />
            Add Reminder
          </label>
          {hasReminder && (
            <select 
              value={reminderType} 
              onChange={(e) => setReminderType(e.target.value)}
              className={`w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded text-sm ${getAppColor('BORDER')}`}
            >
              {["At time", "10 minutes before", "1 hour before", "1 day before"].map(opt => <option key={opt}>{opt}</option>)}
            </select>
          )}
        </div>

        {/* Repeat Logic */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 font-bold text-sm hover:cursor-pointer">
            <input 
              type="checkbox" 
              checked={isRepeating} 
              onChange={(e) => setIsRepeating(e.target.checked)} 
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
            />
            <span >Repeat Event</span>
          </label>

          {isRepeating && (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Frequency Row */}
            <div className="flex gap-2 items-center">
              <span className="text-xs font-black uppercase text-slate-400">Every</span>
              <input 
                type="number" 
                value={repeatValue} 
                onChange={(e) => setRepeatValue(Number(e.target.value))} 
              className="w-16 p-2 text-sm font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" 
              min="1" 
              />
              <select 
                value={repeatUnit} 
                onChange={(e) => setRepeatUnit(e.target.value)} 
                className="flex-1 p-2 text-sm font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                {["Days", "Weeks", "Months", "Years"].map(unit => <option key={unit}>{unit}</option>)}
              </select>
            </div>

            {/* Until Logic */}
            <div className={`pt-2 border-t ${getAppColor('BORDER')}`}>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Repeat Until</label>
              <div className="flex flex-col gap-3">
                {/* Forever vs Date Toggles */}
                <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                  <button 
                    onClick={() => setRepeatUntilType('forever')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${repeatUntilType === 'forever' ? getAppColor('BG') : 'hover:cursor-pointer'}`}
                    >
                    Forever
                  </button>
                  <button 
                    onClick={() => setRepeatUntilType('date')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${repeatUntilType === 'date' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'hover:cursor-pointer'}`}
                    >
                    Specific Date
                  </button>
                </div>

                {/* Date Picker (Hidden if Forever) */}
                {repeatUntilType === 'date' && (
                <input 
                  type="date" 
                  value={repeatUntilDate} 
                  onChange={(e) => setRepeatUntilDate(e.target.value)} 
                    className={`w-full p-2 text-sm font-bold rounded-lg focus:ring-2 focus:ring-blue-500 outline-none animate-in zoom-in-95 duration-150 ${getAppColor('BG')} ${getAppColor('BORDER')}`} 
                />
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <div className={`p-4 border-t bg-slate-50 dark:bg-slate-950 flex gap-2 ${getAppColor('BORDER')}`}>
        {mode === 'edit' && (
          <button 
            onClick={async () => { if(confirm('Delete?')) { await db.events.delete(initialData!.id!); onClose(); }}}
            className="px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
        <button 
          onClick={handleSave}
          className={`flex-1 font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all ${getAppColor('BUTTON')}`}
        >
          Save Event
        </button>
      </div>
    </div>
  );
}
