import type { Metadata } from "next";
import Link from "next/link";
import { EventForm } from "@/components/events/EventForm";

export const metadata: Metadata = {
  title: "イベントを作成",
};

/**
 * The page itself is a Server Component (it renders static heading markup
 * and needs no state), but it hands off entirely to the Client Component
 * `EventForm` for anything interactive — the split point is "does this
 * need the browser", not "is this a form vs. a page".
 */
export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/events" className="text-sm font-medium text-brand-primary hover:underline">
        ← イベント一覧へ戻る
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-text-primary">
        イベントを作成
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        必要な情報を入力してイベントを登録してください。
      </p>

      <div className="mt-8 rounded-xl border border-surface-border bg-surface-card p-6 sm:p-8">
        <EventForm mode="create" />
      </div>
    </div>
  );
}
