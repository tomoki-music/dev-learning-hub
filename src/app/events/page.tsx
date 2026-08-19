import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deriveEventStatus, toEventRecord } from "@/lib/events";
import { EventList } from "@/components/events/EventList";
import { EventSearch } from "@/components/events/EventSearch";
import type { EventStatus } from "@/types/event";

export const metadata: Metadata = {
  title: "イベント一覧",
};

type EventsPageProps = {
  // Next.js 16 passes `searchParams` as a Promise so the framework can
  // start streaming before the URL's query string is even resolved —
  // there's no synchronous equivalent to reach for here, unlike Vue
  // Router's `route.query`, which is available synchronously in a
  // `computed`.
  searchParams: Promise<{ q?: string; status?: string }>;
};

function toStatusFilter(value: string | undefined): EventStatus | "" {
  return value === "RECRUITING" || value === "CLOSED" ? value : "";
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? "";
  const statusFilter = toStatusFilter(params.status);

  // This is the Server Component doing the fetch directly — the Rails
  // equivalent is an EventsController#index that queries ActiveRecord and
  // renders a view; there is no separate "call the API" hop for the page
  // itself (the /api/events route below exists for external/API-style
  // access, per the assignment, not because this page needs it).
  const rows = await prisma.event.findMany({ orderBy: { date: "asc" } });
  const allEvents = rows.map(toEventRecord);

  // Filtered in application code rather than in the SQL query: SQLite's
  // `contains` is case-sensitive and "recruiting vs closed" depends on
  // capacity vs participantCount (see deriveEventStatus), which isn't a
  // plain column comparison. Fine at this dataset size; a larger table
  // would push both filters into the database query instead.
  const lowerKeyword = keyword.toLowerCase();
  const events = allEvents.filter((event) => {
    const matchesKeyword =
      lowerKeyword === "" ||
      event.title.toLowerCase().includes(lowerKeyword) ||
      event.location.toLowerCase().includes(lowerKeyword);
    const matchesStatus =
      statusFilter === "" || deriveEventStatus(event) === statusFilter;
    return matchesKeyword && matchesStatus;
  });

  const emptyMessage =
    keyword || statusFilter
      ? "条件に一致するイベントが見つかりませんでした。"
      : "現在登録されているイベントはありません。最初のイベントを作成してみましょう。";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-text-primary">
        イベント一覧
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        開催予定のイベントを一覧できます。キーワードや募集状況で絞り込めます。
      </p>

      <div className="mt-6">
        <EventSearch initialKeyword={keyword} initialStatus={statusFilter} />
      </div>

      <p className="mt-6 text-sm text-text-muted">{events.length}件のイベント</p>

      <div className="mt-3">
        <EventList events={events} emptyMessage={emptyMessage} />
      </div>
    </div>
  );
}
