// Vercel's Build Command for this project. Vercel runs a package.json
// `vercel-build` script instead of `build` when one is present, which is
// what lets this wrap `next build` with Preview/Production database setup.
//
// On Vercel Preview and Production deployments (VERCEL_ENV === "preview" or
// "production"), Sensitive environment variables (DATABASE_URL, DIRECT_URL,
// ...) are injected into this build process as real values — that masking
// only ever applies to out-of-band retrieval (e.g. `vercel env pull` from a
// CLI session), never to the actual build/runtime environment. That's what
// makes it safe to run `prisma migrate deploy` here.
//
// A local/other-branch build (VERCEL_ENV unset, or any value other than
// "preview"/"production") just runs `next build` unchanged — it never
// touches the database.
//
// This file is split into two pure, unit-testable pieces (see
// scripts/vercel-build.test.mjs) plus a thin CLI entry point:
//   - buildPlan(env): decides *which* fixed commands to run, in order,
//     from environment variable presence only. Never reads or logs a
//     variable's value, only whether RUN_SEED_ON_BUILD === "true".
//   - runSteps(steps, execute): runs the plan in order via an injectable
//     executor, stopping at the first non-zero exit so a migration/seed
//     failure never lets a later step (seed, next build) run.
import { spawnSync } from "node:child_process";

const DB_DEPLOY_ENVS = new Set(["preview", "production"]);

// Fixed commands/argv only — never built from or containing env var values.
export function buildPlan(env) {
  const runDbSteps = DB_DEPLOY_ENVS.has(env.VERCEL_ENV);
  const runSeed = runDbSteps && env.RUN_SEED_ON_BUILD === "true";

  const steps = [];
  if (runDbSteps) {
    steps.push({ command: "npx", args: ["prisma", "migrate", "deploy"] });
    if (runSeed) {
      steps.push({ command: "npx", args: ["prisma", "db", "seed"] });
    }
  }
  steps.push({ command: "npx", args: ["next", "build"] });
  return steps;
}

// Runs `steps` in order via `execute` (an injectable (command, args) =>
// { status, signal } function), stopping at the first failure. Never
// touches process.exit itself, so it's safe to call from tests.
export function runSteps(steps, execute) {
  for (const step of steps) {
    console.log(`\n> ${step.command} ${step.args.join(" ")}`);
    const result = execute(step.command, step.args);
    const status = result?.status ?? null;
    if (status !== 0) {
      const reason = status !== null ? `exit ${status}` : `signal ${result?.signal}`;
      console.error(`\n"${step.command} ${step.args.join(" ")}" failed (${reason}).`);
      return { success: false, failedStep: step, status };
    }
  }
  return { success: true };
}

function spawnExecute(command, args) {
  return spawnSync(command, args, { stdio: "inherit" });
}

const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const plan = buildPlan(process.env);
  const result = runSteps(plan, spawnExecute);
  if (!result.success) {
    process.exit(result.status ?? 1);
  }
}
