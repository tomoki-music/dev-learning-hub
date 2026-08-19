import type { LearningDifficulty } from "@/types/learning";

/** Color classes per difficulty level, shared by `DifficultyBadge`
 * (src/components/common) and its course-facing wrapper
 * `CourseDifficultyBadge` — kept in one place so the two badges can never
 * drift out of sync on which color means what. */
export const DIFFICULTY_TONE: Record<LearningDifficulty, string> = {
  初心者: "bg-status-open-bg text-status-open-text",
  初級: "bg-brand-cyan-soft text-brand-cyan-dark",
  中級: "bg-brand-accent-soft text-brand-accent-dark",
  上級: "bg-brand-violet-soft text-brand-violet-dark",
  レベル不問: "bg-surface text-text-muted border border-surface-border",
};
