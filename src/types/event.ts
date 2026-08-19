import type { Prisma, Event as PrismaEvent } from "@/generated/prisma/client";
import {
  EVENT_FORMATS,
  LEARNING_CATEGORIES,
  LEARNING_DIFFICULTIES,
  type EventFormat,
  type LearningCategory,
  type LearningDifficulty,
} from "@/types/learning";

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

export { EVENT_FORMATS, LEARNING_CATEGORIES, LEARNING_DIFFICULTIES };
export type { EventFormat, LearningCategory, LearningDifficulty };

/** A technology tag as it comes back from Prisma (the `TechnologyTag`
 * table, joined through the implicit `_EventToTechnologyTag` table). */
export type TechnologyTagRecord = { id: number; name: string };

/** The exact `include` shape every event query in this app uses — kept in
 * one place so `EventWithTags` below always matches what `prisma.event.*`
 * actually returns. */
export const eventInclude = { technologyTags: true } satisfies Prisma.EventInclude;

type EventWithTags = Prisma.EventGetPayload<{ include: typeof eventInclude }>;

/**
 * The Prisma-generated `Event` type is the row shape straight from SQLite
 * (`status`/`category`/`difficulty`/`format` are plain `string`s, dates are
 * `Date`). `EventRecord` narrows those to their union types so screen code
 * gets exhaustiveness checking instead of a bare string, and adds the
 * `technologyTags` relation every query includes.
 */
export type EventRecord = Omit<PrismaEvent, "status" | "category" | "difficulty" | "format"> & {
  status: EventStatus;
  category: LearningCategory;
  difficulty: LearningDifficulty;
  format: EventFormat;
  technologyTags: TechnologyTagRecord[];
};

/** Re-exported so `src/lib/events.ts` doesn't need to import from Prisma
 * directly just to type its narrowing helper. */
export type { EventWithTags };

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
  category: string;
  difficulty: string;
  format: string;
  organizer: string;
  technologyTagNames: string[];
};

export type EventApiError = {
  error: string;
  fieldErrors?: Partial<Record<keyof EventFormInput, string>>;
};
