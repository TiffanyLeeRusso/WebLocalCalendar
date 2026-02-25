'use client';

import React, { useState } from 'react';
import { db, CalendarItem } from '@/lib/db';
import { X, Save, Eye } from 'lucide-react';

interface EventFormProps {
  initialData?: Partial<CalendarItem>;
  mode: 'add' | 'edit' | 'preview';
  onClose: () => void;
}

export default function EventForm({ initialData, mode, onClose }: EventFormProps) {
  const isPreview = mode === 'preview';
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    note: initialData?.note || '',
    startMs: initialData?.startMs || Date.now(),
    endMs: initialData?.endMs || Date.now() + 3600000, // +1hr
    allDay: initialData?.allDay || false,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;

    const event: CalendarItem = {
      id: initialData?.id || crypto.randomUUID(),
      type: 'event',
      title: formData.title || 'Untitled Event',
      note: formData.note,
      startMs: formData.startMs,
      endMs: formData.endMs,
      allDay: formData.allDay,
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await db.events.put(event); // .put handles both add and update
      onClose();
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    if (confirm("Are you sure you want to delete this event?")) {
        try {
            await db.events.delete(initialData.id);
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold capitalize">{mode} Event</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 flex-1">
        <div>
          <label htmlFor="event-title" className="block text-sm font-medium mb-1">Title</label>
          <input id="event-title"
                 disabled={isPreview}
                 type="text"
                 className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                 value={formData.title}
                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                 placeholder="My event name.."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea
            disabled={isPreview}
            className="w-full p-2 border rounded h-24 dark:bg-slate-800 dark:border-slate-700"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="allDay"
            type="checkbox"
            disabled={isPreview}
            checked={formData.allDay}
            onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
          />
          <label htmlFor="allDay" className="text-sm">All Day Event</label>
        </div>

        {!isPreview && (
          <div className="flex flex-col gap-2 mt-auto pt-6">
            <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                <Save size={18} />
                {mode === 'edit' ? 'Save Changes' : 'Create Event'}
            </button>

            {mode === 'edit' && (
                <button type="button"
                onClick={handleDelete}
                className="w-full bg-transparent hover:bg-red-50 cursor-pointer dark:hover:bg-red-950/30 text-red-500 text-sm font-medium py-2 rounded-lg transition-colors">
                    Delete Event
                </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
