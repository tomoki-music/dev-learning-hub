import Link from "next/link";

/**
 * Site header. No client-side state or event handlers are needed here, so
 * this stays a Server Component (the App Router default) — it is rendered
 * to HTML on the server and ships zero JavaScript to the browser for this
 * component. Compare to Vue: a component that only uses props/slots and no
 * `ref`/`reactive` could similarly be a plain, non-interactive component.
 */
export function Header() {
  return (
    <header className="border-b border-surface-border bg-brand-primary text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-lg font-semibold tracking-wide"
        >
          <span aria-hidden className="text-brand-gold">
            ♪
          </span>
          Music Event Hub
        </Link>
        <nav aria-label="メインナビゲーション">
          <ul className="flex items-center gap-1 text-sm sm:gap-2">
            <li>
              <Link
                href="/"
                className="rounded-md px-3 py-2 transition-colors hover:bg-white/10"
              >
                トップ
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="rounded-md px-3 py-2 transition-colors hover:bg-white/10"
              >
                イベント一覧
              </Link>
            </li>
            <li>
              <Link
                href="/events/new"
                className="rounded-md border border-brand-gold px-3 py-2 font-medium text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-primary-dark"
              >
                イベントを作成
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
