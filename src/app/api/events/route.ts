import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveEventStatus, toEventRecord } from "@/lib/events";
import { toEventWriteData, validateEventForm } from "@/lib/validation";

/**
 * `GET /api/events` — list events, with the same optional `q`/`status`
 * filters the `/events` page uses. This is a Route Handler: the App
 * Router's take on what Rails calls a controller action, except routing
 * is entirely file-path based (this file's path *is* the route) rather
 * than declared in a separate `routes.rb`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const keyword = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const statusParam = searchParams.get("status");
  const statusFilter =
    statusParam === "RECRUITING" || statusParam === "CLOSED" ? statusParam : "";

  const rows = await prisma.event.findMany({ orderBy: { date: "asc" } });
  const events = rows.map(toEventRecord).filter((event) => {
    const matchesKeyword =
      keyword === "" ||
      event.title.toLowerCase().includes(keyword) ||
      event.location.toLowerCase().includes(keyword);
    const matchesStatus =
      statusFilter === "" || deriveEventStatus(event) === statusFilter;
    return matchesKeyword && matchesStatus;
  });

  return NextResponse.json({ events });
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
    data: toEventWriteData(result.data),
  });

  return NextResponse.json({ event: toEventRecord(created) }, { status: 201 });
}
