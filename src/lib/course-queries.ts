import { prisma } from "@/lib/prisma";
import {
  courseWithLessonsInclude,
  type CourseRecord,
  type CourseSummary,
  type CourseWithLessons,
  type LearningCategory,
  type LearningDifficulty,
} from "@/types/course";

/** Narrows Prisma's plain-string `category`/`difficulty`/`thumbnailTheme`
 * columns the same way `toEventRecord` does for `Event` — see
 * src/lib/events.ts for why this defensive cast exists at all. */
function toCourseRecord(course: {
  category: string;
  difficulty: string;
  thumbnailTheme: string;
  [key: string]: unknown;
}): CourseRecord {
  return {
    ...course,
    category: course.category as LearningCategory,
    difficulty: course.difficulty as LearningDifficulty,
    thumbnailTheme: course.thumbnailTheme as CourseRecord["thumbnailTheme"],
  } as CourseRecord;
}

/**
 * All published courses with a lesson count for the card ("N レッスン").
 * Like `/events`, filtering happens in application code (see
 * `filterCourses` below) rather than in the query — the course catalog is
 * small enough that this stays simple and easy to reason about.
 */
export async function getAllCourses(): Promise<CourseSummary[]> {
  const rows = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  return rows.map((row) => {
    const { _count, ...course } = row;
    return { ...toCourseRecord(course), lessonCount: _count.lessons };
  });
}

/**
 * A handful of published courses for the top page's "おすすめ学習コース"
 * section.
 */
export async function getFeaturedCourses(take: number): Promise<CourseSummary[]> {
  const courses = await getAllCourses();
  return courses.slice(0, take);
}

/**
 * A single course with its lessons, ordered by `position`. Returns `null`
 * for an unknown slug so the page can call `notFound()` — the same
 * "lookup returns null, page decides what to do" shape as
 * `getEventById` in src/lib/event-queries.ts.
 */
export async function getCourseBySlug(slug: string): Promise<CourseWithLessons | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: courseWithLessonsInclude,
  });
  if (!course) return null;

  const { lessons, ...rest } = course;
  return { ...toCourseRecord(rest), lessons };
}

export type CourseFilters = {
  keyword?: string;
  category?: LearningCategory | "";
  difficulty?: LearningDifficulty | "";
};

/** Shared by the `/courses` Server Component page (and reused by its
 * tests) — same keyword/category/difficulty combination pattern as
 * `filterEvents` in src/lib/event-filters.ts. */
export function filterCourses(courses: CourseSummary[], filters: CourseFilters): CourseSummary[] {
  const keyword = filters.keyword?.trim().toLowerCase() ?? "";

  return courses.filter((course) => {
    const matchesKeyword =
      keyword === "" ||
      course.title.toLowerCase().includes(keyword) ||
      course.description.toLowerCase().includes(keyword);
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesDifficulty = !filters.difficulty || course.difficulty === filters.difficulty;
    return matchesKeyword && matchesCategory && matchesDifficulty;
  });
}
