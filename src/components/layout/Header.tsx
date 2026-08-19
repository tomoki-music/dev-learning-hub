import Link from "next/link";
import { HeaderNav } from "@/components/layout/HeaderNav";

/**
 * Site header. Stays a Server Component itself — the brand link is static
 * markup — and delegates the only interactive part (current-page
 * highlighting + the mobile menu toggle) to `HeaderNav`, a small Client
 * Component. Compare to Vue: a component that only uses props/slots and
 * no `ref`/`reactive` could similarly be a plain, non-interactive
 * component, with just the reactive bits pulled into a child.
 */
export function Header() {
  return (
    <header className="border-b border-surface-border bg-brand-primary text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 text-lg font-semibold tracking-wide">
          <span aria-hidden className="font-mono text-brand-cyan">
            {"</>"}
          </span>
          Dev Learning Hub
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
