import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

type FakeTag = { id: number; name: string };
type FakeEvent = {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  participantCount: number;
  status: string;
  category: string;
  difficulty: string;
  format: string;
  organizer: string;
  createdAt: Date;
  updatedAt: Date;
  technologyTags: FakeTag[];
};

// A tiny in-memory stand-in for `prisma.event.*`, scoped to this test file.
// Route Handlers are plain async functions (GET/POST/etc. exported from
// route.ts) — no test server is needed, they can be imported and called
// directly, as long as the Prisma singleton they import is mocked out.
let events: FakeEvent[] = [];
let nextId = 1;
let nextTagId = 1;
const tagsByName = new Map<string, FakeTag>();

function resolveTags(names: string[]): FakeTag[] {
  return names.map((name) => {
    const existing = tagsByName.get(name);
    if (existing) return existing;
    const tag = { id: nextTagId++, name };
    tagsByName.set(name, tag);
    return tag;
  });
}

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      findMany: vi.fn(async () => [...events].sort((a, b) => a.date.getTime() - b.date.getTime())),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const { technologyTags, ...rest } = data as {
          technologyTags?: { connect?: { name: string }[] };
        } & Record<string, unknown>;
        const event: FakeEvent = {
          id: nextId++,
          participantCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          technologyTags: resolveTags((technologyTags?.connect ?? []).map((t) => t.name)),
          ...rest,
        } as FakeEvent;
        events.push(event);
        return event;
      }),
    },
  },
}));

const { GET, POST } = await import("@/app/api/events/route");

const validBody = {
  title: "Ruby基礎もくもく会",
  description: "Rubyの基礎文法を教材に沿って学ぶ会です。",
  date: "2026-09-10T19:00",
  location: "オンライン（Discord）",
  capacity: "20",
  category: "Ruby",
  difficulty: "初心者",
  format: "オンライン",
  organizer: "Dev Learning Hub 運営",
  technologyTagNames: ["Ruby"],
};

beforeEach(() => {
  events = [];
  nextId = 1;
  nextTagId = 1;
  tagsByName.clear();
});

describe("GET /api/events", () => {
  it("returns 200 with the created events", async () => {
    await POST(new NextRequest("http://localhost/api/events", {
      method: "POST",
      body: JSON.stringify(validBody),
    }));

    const response = await GET(new NextRequest("http://localhost/api/events"));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { events: FakeEvent[] };
    expect(body.events).toHaveLength(1);
    expect(body.events[0].title).toBe(validBody.title);
  });

  it("filters by query params (category)", async () => {
    await POST(
      new NextRequest("http://localhost/api/events", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    await POST(
      new NextRequest("http://localhost/api/events", {
        method: "POST",
        body: JSON.stringify({ ...validBody, title: "AWS実践会", category: "AWS" }),
      }),
    );

    const response = await GET(
      new NextRequest("http://localhost/api/events?category=AWS"),
    );
    const body = (await response.json()) as { events: FakeEvent[] };
    expect(body.events).toHaveLength(1);
    expect(body.events[0].category).toBe("AWS");
  });
});

describe("POST /api/events", () => {
  it("creates an event and returns 201 (正常系)", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/events", {
        method: "POST",
        body: JSON.stringify(validBody),
      }),
    );
    expect(response.status).toBe(201);
    const body = (await response.json()) as { event: FakeEvent };
    expect(body.event.title).toBe(validBody.title);
    expect(body.event.technologyTags.map((t) => t.name)).toEqual(["Ruby"]);
  });

  it("returns 400 with field errors for invalid input", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/events", {
        method: "POST",
        body: JSON.stringify({ ...validBody, title: "", capacity: "0" }),
      }),
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { fieldErrors?: Record<string, string> };
    expect(body.fieldErrors?.title).toBeDefined();
    expect(body.fieldErrors?.capacity).toBeDefined();
  });

  it("returns 400 for a malformed JSON body", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/events", {
        method: "POST",
        body: "{not json",
      }),
    );
    expect(response.status).toBe(400);
  });
});
