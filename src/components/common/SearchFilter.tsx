import type { ReactNode } from "react";

/**
 * Shared bordered container + "絞り込みを解除" reset button for
 * `EventSearch` and `CourseSearch`. Pure presentation — no state of its
 * own — so it's safe to import directly from either Client Component: it
 * just becomes part of that component's client bundle, the same as any
 * other plain function used inside a Vue `<script setup>` template.
 */
export function SearchFilter({
  children,
  onReset,
  resetDisabled,
  pendingLabel,
}: {
  children: ReactNode;
  onReset: () => void;
  resetDisabled: boolean;
  /** Shown next to the reset button while a search navigation is in
   * flight (`isPending` from `useTransition` in the caller). */
  pendingLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-surface-border bg-surface-card p-4 sm:p-5">
      {children}
      <div className="flex items-center justify-between border-t border-surface-border pt-3">
        <span className="text-xs text-text-muted" aria-live="polite">
          {pendingLabel || " "}
        </span>
        <button
          type="button"
          onClick={onReset}
          disabled={resetDisabled}
          className="rounded-md border border-surface-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          絞り込みを解除
        </button>
      </div>
    </div>
  );
}
