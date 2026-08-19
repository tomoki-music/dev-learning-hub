import type { EventRecord } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";

export function EventList({
  events,
  emptyMessage,
}: {
  events: EventRecord[];
  /** Lets the caller distinguish "no events match your search" from
   * "there are no events yet" without EventList knowing about search. */
  emptyMessage: string;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card px-6 py-16 text-center">
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}
