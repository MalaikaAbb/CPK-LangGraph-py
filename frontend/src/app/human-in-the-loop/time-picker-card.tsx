"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

export interface TimeSlot {
  label: string;
  iso: string;
}

export interface TimePickerCardProps {
  topic: string;
  attendee?: string;
  slots: TimeSlot[];
  /**
   * The tool call's lifecycle status, passed straight through from the render
   * prop. Anything other than `"executing"` means the call is already settled —
   * usually because this is a replayed message from earlier in the thread — so
   * the buttons must not be live.
   */
  status?: string;
  onSubmit: (
    result: { chosen_time: string; chosen_label: string } | { cancelled: true },
  ) => void;
}

/**
 * Renders an in-chat "Book a call" card with a small grid of time slots.
 * Used by `useHumanInTheLoop`: the ADK backend exposes `book_call` as a
 * frontend tool the model is instructed to call, and `demo-chat/page.tsx`
 * registers a matching `useHumanInTheLoop` that renders this card inline as a
 * chat message bubble. The user's picked slot (or cancellation) is returned to
 * the agent via `respond(...)`, which is what unblocks the run.
 */
export function TimePickerCard({
  topic,
  attendee,
  slots,
  status,
  onSubmit,
}: TimePickerCardProps) {
  const [picked, setPicked] = useState<TimeSlot | null>(null);
  const [cancelled, setCancelled] = useState(false);
  // A settled tool call is not answerable — without this, scrolling back to an
  // old card and clicking a slot calls `respond` on a run that has finished.
  const settled = status !== undefined && status !== "executing";
  const disabled = picked !== null || cancelled || settled;

  if (cancelled) {
    return (
      <Card className="max-w-md" data-testid="time-picker-cancelled">
        <CardContent className="flex items-center gap-2 p-4 pt-4">
          <Badge variant="destructive">Cancelled</Badge>
          <span className="text-sm text-neutral-600">No time picked.</span>
        </CardContent>
      </Card>
    );
  }

  if (picked) {
    return (
      <Card
        className="max-w-md border-emerald-200 bg-emerald-50/40"
        data-testid="time-picker-picked"
      >
        <CardContent className="flex items-center gap-2 p-4 pt-4">
          <Badge variant="success">Booked</Badge>
          <span className="text-sm text-neutral-800">
            <span className="font-semibold">{picked.label}</span>
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md" data-testid="time-picker-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">Book a call</Badge>
          {attendee && (
            <span className="text-xs text-neutral-500">With {attendee}</span>
          )}
        </div>
        <CardTitle className="pt-1">{topic}</CardTitle>
        <CardDescription>Pick a time that works for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s) => (
            <Button
              key={s.iso}
              variant="outline"
              disabled={disabled}
              data-testid="time-picker-slot"
              onClick={() => {
                setPicked(s);
                onSubmit({ chosen_time: s.iso, chosen_label: s.label });
              }}
              className="justify-start"
            >
              {s.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => {
            setCancelled(true);
            onSubmit({ cancelled: true });
          }}
          className="mt-3 w-full text-neutral-500"
          data-testid="time-picker-cancel"
        >
          None of these work
        </Button>
      </CardContent>
    </Card>
  );
}