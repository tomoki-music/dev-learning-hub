"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LearningCategory, LearningDifficulty } from "@/types/course";
import { LEARNING_CATEGORIES, LEARNING_DIFFICULTIES } from "@/types/course";
import { SearchFilter } from "@/components/common/SearchFilter";

const DIFFICULTY_OPTIONS: (LearningDifficulty | "")[] = ["", ...LEARNING_DIFFICULTIES];

/**
 * The only interactive piece of /courses — same "URL-driven filtering"
 * pattern as `EventSearch` (src/components/events/EventSearch.tsx):
 * every change here rewrites the URL's query string, and the Server
 * Component page re-fetches/re-filters on the resulting `searchParams`.
 */
export function CourseSearch({
  initialKeyword,
  initialCategory,
  initialDifficulty,
}: {
  initialKeyword: string;
  initialCategory: LearningCategory | "";
  initialDifficulty: LearningDifficulty | "";
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isPending, startTransition] = useTransition();

  function navigate(next: {
    keyword: string;
    category: LearningCategory | "";
    difficulty: LearningDifficulty | "";
  }) {
    const params = new URLSearchParams();
    if (next.keyword) params.set("q", next.keyword);
    if (next.category) params.set("category", next.category);
    if (next.difficulty) params.set("difficulty", next.difficulty);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/courses?${query}` : "/courses");
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== initialKeyword) {
        navigate({ keyword, category: initialCategory, difficulty: initialDifficulty });
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const hasActiveFilters = Boolean(keyword || initialCategory || initialDifficulty);

  return (
    <SearchFilter
      onReset={() => {
        setKeyword("");
        startTransition(() => router.replace("/courses"));
      }}
      resetDisabled={!hasActiveFilters}
      pendingLabel={isPending ? "更新中…" : undefined}
    >
      <div>
        <label htmlFor="course-search-keyword" className="sr-only">
          コース名・概要で検索
        </label>
        <input
          id="course-search-keyword"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="コース名・概要で検索"
          className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-brand-primary focus:outline-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="course-search-category" className="text-xs font-medium text-text-muted">
            カテゴリ
          </label>
          <select
            id="course-search-category"
            value={initialCategory}
            onChange={(event) =>
              navigate({
                keyword,
                category: event.target.value as LearningCategory | "",
                difficulty: initialDifficulty,
              })
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

        <div>
          <span className="text-xs font-medium text-text-muted">難易度</span>
          <div role="group" aria-label="難易度で絞り込み" className="mt-1 flex flex-wrap gap-1">
            {DIFFICULTY_OPTIONS.map((option) => {
              const isActive = initialDifficulty === option;
              return (
                <button
                  key={option || "all"}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => navigate({ keyword, category: initialCategory, difficulty: option })}
                  className={
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors " +
                    (isActive
                      ? "bg-brand-primary text-white"
                      : "bg-surface text-text-muted hover:bg-brand-primary-soft")
                  }
                >
                  {option || "すべて"}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SearchFilter>
  );
}
