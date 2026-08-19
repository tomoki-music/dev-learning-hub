import type { ReactNode } from "react";

const TONE_CLASSES = {
  /** Technology tags, category/format labels — a quiet, code-like pill. */
  neutral: "bg-surface text-text-muted border border-surface-border",
  /** Used for the primary category label on a card. */
  accent: "bg-brand-accent-soft text-brand-accent-dark",
} as const;

/**
 * A small pill for a technology tag, category, or format label. Uses
 * `font-mono` on purpose — a subtle nod to code without leaning on emoji
 * or heavy imagery (see README's design notes).
 */
export function TagBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_CLASSES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
