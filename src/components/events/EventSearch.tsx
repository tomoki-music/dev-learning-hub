"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EventFormat, EventStatus, LearningCategory, LearningDifficulty } from "@/types/event";
import { EVENT_FORMATS, LEARNING_CATEGORIES, LEARNING_DIFFICULTIES, TECHNOLOGY_TAGS } from "@/types/learning";
import { SearchFilter } from "@/components/common/SearchFilter";

const STATUS_OPTIONS: { value: EventStatus | ""; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "RECRUITING", label: "募集中" },
  { value: "CLOSED", label: "受付終了" },
];

const DIFFICULTY_OPTIONS: (LearningDifficulty | "")[] = ["", ...LEARNING_DIFFICULTIES];
const FORMAT_OPTIONS: (EventFormat | "")[] = ["", ...EVENT_FORMATS];

type EventSearchProps = {
  initialKeyword: string;
  initialStatus: EventStatus | "";
  initialCategory: LearningCategory | "";
  initialDifficulty: LearningDifficulty | "";
  initialFormat: EventFormat | "";
  initialTags: string[];
};

/**
 * The only interactive piece of the /events page, which is why it's the
 * only file here with `"use client"`. Everything it needs from the current
 * URL is passed in as props from the Server Component page — reading the
 * `searchParams` page prop server-side and forwarding it down, rather than
 * calling the `useSearchParams()` client hook here, is what Next.js
 * recommends: it keeps this component free to be prerendered instead of
 * forcing a client-only render.
 *
 * The actual filtering happens back on the server: every change here
 * updates the URL's query string, which re-renders `/events` with new
 * `searchParams` and a new Prisma query (via `filterEvents` in
 * src/lib/event-filters.ts). Vue equivalent: instead of a `computed` that
 * filters a client-held array, the "computed" step is a server round trip
 * driven by the URL — closer to how a Rails index page reads
 * `params[:q]` on each request.
 */
export function EventSearch({
  initialKeyword,
  initialStatus,
  initialCategory,
  initialDifficulty,
  initialFormat,
  initialTags,
}: EventSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isPending, startTransition] = useTransition();

  function navigate(next: {
    keyword: string;
    status: EventStatus | "";
    category: LearningCategory | "";
    difficulty: LearningDifficulty | "";
    format: EventFormat | "";
    tags: string[];
  }) {
    const params = new URLSearchParams();
    if (next.keyword) params.set("q", next.keyword);
    if (next.status) params.set("status", next.status);
    if (next.category) params.set("category", next.category);
    if (next.difficulty) params.set("difficulty", next.difficulty);
    if (next.format) params.set("format", next.format);
    for (const tag of next.tags) params.append("tag", tag);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/events?${query}` : "/events");
    });
  }

  const current = {
    keyword,
    status: initialStatus,
    category: initialCategory,
    difficulty: initialDifficulty,
    format: initialFormat,
    tags: initialTags,
  };

  // Debounce keyword input so we don't push a new URL on every keystroke —
  // the same idea as a Vue `watch(keyword, debounce(...), { flush: 'post' })`.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== initialKeyword) {
        navigate({ ...current, keyword });
      }
    }, 300);
    return () => clearTimeout(timer);
    // Only re-run when the debounced value changes; `navigate`/`current`
    // read fresh props/state via closure and don't need to be dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  function toggleTag(tag: string) {
    const nextTags = initialTags.includes(tag)
      ? initialTags.filter((t) => t !== tag)
      : [...initialTags, tag];
    navigate({ ...current, tags: nextTags });
  }

  const hasActiveFilters = Boolean(
    keyword || initialStatus || initialCategory || initialDifficulty || initialFormat || initialTags.length,
  );

  return (
    <SearchFilter
      onReset={() => {
        setKeyword("");
        startTransition(() => router.replace("/events"));
      }}
      resetDisabled={!hasActiveFilters}
      pendingLabel={isPending ? "更新中…" : undefined}
    >
      <div>
        <label htmlFor="event-search-keyword" className="sr-only">
          学習イベント名・説明・開催場所・主催者で検索
        </label>
        <input
          id="event-search-keyword"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="学習イベント名・説明・開催場所・主催者で検索"
          className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="event-search-category" className="text-xs font-medium text-text-muted">
            カテゴリ
          </label>
          <select
            id="event-search-category"
            value={initialCategory}
            onChange={(event) =>
              navigate({ ...current, category: event.target.value as LearningCategory | "" })
            }
            className="mt-1 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          >
            <option value="">すべてのカテゴリ</option>
            {LEARNING_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <ButtonGroup
          label="難易度"
          options={DIFFICULTY_OPTIONS}
          value={initialDifficulty}
          allLabel="すべて"
          onChange={(difficulty) => navigate({ ...current, difficulty })}
        />

        <ButtonGroup
          label="開催形式"
          options={FORMAT_OPTIONS}
          value={initialFormat}
          allLabel="すべて"
          onChange={(format) => navigate({ ...current, format })}
        />
      </div>

      <div>
        <span className="text-xs font-medium text-text-muted">募集状況</span>
        <div role="group" aria-label="募集状況で絞り込み" className="mt-1 flex flex-wrap gap-1">
          {STATUS_OPTIONS.map((option) => {
            const isActive = initialStatus === option.value;
            return (
              <button
                key={option.value || "all"}
                type="button"
                aria-pressed={isActive}
                onClick={() => navigate({ ...current, status: option.value })}
                className={pillClass(isActive)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="text-xs font-medium text-text-muted">技術タグ（複数選択可）</span>
        <div role="group" aria-label="技術タグで絞り込み" className="mt-1 flex flex-wrap gap-1.5">
          {TECHNOLOGY_TAGS.map((tag) => {
            const isActive = initialTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={isActive}
                onClick={() => toggleTag(tag)}
                className={`${pillClass(isActive)} font-mono`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </SearchFilter>
  );
}

function ButtonGroup<T extends string>({
  label,
  options,
  value,
  allLabel,
  onChange,
}: {
  label: string;
  options: (T | "")[];
  value: T | "";
  allLabel: string;
  onChange: (value: T | "") => void;
}) {
  return (
    <div>
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <div role="group" aria-label={label} className="mt-1 flex flex-wrap gap-1">
        {options.map((option) => {
          const isActive = value === option;
          return (
            <button
              key={option || "all"}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option)}
              className={pillClass(isActive)}
            >
              {option || allLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function pillClass(isActive: boolean): string {
  return (
    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors " +
    (isActive
      ? "bg-brand-primary text-white"
      : "bg-surface text-text-muted hover:bg-brand-primary-soft")
  );
}
