import { describe, expect, it, vi } from "vitest";

type FakeLesson = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  position: number;
  estimatedMinutes: number;
  isPreview: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type FakeCourse = {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  thumbnailTheme: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const now = new Date("2026-08-19T00:00:00.000Z");

const courses: FakeCourse[] = [
  {
    id: 1,
    title: "はじめてのRuby",
    slug: "intro-to-ruby",
    description: "Rubyの基礎文法をゼロから学ぶ入門コース",
    category: "Ruby",
    difficulty: "初心者",
    estimatedHours: 8,
    thumbnailTheme: "indigo",
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    title: "AWSデプロイ実践",
    slug: "aws-deploy-practice",
    description: "Webアプリケーションを実際にAWSへデプロイする",
    category: "AWS",
    difficulty: "中級",
    estimatedHours: 6,
    thumbnailTheme: "cyan",
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    title: "非公開の下書きコース",
    slug: "draft-course",
    description: "まだ公開していない準備中のコース",
    category: "その他",
    difficulty: "レベル不問",
    estimatedHours: 1,
    thumbnailTheme: "amber",
    isPublished: false,
    createdAt: now,
    updatedAt: now,
  },
];

// Lessons are stored out of `position` order on purpose — the mock only
// sorts them if the code under test actually asks for
// `orderBy: { position: "asc" }` (see `courseWithLessonsInclude` in
// src/types/course.ts), so this doubles as a regression test for that
// query shape, not just for `getCourseBySlug`'s return value.
const rubyLessons: FakeLesson[] = [
  {
    id: 12,
    courseId: 1,
    title: "クラスとモジュール",
    description: "オブジェクト指向の基本を学ぶ",
    position: 3,
    estimatedMinutes: 40,
    isPreview: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 10,
    courseId: 1,
    title: "Rubyのインストールと環境構築",
    description: "rbenvを使った環境構築",
    position: 1,
    estimatedMinutes: 20,
    isPreview: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 11,
    courseId: 1,
    title: "変数と制御構文",
    description: "if/unless/each などの基本構文",
    position: 2,
    estimatedMinutes: 30,
    isPreview: false,
    createdAt: now,
    updatedAt: now,
  },
];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findUnique: vi.fn(
        async ({
          where,
          include,
        }: {
          where: { slug: string };
          include?: { lessons?: { orderBy?: { position?: "asc" | "desc" } } };
        }) => {
          const course = courses.find((c) => c.slug === where.slug);
          if (!course) return null;

          let lessons = rubyLessons.filter((lesson) => lesson.courseId === course.id);
          const order = include?.lessons?.orderBy?.position;
          if (order === "asc") {
            lessons = [...lessons].sort((a, b) => a.position - b.position);
          } else if (order === "desc") {
            lessons = [...lessons].sort((a, b) => b.position - a.position);
          }
          // No `orderBy` requested: return in the (scrambled) storage
          // order, same as a real database would with no ORDER BY.

          return { ...course, lessons };
        },
      ),
      findMany: vi.fn(
        async ({ where }: { where?: { isPublished?: boolean } } = {}) => {
          const filtered =
            where?.isPublished === undefined
              ? courses
              : courses.filter((c) => c.isPublished === where.isPublished);
          return filtered.map((course) => ({
            ...course,
            _count: { lessons: rubyLessons.filter((l) => l.courseId === course.id).length },
          }));
        },
      ),
    },
  },
}));

const { getAllCourses, getCourseBySlug, filterCourses } = await import("@/lib/course-queries");

describe("getCourseBySlug", () => {
  it("returns the course with its lessons for a known slug", async () => {
    const course = await getCourseBySlug("intro-to-ruby");
    expect(course).not.toBeNull();
    expect(course?.title).toBe("はじめてのRuby");
    expect(course?.lessons).toHaveLength(3);
  });

  it("returns null for a slug that does not exist", async () => {
    const course = await getCourseBySlug("does-not-exist");
    expect(course).toBeNull();
  });

  it("returns lessons ordered by position, not insertion order", async () => {
    const course = await getCourseBySlug("intro-to-ruby");
    expect(course?.lessons.map((l) => l.position)).toEqual([1, 2, 3]);
    expect(course?.lessons.map((l) => l.title)).toEqual([
      "Rubyのインストールと環境構築",
      "変数と制御構文",
      "クラスとモジュール",
    ]);
  });

  it("exposes whether each lesson is previewable", async () => {
    const course = await getCourseBySlug("intro-to-ruby");
    expect(course?.lessons[0].isPreview).toBe(true);
    expect(course?.lessons[1].isPreview).toBe(false);
  });
});

describe("getAllCourses / filterCourses", () => {
  it("only returns published courses", async () => {
    const all = await getAllCourses();
    expect(all.map((c) => c.slug).sort()).toEqual(["aws-deploy-practice", "intro-to-ruby"]);
  });

  it("includes a lesson count per course", async () => {
    const all = await getAllCourses();
    const ruby = all.find((c) => c.slug === "intro-to-ruby");
    expect(ruby?.lessonCount).toBe(3);
  });

  it("filters by keyword across title and description", async () => {
    const all = await getAllCourses();
    expect(filterCourses(all, { keyword: "AWS" }).map((c) => c.slug)).toEqual([
      "aws-deploy-practice",
    ]);
    expect(filterCourses(all, { keyword: "デプロイ" }).map((c) => c.slug)).toEqual([
      "aws-deploy-practice",
    ]);
  });

  it("filters by category and difficulty, combined with AND", async () => {
    const all = await getAllCourses();
    expect(filterCourses(all, { category: "Ruby" }).map((c) => c.slug)).toEqual([
      "intro-to-ruby",
    ]);
    expect(filterCourses(all, { difficulty: "中級" }).map((c) => c.slug)).toEqual([
      "aws-deploy-practice",
    ]);
    expect(filterCourses(all, { category: "Ruby", difficulty: "中級" })).toHaveLength(0);
  });

  it("returns an empty array when nothing matches", async () => {
    const all = await getAllCourses();
    expect(filterCourses(all, { keyword: "存在しないコース名" })).toHaveLength(0);
  });
});
