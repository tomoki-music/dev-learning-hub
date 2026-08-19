import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deriveEventStatus, formatEventDate, remainingSlots } from "@/lib/events";
import { getEventById } from "@/lib/event-queries";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { DeleteEventButton } from "@/components/events/DeleteEventButton";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  return { title: event ? event.title : "イベントが見つかりません" };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  // notFound() renders the nearest not-found.tsx (src/app/not-found.tsx
  // here) instead of the page below it — the App Router equivalent of
  // Rails' `raise ActiveRecord::RecordNotFound` triggering a 404 response.
  if (!event) {
    notFound();
  }

  const status = deriveEventStatus(event);
  const remaining = remainingSlots(event);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/events"
        className="text-sm font-medium text-brand-primary hover:underline"
      >
        ← イベント一覧へ戻る
      </Link>

      <div className="mt-6 rounded-xl border border-surface-border bg-surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text-primary">
            {event.title}
          </h1>
          <EventStatusBadge status={status} />
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
          {event.description}
        </p>

        <dl className="mt-8 grid gap-x-6 gap-y-4 border-t border-surface-border pt-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted">開催日時</dt>
            <dd className="mt-1 font-medium text-text-primary">
              {formatEventDate(event.date)}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">開催場所</dt>
            <dd className="mt-1 font-medium text-text-primary">
              {event.location}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">定員</dt>
            <dd className="mt-1 font-medium text-text-primary">
              {event.capacity}名
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">参加人数</dt>
            <dd className="mt-1 font-medium text-text-primary">
              {event.participantCount}名
              {status === "RECRUITING" && (
                <span className="ml-1 text-brand-gold-dark">
                  （残り{remaining}名）
                </span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-surface-border pt-6">
          <Link
            href={`/events/${event.id}/edit`}
            className="rounded-md border border-brand-primary px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
          >
            編集する
          </Link>
          <DeleteEventButton eventId={event.id} eventTitle={event.title} />
        </div>
      </div>
    </div>
  );
}
