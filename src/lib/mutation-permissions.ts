import { NextResponse } from "next/server";

/**
 * Central place that decides whether create/update/delete operations on
 * events are allowed to run in the current environment. There is no
 * authentication/authorization system yet, so Production has no way to
 * tell "the site owner" from "anyone on the internet" apart — this is a
 * stopgap that keeps Production (and any environment without an explicit
 * opt-in) read-only until real admin auth exists.
 *
 * Deliberately gated by a plain, non-`NEXT_PUBLIC_` environment variable
 * rather than a hardcoded `VERCEL_ENV` check: it's read only on the
 * server (Server Components, Route Handlers), so it's never bundled into
 * client JavaScript, and it lets Preview opt in explicitly via a Vercel
 * env var instead of every non-local environment being treated the same.
 *
 * When real authentication lands, this is the one function to swap out
 * (e.g. for `isAdmin(session)`) — every call site below already funnels
 * through it, so nothing else needs to change.
 */
export function areEventMutationsEnabled(): boolean {
  // Only ever compare against the literal "true" — never log or return
  // the raw value, so an unexpected value can't leak into a response or
  // stack trace.
  return process.env.EVENT_MUTATIONS_ENABLED === "true";
}

/** Shared 403 body for Route Handlers when mutations are disabled. Carries
 * no detail about *why* (no env var names, no hints about auth) — just a
 * plain Japanese message safe to show to any caller. */
export function mutationsDisabledResponse(): NextResponse {
  return NextResponse.json(
    { error: "この環境ではイベントの変更はできません" },
    { status: 403 },
  );
}
