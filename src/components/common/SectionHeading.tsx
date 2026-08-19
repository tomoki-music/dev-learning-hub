/**
 * A title + short description pair, reused for every list/detail page
 * header and for each section on the top page. A Server Component — pure
 * markup from props, the same "dumb component" pattern as a Vue component
 * with only props and a template.
 */
export function SectionHeading({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string;
  /** Small label above the title, e.g. "SECTION" or a category name. */
  eyebrow?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="font-mono text-xs font-semibold tracking-widest text-brand-accent uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-2xl font-semibold text-text-primary sm:text-3xl">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">{description}</p>
      )}
    </div>
  );
}
