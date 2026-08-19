import Link from "next/link";

/**
 * Rendered whenever `notFound()` is called (e.g. an unknown event id or
 * course slug) or a URL matches no route at all — the App Router's
 * file-based equivalent of a Rails `rescue_from ActiveRecord::RecordNotFound`
 * handler, except here it's a component instead of a controller callback.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm font-medium tracking-widest text-brand-accent uppercase">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-text-primary">
        ページが見つかりませんでした
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        お探しの学習コース・学習イベント、またはページは存在しないか、削除された可能性があります。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/courses"
          className="rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
        >
          学習コース一覧へ
        </Link>
        <Link
          href="/events"
          className="rounded-md border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
        >
          学習イベント一覧へ
        </Link>
      </div>
    </div>
  );
}
