import { prisma } from "@/lib/prisma";
import { toEventRecord } from "@/lib/events";
import type { EventRecord } from "@/types/event";

/**
 * Shared by the event detail page, its `generateMetadata`, and the edit
 * page — all three need "parse the `[id]` segment, look up the row, or
 * treat it as not-found" and previously duplicated that. Dynamic segment
 * values are always strings, so an id like `"abc"` or `"-1"` is a 404,
 * not a Prisma error.
 */
export async function getEventById(id: string): Promise<EventRecord | null> {
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) return null;

  const row = await prisma.event.findUnique({ where: { id: eventId } });
  return row ? toEventRecord(row) : null;
}
