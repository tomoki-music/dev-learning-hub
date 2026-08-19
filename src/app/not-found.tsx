import Link from "next/link";

/**
 * Rendered whenever `notFound()` is called (e.g. an unknown event id) or a
 * URL matches no route at all — the App Router's file-based equivalent of
 * a Rails `rescue_from ActiveRecord::RecordNotFound` handler, except here
 * it's a component instead of a controller callback.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-medium tracking-widest text-brand-gold uppercase">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-text-primary">
        ページが見つかりませんでした
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        お探しのイベント、またはページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/events"
        className="mt-8 rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-dark"
      >
        イベント一覧へ戻る
      </Link>
    </div>
  );
}
