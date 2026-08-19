import type { Event as PrismaEvent } from "@/generated/prisma/client";

/**
 * The two recruitment states an event can be in.
 *
 * This is the single source of truth for the string values stored in
 * `Event.status` (SQLite has no native enum type, see prisma/schema.prisma).
 * Vue/Rails equivalent: an ActiveRecord `enum` declaration, or a TS union
 * type used as a Pinia store's discriminated state.
 */
export const EVENT_STATUSES = ["RECRUITING", "CLOSED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  RECRUITING: "募集中",
  CLOSED: "受付終了",
};

/**
 * The Prisma-generated `Event` type is the row shape straight from SQLite
 * (`status` is a plain `string`, dates are `Date`). `EventRecord` narrows
 * `status` to the `EventStatus` union so screen code gets exhaustiveness
 * checking instead of a bare string.
 */
export type EventRecord = Omit<PrismaEvent, "status"> & {
  status: EventStatus;
};

/**
 * Shape used by `EventForm` and by the create/update API request bodies.
 * `date` is kept as a `string` (from an <input type="datetime-local">
 * or a JSON request body) — it is only parsed into a `Date` at the
 * validation boundary (see src/lib/validation.ts).
 */
export type EventFormInput = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: string;
};

export type EventApiError = {
  error: string;
  fieldErrors?: Partial<Record<keyof EventFormInput, string>>;
};
