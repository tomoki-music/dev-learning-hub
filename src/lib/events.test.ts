import { describe, expect, it } from "vitest";
import {
  deriveEventStatus,
  remainingSlots,
  toDatetimeLocalValue,
} from "@/lib/events";
import type { EventRecord } from "@/types/event";

function makeEvent(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: 1,
    title: "テストイベント",
    description: "説明",
    date: new Date("2026-09-01T10:00:00.000Z"),
    location: "会場",
    capacity: 10,
    participantCount: 0,
    status: "RECRUITING",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("deriveEventStatus", () => {
  it("is RECRUITING when there is remaining capacity and no manual close", () => {
    const event = makeEvent({ capacity: 10, participantCount: 3, status: "RECRUITING" });
    expect(deriveEventStatus(event)).toBe("RECRUITING");
  });

  it("is CLOSED once participantCount reaches capacity, even if status says RECRUITING", () => {
    const event = makeEvent({ capacity: 10, participantCount: 10, status: "RECRUITING" });
    expect(deriveEventStatus(event)).toBe("CLOSED");
  });

  it("is CLOSED when participantCount exceeds capacity", () => {
    const event = makeEvent({ capacity: 10, participantCount: 11, status: "RECRUITING" });
    expect(deriveEventStatus(event)).toBe("CLOSED");
  });

  it("is CLOSED when manually closed, regardless of remaining capacity", () => {
    const event = makeEvent({ capacity: 10, participantCount: 1, status: "CLOSED" });
    expect(deriveEventStatus(event)).toBe("CLOSED");
  });
});

describe("remainingSlots", () => {
  it("returns capacity minus participantCount", () => {
    expect(remainingSlots(makeEvent({ capacity: 10, participantCount: 4 }))).toBe(6);
  });

  it("never goes negative when participantCount exceeds capacity", () => {
    expect(remainingSlots(makeEvent({ capacity: 10, participantCount: 15 }))).toBe(0);
  });
});

describe("toDatetimeLocalValue", () => {
  it("formats a Date as YYYY-MM-DDTHH:mm for <input type=datetime-local>", () => {
    const date = new Date(2026, 8, 1, 9, 5); // 2026-09-01 09:05 local time
    expect(toDatetimeLocalValue(date)).toBe("2026-09-01T09:05");
  });

  it("zero-pads single-digit month, day, hour, and minute", () => {
    const date = new Date(2026, 0, 2, 3, 4); // 2026-01-02 03:04 local time
    expect(toDatetimeLocalValue(date)).toBe("2026-01-02T03:04");
  });
});
