import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toEventRecord } from "@/lib/events";
import { getFeaturedCourses } from "@/lib/course-queries";
import { EventCard } from "@/components/events/EventCard";
import { CourseCard } from "@/components/courses/CourseCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { eventInclude } from "@/types/event";
import { LEARNING_CATEGORIES } from "@/types/learning";

/**
 * The top page fetches its own data (featured courses, upcoming events)
 * directly via Prisma — the same "Server Component queries the database"
 * pattern as `/courses` and `/events`. Nothing here needs browser state,
 * so the whole page stays a Server Component (in Vue/Nuxt terms, closer
 * to a page with no `<script setup>` logic beyond an async data fetch).
 */
export default async function HomePage() {
  const [featuredCourses, upcomingEventRows] = await Promise.all([
    getFeaturedCourses(4),
    prisma.event.findMany({
      where: { date: { gte: new Date() }, status: "RECRUITING" },
      orderBy: { date: "asc" },
      take: 3,
      include: eventInclude,
    }),
  ]);
  const upcomingEvents = upcomingEventRows.map(toEventRecord);

  return (
    <div>
      <section className="border-b border-surface-border bg-brand-primary text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="font-mono text-sm font-medium tracking-widest text-brand-cyan uppercase">
            Dev Learning Hub
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl leading-snug font-semibold sm:text-4xl">
            自分のペースで学び、
            <br />
            仲間と一緒に続けられる。
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
            Ruby、Ruby on Rails、AWS、HTML・CSS、JavaScript、Vue.js、React、Next.jsなど。
            教材で自分のペースで学びながら、オンライン・オフラインの学習会にも参加できる、
            初心者でも安心して始められるプログラミング学習プラットフォームです。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-primary-dark transition-colors hover:bg-white/90"
            >
              学習コースを見る
            </Link>
            <Link
              href="/events"
              className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              学習イベントに参加する
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Features" title="Dev Learning Hubでできること" />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="自分のペースで学習"
            description="コースはレッスン単位に分かれているので、隙間時間でも自分のペースで少しずつ進められます。"
          />
          <FeatureCard
            title="学習会にオンライン・オフラインで参加"
            description="もくもく会やハンズオンなど、興味のあるテーマ・開催形式の学習イベントを検索して参加できます。"
          />
          <FeatureCard
            title="仲間と一緒に継続できる"
            description="一人だと挫折しやすい学習も、同じ目標を持つ仲間と定期的に顔を合わせることで続けやすくなります。"
          />
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-text-muted">
          プログラミングが初めての方でも安心して参加いただけるよう、難易度「初心者」の学習会・コースを多数ご用意しています。
        </p>
      </section>

      {featuredCourses.length > 0 && (
        <section className="border-t border-surface-border bg-surface-card">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeading eyebrow="Courses" title="おすすめ学習コース" />
              <Link href="/courses" className="text-sm font-medium text-brand-primary hover:underline">
                すべてのコースを見る →
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCourses.map((course) => (
                <li key={course.id}>
                  <CourseCard course={course} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {upcomingEvents.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeading eyebrow="Events" title="開催予定の学習イベント" />
            <Link href="/events" className="text-sm font-medium text-brand-primary hover:underline">
              すべての学習イベントを見る →
            </Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {upcomingEvents.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-surface-border bg-surface-card">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Technologies" title="学べる技術カテゴリ" />
          <ul className="mt-6 flex flex-wrap gap-2">
            {LEARNING_CATEGORIES.filter((category) => category !== "その他").map((category) => (
              <li key={category}>
                <Link
                  href={`/events?category=${encodeURIComponent(category)}`}
                  className="inline-flex items-center rounded-full border border-surface-border bg-surface px-3 py-1.5 font-mono text-sm text-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-surface-border bg-brand-primary px-6 py-14 text-center text-white">
          <h2 className="text-2xl font-semibold">今日から、一緒に学び始めませんか？</h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/80">
            まずは学習コースを眺めるだけでも、次の学習会をのぞいてみるだけでも構いません。
            あなたのペースで、Dev Learning Hubを使ってみてください。
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-primary-dark transition-colors hover:bg-white/90"
            >
              学習コースを探す
            </Link>
            <Link
              href="/events"
              className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              学習イベントを探す
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
      <h3 className="font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
    </div>
  );
}
