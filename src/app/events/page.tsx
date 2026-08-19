import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toEventRecord } from "@/lib/events";
import { filterEvents } from "@/lib/event-filters";
import { EventList } from "@/components/events/EventList";
import { EventSearch } from "@/components/events/EventSearch";
import { SectionHeading } from "@/components/common/SectionHeading";
import { eventInclude } from "@/types/event";
import type { EventFormat, EventStatus, LearningCategory, LearningDifficulty } from "@/types/event";
import { EVENT_FORMATS, LEARNING_CATEGORIES, LEARNING_DIFFICULTIES } from "@/types/learning";

export const metadata: Metadata = {
  title: "学習イベント一覧",
  description:
    "Ruby、Rails、AWS、フロントエンドなど、テーマ別のプログラミング学習イベント・もくもく会を検索・絞り込みできます。",
};

type EventsPageProps = {
  // Next.js 16 passes `searchParams` as a Promise so the framework can
  // start streaming before the URL's query string is even resolved —
  // there's no synchronous equivalent to reach for here, unlike Vue
  // Router's `route.query`, which is available synchronously in a
  // `computed`.
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    difficulty?: string;
    format?: string;
    tag?: string | string[];
  }>;
};

function asOneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | "" {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? "";
  const statusFilter = asOneOf<EventStatus>(params.status, ["RECRUITING", "CLOSED"]);
  const categoryFilter = asOneOf<LearningCategory>(params.category, LEARNING_CATEGORIES);
  const difficultyFilter = asOneOf<LearningDifficulty>(params.difficulty, LEARNING_DIFFICULTIES);
  const formatFilter = asOneOf<EventFormat>(params.format, EVENT_FORMATS);
  const tagFilter = params.tag ? (Array.isArray(params.tag) ? params.tag : [params.tag]) : [];

  // This is the Server Component doing the fetch directly — the Rails
  // equivalent is an EventsController#index that queries ActiveRecord and
  // renders a view; there is no separate "call the API" hop for the page
  // itself (the /api/events route below exists for external/API-style
  // access, per the assignment, not because this page needs it).
  const rows = await prisma.event.findMany({ orderBy: { date: "asc" }, include: eventInclude });
  const allEvents = rows.map(toEventRecord);

  const events = filterEvents(allEvents, {
    keyword,
    status: statusFilter,
    category: categoryFilter,
    difficulty: difficultyFilter,
    format: formatFilter,
    tags: tagFilter,
  });

  const hasActiveFilters = Boolean(
    keyword || statusFilter || categoryFilter || difficultyFilter || formatFilter || tagFilter.length,
  );
  const emptyMessage = hasActiveFilters
    ? "条件に一致する学習イベントが見つかりませんでした。絞り込みを解除するか、条件を変えてお試しください。"
    : "現在登録されている学習イベントはありません。最初の学習イベントを作成してみましょう。";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeading
        title="学習イベント一覧"
        description="もくもく会・ハンズオン・交流会など、開催予定の学習イベントを一覧できます。キーワードやカテゴリ、難易度、開催形式で絞り込めます。"
      />

      <div className="mt-6">
        <EventSearch
          initialKeyword={keyword}
          initialStatus={statusFilter}
          initialCategory={categoryFilter}
          initialDifficulty={difficultyFilter}
          initialFormat={formatFilter}
          initialTags={tagFilter}
        />
      </div>

      <p className="mt-6 text-sm text-text-muted">{events.length}件の学習イベント</p>

      <div className="mt-3">
        <EventList events={events} emptyMessage={emptyMessage} />
      </div>
    </div>
  );
}
