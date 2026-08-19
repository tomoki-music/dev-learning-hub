import Link from "next/link";
import type { CourseSummary } from "@/types/course";
import { CourseDifficultyBadge } from "@/components/courses/CourseDifficultyBadge";
import { TagBadge } from "@/components/common/TagBadge";
import { COURSE_THEME_CLASSES } from "@/lib/course-theme";

/** One course, rendered as a card. Pure presentation from a prop — a
 * Server Component, mirroring `EventCard`. */
export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm transition-shadow hover:shadow-md focus-visible:shadow-md"
    >
      <div className={`h-2 w-full ${COURSE_THEME_CLASSES[course.thumbnailTheme]}`} aria-hidden />

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-text-primary group-hover:text-brand-primary">
            {course.title}
          </h3>
          <CourseDifficultyBadge difficulty={course.difficulty} />
        </div>

        <p className="text-sm leading-relaxed text-text-muted">{course.description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <TagBadge tone="accent">{course.category}</TagBadge>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 pt-2 text-sm text-text-muted">
          <dt className="text-text-muted/80">学習時間の目安</dt>
          <dd className="text-text-primary">約{course.estimatedHours}時間</dd>
          <dt className="text-text-muted/80">レッスン数</dt>
          <dd className="text-text-primary">{course.lessonCount}レッスン</dd>
        </dl>

        <span className="text-sm font-medium text-brand-primary group-hover:underline">
          詳細を見る →
        </span>
      </div>
    </Link>
  );
}
