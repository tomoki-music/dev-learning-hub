// Unit tests for the pure decision/orchestration logic in vercel-build.mjs.
// No real DB, Vercel deployment, or subprocess is ever invoked here —
// `runSteps` is exercised with an injected fake `execute`.
import { describe, expect, it, vi } from "vitest";
import { buildPlan, runSteps } from "./vercel-build.mjs";

const NEXT_BUILD_STEP = { command: "npx", args: ["next", "build"] };
const MIGRATE_STEP = { command: "npx", args: ["prisma", "migrate", "deploy"] };
const SEED_STEP = { command: "npx", args: ["prisma", "db", "seed"] };

describe("buildPlan", () => {
  it("runs only next build when VERCEL_ENV is unset (local build)", () => {
    expect(buildPlan({})).toEqual([NEXT_BUILD_STEP]);
  });

  it("runs only next build for other VERCEL_ENV values (e.g. development)", () => {
    expect(buildPlan({ VERCEL_ENV: "development" })).toEqual([NEXT_BUILD_STEP]);
  });

  it("preview without seed flag: migrate then build", () => {
    expect(buildPlan({ VERCEL_ENV: "preview" })).toEqual([MIGRATE_STEP, NEXT_BUILD_STEP]);
  });

  it("preview with seed flag true: migrate, seed, then build", () => {
    expect(buildPlan({ VERCEL_ENV: "preview", RUN_SEED_ON_BUILD: "true" })).toEqual([
      MIGRATE_STEP,
      SEED_STEP,
      NEXT_BUILD_STEP,
    ]);
  });

  it("production without seed flag: migrate then build", () => {
    expect(buildPlan({ VERCEL_ENV: "production" })).toEqual([MIGRATE_STEP, NEXT_BUILD_STEP]);
  });

  it("production with seed flag true: migrate, seed, then build", () => {
    expect(buildPlan({ VERCEL_ENV: "production", RUN_SEED_ON_BUILD: "true" })).toEqual([
      MIGRATE_STEP,
      SEED_STEP,
      NEXT_BUILD_STEP,
    ]);
  });

  it("ignores a non-'true' seed flag value", () => {
    expect(buildPlan({ VERCEL_ENV: "preview", RUN_SEED_ON_BUILD: "1" })).toEqual([
      MIGRATE_STEP,
      NEXT_BUILD_STEP,
    ]);
  });
});

describe("runSteps", () => {
  it("runs every step in order when all succeed", () => {
    const execute = vi.fn().mockReturnValue({ status: 0 });
    const steps = [MIGRATE_STEP, SEED_STEP, NEXT_BUILD_STEP];

    const result = runSteps(steps, execute);

    expect(result).toEqual({ success: true });
    expect(execute).toHaveBeenCalledTimes(3);
    expect(execute).toHaveBeenNthCalledWith(1, "npx", ["prisma", "migrate", "deploy"]);
    expect(execute).toHaveBeenNthCalledWith(2, "npx", ["prisma", "db", "seed"]);
    expect(execute).toHaveBeenNthCalledWith(3, "npx", ["next", "build"]);
  });

  it("stops before seed/build when migration fails", () => {
    const execute = vi.fn().mockReturnValue({ status: 1 });
    const steps = [MIGRATE_STEP, SEED_STEP, NEXT_BUILD_STEP];

    const result = runSteps(steps, execute);

    expect(result.success).toBe(false);
    expect(result.failedStep).toEqual(MIGRATE_STEP);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("stops before build when seed fails", () => {
    const execute = vi.fn((command, args) => ({
      status: args.includes("seed") ? 1 : 0,
    }));
    const steps = [MIGRATE_STEP, SEED_STEP, NEXT_BUILD_STEP];

    const result = runSteps(steps, execute);

    expect(result.success).toBe(false);
    expect(result.failedStep).toEqual(SEED_STEP);
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("treats a non-zero exit status as failure even when a signal is also present", () => {
    const execute = vi.fn().mockReturnValue({ status: null, signal: "SIGTERM" });

    const result = runSteps([MIGRATE_STEP, NEXT_BUILD_STEP], execute);

    expect(result.success).toBe(false);
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
