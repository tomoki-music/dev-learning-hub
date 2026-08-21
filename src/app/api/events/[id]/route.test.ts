import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";

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

let events: FakeEvent[] = [];
const tagsByName = new Map<string, FakeTag>();
let nextTagId = 1;

function resolveTags(names: string[]): FakeTag[] {
  return names.map((name) => {
    const existing = tagsByName.get(name);
    if (existing) return existing;
    const tag = { id: nextTagId++, name };
    tagsByName.set(name, tag);
    return tag;
  });
}

function seedEvent(overrides: Partial<FakeEvent> = {}): FakeEvent {
  const event: FakeEvent = {
    id: 1,
    title: "Ruby基礎もくもく会",
    description: "Rubyの基礎文法を教材に沿って学ぶ会です。",
    date: new Date("2026-09-10T19:00:00+09:00"),
    location: "オンライン（Discord）",
    capacity: 20,
    participantCount: 3,
    status: "RECRUITING",
    category: "Ruby",
    difficulty: "初心者",
    format: "オンライン",
    organizer: "Dev Learning Hub 運営",
    createdAt: new Date(),
    updatedAt: new Date(),
    technologyTags: resolveTags(["Ruby"]),
    ...overrides,
  };
  events.push(event);
  return event;
}

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      findUnique: vi.fn(async ({ where }: { where: { id: number } }) => {
        return events.find((e) => e.id === where.id) ?? null;
      }),
      update: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { id: number };
          data: Record<string, unknown> & { technologyTags?: { set?: { name: string }[] } };
        }) => {
          const index = events.findIndex((e) => e.id === where.id);
          if (index === -1) {
            throw new Prisma.PrismaClientKnownRequestError("Record not found", {
              code: "P2025",
              clientVersion: "test",
            });
          }
          const { technologyTags, ...rest } = data;
          const updated: FakeEvent = {
            ...events[index],
            ...(rest as Partial<FakeEvent>),
            technologyTags: technologyTags?.set
              ? resolveTags(technologyTags.set.map((t) => t.name))
              : events[index].technologyTags,
            updatedAt: new Date(),
          };
          events[index] = updated;
          return updated;
        },
      ),
      delete: vi.fn(async ({ where }: { where: { id: number } }) => {
        const index = events.findIndex((e) => e.id === where.id);
        if (index === -1) {
          throw new Prisma.PrismaClientKnownRequestError("Record not found", {
            code: "P2025",
            clientVersion: "test",
          });
        }
        const [removed] = events.splice(index, 1);
        return removed;
      }),
    },
  },
}));

const { GET, PUT, DELETE } = await import("@/app/api/events/[id]/route");

const validBody = {
  title: "Ruby基礎もくもく会（更新後）",
  description: "内容を更新しました。",
  date: "2026-09-15T19:00",
  location: "オンライン（Discord）",
  capacity: "25",
  category: "Ruby",
  difficulty: "初級",
  format: "オンライン",
  organizer: "Dev Learning Hub 運営",
  technologyTagNames: ["Ruby", "RSpec"],
};

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  events = [];
  tagsByName.clear();
  nextTagId = 1;
  // PUT/DELETE are mutations, so they're gated by EVENT_MUTATIONS_ENABLED
  // (see src/lib/mutation-permissions.ts) — most existing tests below
  // exercise the update/delete flow itself, so default it to enabled here
  // and have the "disabled/unset" describe block below opt back out.
  vi.stubEnv("EVENT_MUTATIONS_ENABLED", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/events/[id]", () => {
  it("returns 200 with the event (正常系)", async () => {
    seedEvent({ id: 1 });
    const response = await GET(new NextRequest("http://localhost/api/events/1"), paramsFor("1"));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { event: FakeEvent };
    expect(body.event.id).toBe(1);
  });

  it("returns 404 for an id that does not exist", async () => {
    const response = await GET(new NextRequest("http://localhost/api/events/999"), paramsFor("999"));
    expect(response.status).toBe(404);
  });

  it("returns 404 for a non-numeric id", async () => {
    const response = await GET(new NextRequest("http://localhost/api/events/abc"), paramsFor("abc"));
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/events/[id]", () => {
  it("updates the event and replaces its technology tags (正常系)", async () => {
    seedEvent({ id: 1, technologyTags: resolveTags(["Ruby"]) });

    const response = await PUT(
      new NextRequest("http://localhost/api/events/1", { method: "PUT", body: JSON.stringify(validBody) }),
      paramsFor("1"),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { event: FakeEvent };
    expect(body.event.title).toBe(validBody.title);
    expect(body.event.technologyTags.map((t) => t.name).sort()).toEqual(["RSpec", "Ruby"]);
  });

  it("returns 400 for invalid input", async () => {
    seedEvent({ id: 1 });
    const response = await PUT(
      new NextRequest("http://localhost/api/events/1", {
        method: "PUT",
        body: JSON.stringify({ ...validBody, capacity: "-1" }),
      }),
      paramsFor("1"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 404 when the event does not exist", async () => {
    const response = await PUT(
      new NextRequest("http://localhost/api/events/999", { method: "PUT", body: JSON.stringify(validBody) }),
      paramsFor("999"),
    );
    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/events/[id]", () => {
  it("deletes the event (正常系)", async () => {
    seedEvent({ id: 1 });
    const response = await DELETE(new NextRequest("http://localhost/api/events/1", { method: "DELETE" }), paramsFor("1"));
    expect(response.status).toBe(200);
    expect(events).toHaveLength(0);
  });

  it("returns 404 when the event does not exist", async () => {
    const response = await DELETE(new NextRequest("http://localhost/api/events/999", { method: "DELETE" }), paramsFor("999"));
    expect(response.status).toBe(404);
  });
});

describe("EVENT_MUTATIONS_ENABLED gate", () => {
  it("PUT returns 403 and leaves the event unchanged when explicitly disabled", async () => {
    seedEvent({ id: 1 });
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", "false");

    const response = await PUT(
      new NextRequest("http://localhost/api/events/1", { method: "PUT", body: JSON.stringify(validBody) }),
      paramsFor("1"),
    );
    expect(response.status).toBe(403);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("この環境ではイベントの変更はできません");
    expect(events[0].title).not.toBe(validBody.title);
  });

  it("PUT returns 403 when unset", async () => {
    seedEvent({ id: 1 });
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", undefined);

    const response = await PUT(
      new NextRequest("http://localhost/api/events/1", { method: "PUT", body: JSON.stringify(validBody) }),
      paramsFor("1"),
    );
    expect(response.status).toBe(403);
  });

  it("DELETE returns 403 and keeps the event when explicitly disabled", async () => {
    seedEvent({ id: 1 });
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", "false");

    const response = await DELETE(new NextRequest("http://localhost/api/events/1", { method: "DELETE" }), paramsFor("1"));
    expect(response.status).toBe(403);
    expect(events).toHaveLength(1);
  });

  it("DELETE returns 403 when unset", async () => {
    seedEvent({ id: 1 });
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", undefined);

    const response = await DELETE(new NextRequest("http://localhost/api/events/1", { method: "DELETE" }), paramsFor("1"));
    expect(response.status).toBe(403);
    expect(events).toHaveLength(1);
  });

  it("GET still returns 200 when mutations are disabled", async () => {
    seedEvent({ id: 1 });
    vi.stubEnv("EVENT_MUTATIONS_ENABLED", "false");

    const response = await GET(new NextRequest("http://localhost/api/events/1"), paramsFor("1"));
    expect(response.status).toBe(200);
  });
});
