import Link from "next/link";

/**
 * The top page needs no state, no fetch, no click handlers — a Server
 * Component renders it to static-looking HTML with no client JS bundle.
 * In Vue/Nuxt terms this is close to a page with no `<script setup>`
 * logic at all, just a template.
 */
export default function HomePage() {
  return (
    <div>
      <section className="border-b border-surface-border bg-brand-primary text-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-medium tracking-widest text-brand-gold uppercase">
            Music Event Hub
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl leading-snug font-semibold sm:text-4xl">
            音楽コミュニティのイベントを、
            <br />
            もっとシンプルに。
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
            セッション、ライブ出演、ワークショップ、オフラインミートアップ。
            音楽仲間と集まる機会を一箇所にまとめて、募集状況をひと目で確認できるイベント管理アプリです。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-md bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-primary-dark transition-colors hover:bg-brand-gold-dark hover:text-white"
            >
              イベント一覧を見る
            </Link>
            <Link
              href="/events/new"
              className="rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              イベントを作成する
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Music Event Hubでできること
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="募集状況が一目瞭然"
            description="定員と参加人数から募集中／受付終了を自動判定。カード一覧でイベントの状況がすぐに分かります。"
          />
          <FeatureCard
            title="キーワードで検索"
            description="イベント名や開催場所から絞り込み検索。開催中のイベントだけを表示することもできます。"
          />
          <FeatureCard
            title="登録・編集がすぐできる"
            description="必須項目チェックと定員の数値チェック付きのフォームで、誰でも迷わずイベントを作成・更新できます。"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
      <h3 className="font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {description}
      </p>
    </div>
  );
}
