import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/event-queries";
import { EventForm } from "@/components/events/EventForm";
import { areEventMutationsEnabled } from "@/lib/mutation-permissions";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditEventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  return { title: event ? `${event.title} を編集` : "学習イベントが見つかりません" };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  // Read-only environments (Production, until real admin auth exists)
  // have no edit flow at all — not even by typing the URL directly. The
  // Route Handler enforces the same rule independently (see
  // `src/lib/mutation-permissions.ts`), so this is defense in depth, not
  // the only guard.
  if (!areEventMutationsEnabled()) {
    notFound();
  }

  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href={`/events/${event.id}`}
        className="text-sm font-medium text-brand-primary hover:underline"
      >
        ← 学習イベント詳細へ戻る
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-text-primary">
        学習イベントを編集
      </h1>
      <p className="mt-2 text-sm text-text-muted">「{event.title}」の内容を編集します。</p>

      <div className="mt-8 rounded-xl border border-surface-border bg-surface-card p-6 sm:p-8">
        <EventForm mode="edit" event={event} />
      </div>
    </div>
  );
}
