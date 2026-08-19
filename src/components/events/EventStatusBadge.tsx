import type { EventStatus } from "@/types/event";
import { EVENT_STATUS_LABEL } from "@/types/event";

/**
 * A tiny, prop-in/HTML-out component — the same "dumb component" pattern
 * as a Vue component that only takes props and renders a template, no
 * local state at all.
 */
export function EventStatusBadge({ status }: { status: EventStatus }) {
  const isRecruiting = status === "RECRUITING";

  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " +
        (isRecruiting
          ? "bg-status-open-bg text-status-open-text"
          : "bg-status-closed-bg text-status-closed-text")
      }
    >
      {EVENT_STATUS_LABEL[status]}
    </span>
  );
}
