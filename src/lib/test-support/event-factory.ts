import type { EventRecord } from "@/types/event";

/**
 * Shared test fixture builder for `EventRecord`. Lives outside any
 * `*.test.ts` file on purpose: vitest's `include: ["src/**\/*.test.ts"]`
 * (see vitest.config.mts) treats every matching file as its own test
 * suite, so importing one test file from another would re-register (and
 * re-run) its `describe`/`it` blocks a second time. Both
 * `src/lib/events.test.ts` and `src/lib/event-filters.test.ts` import this
 * factory instead.
 */
export function makeEvent(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: 1,
    title: "テスト学習イベント",
    description: "説明",
    date: new Date("2026-09-01T10:00:00.000Z"),
    location: "会場",
    capacity: 10,
    participantCount: 0,
    status: "RECRUITING",
    category: "Ruby",
    difficulty: "初心者",
    format: "オンライン",
    organizer: "Dev Learning Hub 運営",
    technologyTags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
