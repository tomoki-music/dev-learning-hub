"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The only piece of the event detail page that needs client interactivity
 * (a click handler + a confirmation prompt), so it's split out as its own
 * small Client Component rather than making the whole detail page client
 * — everything else on that page stays server-rendered.
 */
export function DeleteEventButton({
  eventId,
  eventTitle,
}: {
  eventId: number;
  eventTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `学習イベント「${eventTitle}」を削除します。この操作は取り消せません。よろしいですか？`,
    );
    if (!confirmed || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "削除に失敗しました。もう一度お試しください。");
        setIsDeleting(false);
        return;
      }

      router.push("/events");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。ネットワーク環境を確認してもう一度お試しください。");
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-md border border-danger px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "削除中…" : "削除する"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
