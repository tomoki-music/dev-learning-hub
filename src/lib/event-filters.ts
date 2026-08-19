import { deriveEventStatus } from "@/lib/events";
import type { EventFormat, EventRecord, EventStatus, LearningCategory, LearningDifficulty } from "@/types/event";

/**
 * All the ways `/events` (the page) and `/api/events` (the Route Handler)
 * can be filtered. Every field is optional and multiple filters combine
 * with AND — except `tags`, where an event matches if it has *any* of the
 * selected tags (OR within the group, same UX as most faceted search UIs).
 */
export type EventFilters = {
  keyword?: string;
  category?: LearningCategory | "";
  difficulty?: LearningDifficulty | "";
  format?: EventFormat | "";
  status?: EventStatus | "";
  tags?: string[];
};

/**
 * Filtered in application code rather than in the SQL query: SQLite's
 * `contains` is case-sensitive and "recruiting vs closed" depends on
 * capacity vs participantCount (see `deriveEventStatus`), which isn't a
 * plain column comparison. Fine at this dataset size; a larger table
 * would push these filters into the database query instead (see README).
 *
 * Shared by the `/events` Server Component page and the `GET /api/events`
 * Route Handler so the two can never disagree about what "matches the
 * search" means.
 */
export function filterEvents(events: EventRecord[], filters: EventFilters): EventRecord[] {
  const keyword = filters.keyword?.trim().toLowerCase() ?? "";
  const tags = filters.tags?.filter(Boolean) ?? [];

  return events.filter((event) => {
    const matchesKeyword =
      keyword === "" ||
      event.title.toLowerCase().includes(keyword) ||
      event.description.toLowerCase().includes(keyword) ||
      event.location.toLowerCase().includes(keyword) ||
      event.organizer.toLowerCase().includes(keyword);

    const matchesCategory = !filters.category || event.category === filters.category;
    const matchesDifficulty = !filters.difficulty || event.difficulty === filters.difficulty;
    const matchesFormat = !filters.format || event.format === filters.format;
    const matchesStatus = !filters.status || deriveEventStatus(event) === filters.status;
    const matchesTags =
      tags.length === 0 || event.technologyTags.some((tag) => tags.includes(tag.name));

    return (
      matchesKeyword &&
      matchesCategory &&
      matchesDifficulty &&
      matchesFormat &&
      matchesStatus &&
      matchesTags
    );
  });
}
