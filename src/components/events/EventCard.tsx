import Link from "next/link";
import type { EventRecord } from "@/types/event";
import { deriveEventStatus, formatEventDateShort, remainingSlots } from "@/lib/events";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { TagBadge } from "@/components/common/TagBadge";

/** One learning event, rendered as a card. Pure presentation from a prop —
 * a Server Component, since nothing here needs to run in the browser. */
export function EventCard({ event }: { event: EventRecord }) {
  const status = deriveEventStatus(event);
  const remaining = remainingSlots(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-text-primary group-hover:text-brand-primary">
          {event.title}
        </h3>
        <EventStatusBadge status={status} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <TagBadge tone="accent">{event.category}</TagBadge>
        <DifficultyBadge difficulty={event.difficulty} />
        <TagBadge>{event.format}</TagBadge>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm text-text-muted">
        <dt className="text-text-muted/80">開催日</dt>
        <dd className="text-text-primary">{formatEventDateShort(event.date)}</dd>

        <dt className="text-text-muted/80">開催場所</dt>
        <dd className="text-text-primary">{event.location}</dd>

        <dt className="text-text-muted/80">主催</dt>
        <dd className="text-text-primary">{event.organizer}</dd>

        <dt className="text-text-muted/80">募集人数</dt>
        <dd className="text-text-primary">{event.capacity}名</dd>

        <dt className="text-text-muted/80">参加人数</dt>
        <dd className="text-text-primary">
          {event.participantCount}名
          {status === "RECRUITING" && (
            <span className="ml-1 text-brand-accent-dark">（残り{remaining}名）</span>
          )}
        </dd>
      </dl>

      {event.technologyTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {event.technologyTags.map((tag) => (
            <TagBadge key={tag.id}>{tag.name}</TagBadge>
          ))}
        </div>
      )}

      <span className="mt-auto text-sm font-medium text-brand-primary group-hover:underline">
        詳細を見る →
      </span>
    </Link>
  );
}
