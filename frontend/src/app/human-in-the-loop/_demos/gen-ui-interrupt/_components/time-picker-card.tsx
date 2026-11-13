"use client";

// Harness stand-in, not from the doc: the page's `useInterrupt` render imports
// `TimePickerCard` / `TimeSlot` from here but never prints them. Same exported
// names and props as the CopilotKit showcase's card
// (showcase/integrations/langgraph-typescript/src/app/demos/gen-ui-interrupt/_components/time-picker-card.tsx @ a358fa0),
// without its styled Card/Button/Badge primitives.

import React, { useState } from "react";

export interface TimeSlot {
  label: string;
  iso: string;
}

export interface TimePickerCardProps {
  topic: string;
  attendee?: string;
  slots: TimeSlot[];
  onSubmit: (
    result: { chosen_time: string; chosen_label: string } | { cancelled: true },
  ) => void;
}

export function TimePickerCard({
  topic,
  attendee,
  slots,
  onSubmit,
}: TimePickerCardProps) {
  const [picked, setPicked] = useState<TimeSlot | null>(null);
  const [cancelled, setCancelled] = useState(false);

  if (cancelled) {
    return <p className="text-sm">Cancelled. No time picked.</p>;
  }
  if (picked) {
    return <p className="text-sm">Booked: {picked.label}</p>;
  }

  return (
    <div className="max-w-md space-y-2 rounded border p-4">
      <p className="text-sm font-medium">
        {topic}
        {attendee ? ` with ${attendee}` : ""}: pick a time
      </p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s.iso}
            type="button"
            className="rounded border px-3 py-1 text-sm"
            onClick={() => {
              setPicked(s);
              onSubmit({ chosen_time: s.iso, chosen_label: s.label });
            }}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm"
          onClick={() => {
            setCancelled(true);
            onSubmit({ cancelled: true });
          }}
        >
          None of these work
        </button>
      </div>
    </div>
  );
}
