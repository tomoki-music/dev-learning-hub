import type { LessonRecord } from "@/types/course";

/** Ordered lesson list for the course detail page. Lessons already arrive
 * sorted by `position` (see `getCourseBySlug` in
 * src/lib/course-queries.ts) — this component just renders them in that
 * order, it doesn't re-sort. A Server Component: no interactivity here. */
export function LessonList({ lessons }: { lessons: LessonRecord[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {lessons.map((lesson, index) => (
        <li
          key={lesson.id}
          className="flex items-start gap-4 rounded-lg border border-surface-border bg-surface-card p-4"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft font-mono text-xs font-semibold text-brand-primary">
            {index + 1}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-text-primary">{lesson.title}</h3>
              {lesson.isPreview && (
                <span className="inline-flex items-center rounded-full bg-status-open-bg px-2 py-0.5 text-xs font-semibold text-status-open-text">
                  プレビュー可
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{lesson.description}</p>
          </div>
          <span className="shrink-0 text-xs whitespace-nowrap text-text-muted">
            約{lesson.estimatedMinutes}分
          </span>
        </li>
      ))}
    </ol>
  );
}
