import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/course-queries";
import { CourseDifficultyBadge } from "@/components/courses/CourseDifficultyBadge";
import { LessonList } from "@/components/courses/LessonList";
import { TagBadge } from "@/components/common/TagBadge";

type CourseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return {
    title: course ? course.title : "学習コースが見つかりません",
    description: course ? course.description.slice(0, 120) : undefined,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  // Unknown/unpublished slug -> the App Router's nearest not-found.tsx,
  // the same pattern the event detail page uses (src/app/not-found.tsx).
  if (!course || !course.isPublished) {
    notFound();
  }

  const totalMinutes = course.lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/courses" className="text-sm font-medium text-brand-primary hover:underline">
        ← 学習コース一覧へ戻る
      </Link>

      <div className="mt-6 rounded-xl border border-surface-border bg-surface-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text-primary">{course.title}</h1>
          <CourseDifficultyBadge difficulty={course.difficulty} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <TagBadge tone="accent">{course.category}</TagBadge>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
          {course.description}
        </p>

        <dl className="mt-8 grid gap-x-6 gap-y-4 border-t border-surface-border pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-text-muted">学習時間の目安</dt>
            <dd className="mt-1 font-medium text-text-primary">約{course.estimatedHours}時間</dd>
          </div>
          <div>
            <dt className="text-text-muted">レッスン数</dt>
            <dd className="mt-1 font-medium text-text-primary">{course.lessons.length}レッスン</dd>
          </div>
          <div>
            <dt className="text-text-muted">レッスン合計時間</dt>
            <dd className="mt-1 font-medium text-text-primary">約{totalMinutes}分</dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-surface-border pt-6">
          <h2 className="font-semibold text-text-primary">レッスン一覧</h2>
          <div className="mt-4">
            <LessonList lessons={course.lessons} />
          </div>
        </div>

        <div className="mt-8 border-t border-surface-border pt-6">
          {/* 今回は学習進捗の保存・受講機能は未実装。押しても何も起きない
              ボタンを置く代わりに、無効化した上で「準備中」であることを
              明示する（README のロードマップ参照）。 */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full cursor-not-allowed rounded-md bg-brand-primary/40 px-6 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            学習を始める（準備中）
          </button>
          <p className="mt-2 text-xs text-text-muted">
            受講・学習進捗の保存機能は今後実装予定です。現在はコース内容の閲覧のみご利用いただけます。
          </p>
        </div>
      </div>
    </div>
  );
}
