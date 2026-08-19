"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "ホーム" },
  { href: "/courses", label: "学習コース" },
  { href: "/events", label: "学習イベント" },
];

/**
 * The interactive slice of the header: which link is "current" and the
 * mobile menu's open/closed state. Split out from `Header` so that file
 * can stay a Server Component — this is the only part of the header that
 * actually needs to run in the browser.
 *
 * Vue equivalent: a nav component that reads `useRoute().path` to add an
 * `active` class, plus a `ref(isOpen)` for the mobile menu — both need
 * the component to be client-rendered, which in Vue is implicit (every
 * component runs in the browser) but here is an explicit opt-in via
 * `"use client"`.
 */
export function HeaderNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        className="rounded-md p-2 text-white transition-colors hover:bg-white/10 sm:hidden"
      >
        <span className="sr-only">メニューを{isOpen ? "閉じる" : "開く"}</span>
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden>
          {isOpen ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      <nav
        id="primary-navigation"
        aria-label="メインナビゲーション"
        className={`${isOpen ? "flex" : "hidden"} w-full flex-col gap-1 sm:flex sm:w-auto sm:flex-row sm:items-center`}
      >
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setIsOpen(false)}
              className={
                "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                (active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10 hover:text-white")
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
