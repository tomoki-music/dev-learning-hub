/**
 * Shared "enum-like" constants for the learning domain (Event + Course).
 *
 * SQLite has no native enum column type (see prisma/schema.prisma), so every
 * one of these is stored as a plain string column and this module — not the
 * database — is the single source of truth for the allowed values. Both
 * `src/types/event.ts` and `src/types/course.ts` import from here instead of
 * redeclaring their own copies, so a category/difficulty label can never
 * drift between the two features.
 *
 * Vue/Rails equivalent: a shared `frozen` array of allowed values (Rails
 * `ActiveRecord::Enum` backed by a string column, or a Pinia-store-level
 * constants module in Vue), imported wherever the value is displayed,
 * validated, or used to build a `<select>`.
 */

export const LEARNING_CATEGORIES = [
  "Ruby",
  "Ruby on Rails",
  "AWS",
  "HTML・CSS",
  "JavaScript",
  "TypeScript",
  "Vue.js",
  "React",
  "Next.js",
  "Git・GitHub",
  "キャリア・ポートフォリオ",
  "その他",
] as const;
export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];

export const LEARNING_CATEGORY_LABEL: Record<LearningCategory, string> =
  Object.fromEntries(LEARNING_CATEGORIES.map((category) => [category, category])) as Record<
    LearningCategory,
    string
  >;

export const LEARNING_DIFFICULTIES = ["初心者", "初級", "中級", "上級", "レベル不問"] as const;
export type LearningDifficulty = (typeof LEARNING_DIFFICULTIES)[number];

export const EVENT_FORMATS = ["オンライン", "オフライン", "ハイブリッド"] as const;
export type EventFormat = (typeof EVENT_FORMATS)[number];

/**
 * Curated technology tag options. Kept as a fixed list (rather than
 * free-text) so the create/edit form can render a checkbox group and the
 * search UI can render matching filter chips from the exact same source —
 * and so every tag referenced by the seed data and forms is guaranteed to
 * exist as a `TechnologyTag` row (see prisma/seed.ts).
 */
export const TECHNOLOGY_TAGS = [
  "Ruby",
  "Ruby on Rails",
  "RSpec",
  "AWS",
  "EC2",
  "S3",
  "Docker",
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "Vue.js",
  "React",
  "Next.js",
  "Node.js",
  "Git",
  "GitHub",
  "データベース設計",
  "ポートフォリオ",
  "キャリア相談",
] as const;
export type TechnologyTagName = (typeof TECHNOLOGY_TAGS)[number];

/** Display color themes for `Course.thumbnailTheme` — no images required,
 * a small colored header on the card is enough and keeps the design calm. */
export const COURSE_THUMBNAIL_THEMES = [
  "indigo",
  "cyan",
  "emerald",
  "violet",
  "amber",
] as const;
export type CourseThumbnailTheme = (typeof COURSE_THUMBNAIL_THEMES)[number];
