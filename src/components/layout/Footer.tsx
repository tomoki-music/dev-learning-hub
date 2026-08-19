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
        <p className="font-medium text-text-primary">Music Event Hub</p>
        <p className="mt-1">
          音楽コミュニティ向けのイベント管理アプリ（学習用ポートフォリオ）
        </p>
        <p className="mt-4 text-xs">
          Built with Next.js, React, TypeScript, Tailwind CSS, Prisma.
        </p>
      </div>
    </footer>
  );
}
