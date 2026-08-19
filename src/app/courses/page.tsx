import type { Metadata } from "next";
import { getAllCourses, filterCourses } from "@/lib/course-queries";
import { CourseList } from "@/components/courses/CourseList";
import { CourseSearch } from "@/components/courses/CourseSearch";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { LearningCategory, LearningDifficulty } from "@/types/course";
import { LEARNING_CATEGORIES, LEARNING_DIFFICULTIES } from "@/types/course";

export const metadata: Metadata = {
  title: "学習コース一覧",
  description:
    "Ruby、Ruby on Rails、AWS、HTML・CSS、JavaScript、Vue.js、Reactなど、自分のペースで進められる学習コースをカテゴリ・難易度で検索できます。",
};

type CoursesPageProps = {
  searchParams: Promise<{ q?: string; category?: string; difficulty?: string }>;
};

function asOneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | "" {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? "";
  const categoryFilter = asOneOf<LearningCategory>(params.category, LEARNING_CATEGORIES);
  const difficultyFilter = asOneOf<LearningDifficulty>(params.difficulty, LEARNING_DIFFICULTIES);

  const allCourses = await getAllCourses();
  const courses = filterCourses(allCourses, {
    keyword,
    category: categoryFilter,
    difficulty: difficultyFilter,
  });

  const hasActiveFilters = Boolean(keyword || categoryFilter || difficultyFilter);
  const emptyMessage = hasActiveFilters
    ? "条件に一致する学習コースが見つかりませんでした。絞り込みを解除するか、条件を変えてお試しください。"
    : "現在公開されている学習コースはありません。";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeading
        title="学習コース一覧"
        description="自分のペースで進められる学習コースです。気になる技術やレベルから探してみましょう。"
      />

      <div className="mt-6">
        <CourseSearch
          initialKeyword={keyword}
          initialCategory={categoryFilter}
          initialDifficulty={difficultyFilter}
        />
      </div>

      <p className="mt-6 text-sm text-text-muted">{courses.length}件の学習コース</p>

      <div className="mt-3">
        <CourseList courses={courses} emptyMessage={emptyMessage} />
      </div>
    </div>
  );
}
