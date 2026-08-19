import type { CourseThumbnailTheme } from "@/types/course";

/** Color classes for a course card's header strip, keyed by
 * `Course.thumbnailTheme`. No images are used for course thumbnails — a
 * flat color band keeps the card lightweight and calm (see README's
 * design notes on avoiding heavy imagery). */
export const COURSE_THEME_CLASSES: Record<CourseThumbnailTheme, string> = {
  indigo: "bg-brand-primary",
  cyan: "bg-brand-cyan",
  emerald: "bg-status-open-text",
  violet: "bg-brand-violet",
  amber: "bg-brand-accent",
};
