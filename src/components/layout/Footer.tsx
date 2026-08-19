import Link from "next/link";

/**
 * Also a Server Component — purely static markup. In the App Router,
 * "use client" is opt-in, so a file like this needs no directive at all;
 * contrast with Vue, where every SFC is a client component by default and
 * you instead opt in to server rendering (or islands) at a higher level.
 */
export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-surface-card">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-text-muted sm:px-6">
        <p className="font-medium text-text-primary">Dev Learning Hub</p>
        <p className="mt-1">
          プログラミングを学びたい人のための学習プラットフォーム兼コミュニティ（学習用ポートフォリオ）
        </p>
        <nav aria-label="フッターナビゲーション" className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/courses" className="hover:text-brand-primary hover:underline">
            学習コース一覧
          </Link>
          <Link href="/events" className="hover:text-brand-primary hover:underline">
            学習イベント一覧
          </Link>
        </nav>
        <p className="mt-4 text-xs">
          Built with Next.js, React, TypeScript, Tailwind CSS, Prisma.
        </p>
      </div>
    </footer>
  );
}
