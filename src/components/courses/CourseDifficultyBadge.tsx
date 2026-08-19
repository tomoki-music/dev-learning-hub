import type { LearningDifficulty } from "@/types/course";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";

/**
 * Course-facing name for the shared `DifficultyBadge` — kept as its own
 * component (rather than calling `DifficultyBadge` directly from
 * `CourseCard`/course detail) so the course feature has one obvious badge
 * to import, matching `EventStatusBadge`'s naming on the event side.
 */
export function CourseDifficultyBadge({ difficulty }: { difficulty: LearningDifficulty }) {
  return <DifficultyBadge difficulty={difficulty} />;
}
