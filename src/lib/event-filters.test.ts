import { describe, expect, it } from "vitest";
import { filterEvents } from "@/lib/event-filters";
import { makeEvent } from "@/lib/test-support/event-factory";

const events = [
  makeEvent({
    id: 1,
    title: "Ruby基礎もくもく会",
    description: "Rubyの基礎文法を学ぶ",
    location: "オンライン（Discord）",
    organizer: "Dev Learning Hub 運営",
    category: "Ruby",
    difficulty: "初心者",
    format: "オンライン",
    status: "RECRUITING",
    capacity: 20,
    participantCount: 5,
    technologyTags: [{ id: 1, name: "Ruby" }],
  }),
  makeEvent({
    id: 2,
    title: "AWSへWebアプリをデプロイする実践会",
    description: "EC2とS3を使ったデプロイ手順を学ぶ",
    location: "渋谷 コワーキングスペース",
    organizer: "AWS学習コミュニティ",
    category: "AWS",
    difficulty: "中級",
    format: "オフライン",
    status: "RECRUITING",
    capacity: 10,
    participantCount: 10,
    technologyTags: [
      { id: 2, name: "AWS" },
      { id: 3, name: "EC2" },
    ],
  }),
  makeEvent({
    id: 3,
    title: "Vue.js・Reactフロントエンド交流会",
    description: "フロントエンドフレームワークの情報交換会",
    location: "オンライン（Zoom）",
    organizer: "フロントエンド勉強会",
    category: "Vue.js",
    difficulty: "レベル不問",
    format: "ハイブリッド",
    status: "CLOSED",
    capacity: 15,
    participantCount: 3,
    technologyTags: [
      { id: 4, name: "Vue.js" },
      { id: 5, name: "React" },
    ],
  }),
];

describe("filterEvents", () => {
  it("returns every event when no filters are given", () => {
    expect(filterEvents(events, {})).toHaveLength(3);
  });

  it("matches keyword against title, description, location, and organizer", () => {
    expect(filterEvents(events, { keyword: "ruby" }).map((e) => e.id)).toEqual([1]);
    expect(filterEvents(events, { keyword: "コワーキング" }).map((e) => e.id)).toEqual([2]);
    expect(filterEvents(events, { keyword: "フロントエンド" }).map((e) => e.id)).toEqual([3]);
  });

  it("filters by category", () => {
    expect(filterEvents(events, { category: "AWS" }).map((e) => e.id)).toEqual([2]);
  });

  it("filters by difficulty", () => {
    expect(filterEvents(events, { difficulty: "中級" }).map((e) => e.id)).toEqual([2]);
  });

  it("filters by format", () => {
    expect(filterEvents(events, { format: "ハイブリッド" }).map((e) => e.id)).toEqual([3]);
  });

  it("filters by derived status, not the raw status column", () => {
    // event #2 has status "RECRUITING" but is full (participantCount === capacity)
    expect(filterEvents(events, { status: "CLOSED" }).map((e) => e.id).sort()).toEqual([2, 3]);
    expect(filterEvents(events, { status: "RECRUITING" }).map((e) => e.id)).toEqual([1]);
  });

  it("filters by technology tags with OR semantics within the tag group", () => {
    expect(filterEvents(events, { tags: ["React"] }).map((e) => e.id)).toEqual([3]);
    expect(filterEvents(events, { tags: ["Ruby", "AWS"] }).map((e) => e.id).sort()).toEqual([1, 2]);
  });

  it("combines multiple filters with AND", () => {
    const result = filterEvents(events, { category: "Vue.js", format: "ハイブリッド" });
    expect(result.map((e) => e.id)).toEqual([3]);

    expect(filterEvents(events, { category: "Vue.js", format: "オンライン" })).toHaveLength(0);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterEvents(events, { keyword: "存在しないキーワード" })).toHaveLength(0);
  });
});
