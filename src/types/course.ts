import type { Prisma, Course as PrismaCourse, Lesson as PrismaLesson } from "@/generated/prisma/client";
import {
  COURSE_THUMBNAIL_THEMES,
  LEARNING_CATEGORIES,
  LEARNING_DIFFICULTIES,
  type CourseThumbnailTheme,
  type LearningCategory,
  type LearningDifficulty,
} from "@/types/learning";

export { COURSE_THUMBNAIL_THEMES, LEARNING_CATEGORIES, LEARNING_DIFFICULTIES };
export type { CourseThumbnailTheme, LearningCategory, LearningDifficulty };

/** The `include` shape used whenever a course is fetched together with its
 * lessons, always ordered by their display `position` — see
 * `getCourseBySlug` in src/lib/course-queries.ts. */
export const courseWithLessonsInclude = {
  lessons: { orderBy: { position: "asc" } },
} satisfies Prisma.CourseInclude;

/** A lesson row exactly as Prisma returns it — no narrowing needed, every
 * field already has a concrete type (no string-backed enum on Lesson). */
export type LessonRecord = PrismaLesson;

/** Course row narrowed to union types for `category`/`difficulty`/
 * `thumbnailTheme`, mirroring `EventRecord` in src/types/event.ts. */
export type CourseRecord = Omit<PrismaCourse, "category" | "difficulty" | "thumbnailTheme"> & {
  category: LearningCategory;
  difficulty: LearningDifficulty;
  thumbnailTheme: CourseThumbnailTheme;
};

/** Course list rows need a lesson count for the card ("N レッスン") but not
 * the full lesson bodies. */
export type CourseSummary = CourseRecord & { lessonCount: number };

export type CourseWithLessons = CourseRecord & { lessons: LessonRecord[] };
