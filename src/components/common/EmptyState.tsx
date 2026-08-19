import type { ReactNode } from "react";

/**
 * Shared "nothing to show" box for list pages — used when a search/filter
 * combination matches nothing, or when a list is genuinely empty. Kept
 * generic (message + optional action) so `EventList` and `CourseList`
 * don't each re-implement the same bordered placeholder markup.
 */
export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-surface-border bg-surface-card px-6 py-16 text-center">
      <p className="max-w-md text-sm text-text-muted">{message}</p>
      {action}
    </div>
  );
}
