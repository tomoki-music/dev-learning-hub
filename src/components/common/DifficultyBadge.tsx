import type { LearningDifficulty } from "@/types/learning";
import { DIFFICULTY_TONE } from "@/lib/difficulty";

/** Shared by `EventCard`/`EventForm`'s summary and `CourseDifficultyBadge`
 * — one color mapping (see src/lib/difficulty.ts) for "難易度" everywhere
 * it appears. */
export function DifficultyBadge({ difficulty }: { difficulty: LearningDifficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${DIFFICULTY_TONE[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
