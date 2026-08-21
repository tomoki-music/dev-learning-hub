// Vercel's Build Command for this project. Vercel runs a package.json
// `vercel-build` script instead of `build` when one is present, which is
// what lets this wrap `next build` with Preview-only database setup.
//
// On Vercel Preview deployments (VERCEL_ENV === "preview"), Sensitive
// environment variables (DATABASE_URL, DIRECT_URL, ...) are injected into
// this build process as real values — that masking only ever applies to
// out-of-band retrieval (e.g. `vercel env pull` from a CLI session), never
// to the actual build/runtime environment. That's what makes it safe to
// run `prisma migrate deploy` here.
//
// Production has no database environment variables configured yet, so this
// intentionally never runs migrate/seed outside VERCEL_ENV === "preview" —
// a Production or other-branch build just runs `next build` unchanged.
import { spawnSync } from "node:child_process";

const isPreview = process.env.VERCEL_ENV === "preview";
const shouldSeed = process.env.RUN_SEED_ON_BUILD === "true";

// Never print env var values or shell-expand them — only check *that* they
// hold expected literal values, then run fixed argv arrays (no shell string
// interpolation of anything secret).
function run(command, args) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`\n"${command} ${args.join(" ")}" failed (exit ${result.status ?? "signal " + result.signal}).`);
    process.exit(result.status ?? 1);
  }
}

if (isPreview) {
  // Migration failure must stop the build before seed/next build run.
  run("npx", ["prisma", "migrate", "deploy"]);

  if (shouldSeed) {
    // Seed failure must also stop the build before next build runs.
    run("npx", ["prisma", "db", "seed"]);
  }
}

run("npx", ["next", "build"]);
