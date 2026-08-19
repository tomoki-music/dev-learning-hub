import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toEventRecord } from "@/lib/events";
import { filterEvents } from "@/lib/event-filters";
import { toEventWriteData, validateEventForm } from "@/lib/validation";
import { eventInclude } from "@/types/event";
import type { EventFormat, EventStatus, LearningCategory, LearningDifficulty } from "@/types/event";
import { EVENT_FORMATS, LEARNING_CATEGORIES, LEARNING_DIFFICULTIES } from "@/types/learning";

/**
 * `GET /api/events` — list events, with the same optional filters the
 * `/events` page's search UI uses (`q`, `category`, `difficulty`,
 * `format`, `status`, repeated `tag`). This is a Route Handler: the App
 * Router's take on what Rails calls a controller action, except routing
 * is entirely file-path based (this file's path *is* the route) rather
 * than declared in a separate `routes.rb`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const keyword = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status");
  const categoryParam = searchParams.get("category");
  const difficultyParam = searchParams.get("difficulty");
  const formatParam = searchParams.get("format");
  const tags = searchParams.getAll("tag");

  const rows = await prisma.event.findMany({ orderBy: { date: "asc" }, include: eventInclude });
  const events = filterEvents(rows.map(toEventRecord), {
    keyword,
    status: asOneOf<EventStatus>(statusParam, ["RECRUITING", "CLOSED"]),
    category: asOneOf<LearningCategory>(categoryParam, LEARNING_CATEGORIES),
    difficulty: asOneOf<LearningDifficulty>(difficultyParam, LEARNING_DIFFICULTIES),
    format: asOneOf<EventFormat>(formatParam, EVENT_FORMATS),
    tags,
  });

  return NextResponse.json({ events });
}

function asOneOf<T extends string>(value: string | null, allowed: readonly T[]): T | "" {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

/**
 * `POST /api/events` — create an event. Request bodies are untyped JSON
 * over the wire, so `validateEventForm` (the same zod schema `EventForm`
 * uses for its inline messages) is what actually guarantees the shape —
 * never trust a client-side check alone, since this endpoint can be
 * called by anything, not only our own form.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません" },
      { status: 400 },
    );
  }

  const result = validateEventForm(body);
  if (!result.success) {
    return NextResponse.json(result.error, { status: 400 });
  }

  const created = await prisma.event.create({
    data: {
      ...toEventWriteData(result.data),
      // `connect` (not `set`) on create: these tags already exist as
      // `TechnologyTag` rows (seeded from the same TECHNOLOGY_TAGS list
      // the form's checkboxes are built from), so we just wire up the
      // join rows — nothing new is created here.
      technologyTags: { connect: result.data.technologyTagNames.map((name) => ({ name })) },
    },
    include: eventInclude,
  });

  return NextResponse.json({ event: toEventRecord(created) }, { status: 201 });
}
