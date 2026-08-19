"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EventStatus } from "@/types/event";

const STATUS_OPTIONS: { value: EventStatus | ""; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "RECRUITING", label: "募集中" },
  { value: "CLOSED", label: "受付終了" },
];

/**
 * The only interactive piece of the /events page, which is why it's the
 * only file here with `"use client"`. Everything it needs from the current
 * URL (`initialKeyword`, `initialStatus`) is passed in as props from the
 * Server Component page — reading the `searchParams` page prop server-side
 * and forwarding it down, rather than calling the `useSearchParams()`
 * client hook here, is what Next.js recommends: it keeps this component
 * free to be prerendered instead of forcing a client-only render.
 *
 * The actual filtering happens back on the server: every change here
 * updates the URL's query string, which re-renders `/events` with new
 * `searchParams` and a new Prisma query. Vue equivalent: instead of a
 * `computed` that filters a client-held array, the "computed" step is a
 * server round trip driven by the URL — closer to how a Rails index page
 * reads `params[:q]` on each request.
 */
export function EventSearch({
  initialKeyword,
  initialStatus,
}: {
  initialKeyword: string;
  initialStatus: EventStatus | "";
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isPending, startTransition] = useTransition();

  function navigate(nextKeyword: string, nextStatus: EventStatus | "") {
    const params = new URLSearchParams();
    if (nextKeyword) params.set("q", nextKeyword);
    if (nextStatus) params.set("status", nextStatus);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/events?${query}` : "/events");
    });
  }

  // Debounce keyword input so we don't push a new URL on every keystroke —
  // the same idea as a Vue `watch(keyword, debounce(...), { flush: 'post' })`.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== initialKeyword) {
        navigate(keyword, initialStatus);
      }
    }, 300);
    return () => clearTimeout(timer);
    // Only re-run when the debounced value changes; `navigate` reads fresh
    // props/state via closure and doesn't need to be a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <label htmlFor="event-search-keyword" className="sr-only">
          イベント名・開催場所で検索
        </label>
        <input
          id="event-search-keyword"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="イベント名・開催場所で検索"
          className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div
        role="group"
        aria-label="募集状況で絞り込み"
        className="flex gap-1 self-start sm:self-auto"
      >
        {STATUS_OPTIONS.map((option) => {
          const isActive = initialStatus === option.value;
          return (
            <button
              key={option.value || "all"}
              type="button"
              aria-pressed={isActive}
              onClick={() => navigate(keyword, option.value)}
              className={
                "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-brand-primary text-white"
                  : "bg-surface text-text-muted hover:bg-brand-primary-soft")
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <span className="text-xs text-text-muted" aria-live="polite">
        {isPending ? "更新中…" : " "}
      </span>
    </div>
  );
}
