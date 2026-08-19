import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toEventRecord } from "@/lib/events";
import { toEventWriteData, validateEventForm } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

/** Dynamic segments are always strings — reject anything that isn't a
 * positive integer before it ever reaches Prisma. `find`/`update`/`delete`
 * all need a real number for the `id` column. */
function parseEventId(idParam: string): number | null {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** `GET /api/events/[id]` */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const eventId = parseEventId(id);
  if (eventId === null) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ event: toEventRecord(event) });
}

/** `PUT /api/events/[id]` — full update of the editable fields. */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const eventId = parseEventId(id);
  if (eventId === null) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }

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

  try {
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: toEventWriteData(result.data),
    });
    return NextResponse.json({ event: toEventRecord(updated) });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    }
    throw error;
  }
}

/** `DELETE /api/events/[id]` */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const eventId = parseEventId(id);
  if (eventId === null) {
    return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
  }

  try {
    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ id: eventId });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    }
    throw error;
  }
}

/** Prisma's "no row matched `where`" error for update/delete — the
 * moment between a page load and a button click where someone else
 * already deleted the same event. Distinct from `findUnique` returning
 * `null` (used by GET above), which never throws. */
function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"
  );
}
