import type { Event as PrismaEvent } from "@/generated/prisma/client";
import type { EventRecord, EventStatus } from "@/types/event";

/** Prisma's generated `Event.status` is typed as a plain `string` because
 * SQLite has no enum column type. This narrows it to `EventStatus` at the
 * boundary where data leaves the database layer, so every screen below
 * gets the safety of the union type instead of re-checking the string. */
export function toEventRecord(event: PrismaEvent): EventRecord {
  return { ...event, status: asEventStatus(event.status) };
}

function asEventStatus(value: string): EventStatus {
  return value === "CLOSED" ? "CLOSED" : "RECRUITING";
}

/**
 * The status actually shown to visitors. `status` on the row is a manual
 * override an organizer can use to close registration early; independent
 * of that, an event is always treated as closed once it has no remaining
 * capacity. This mirrors a Rails model concern method (e.g.
 * `Event#recruiting?`) — logic that belongs next to the data, not
 * duplicated in every view that renders a status badge.
 */
export function deriveEventStatus(event: EventRecord): EventStatus {
  if (event.status === "CLOSED") return "CLOSED";
  return event.participantCount >= event.capacity ? "CLOSED" : "RECRUITING";
}

export function remainingSlots(event: EventRecord): number {
  return Math.max(event.capacity - event.participantCount, 0);
}

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

/** Full date + time, used on the event detail page ("開催日時"). */
export function formatEventDate(date: Date): string {
  return dateTimeFormatter.format(date);
}

/** Date only, used on event cards ("開催日") to keep the card compact. */
export function formatEventDateShort(date: Date): string {
  return dateFormatter.format(date);
}

/** `<input type="datetime-local">` needs `YYYY-MM-DDTHH:mm` in local time
 * (no timezone suffix) — this is the inverse of what `new Date(str)` does
 * when reading the value back out in `toEventWriteData`. */
export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
