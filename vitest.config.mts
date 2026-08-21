import { defineConfig } from "vitest/config";
import path from "node:path";

const dirname = import.meta.dirname;

// Scope: unit tests for framework-agnostic logic in src/lib (status
// derivation, formatting, validation) and for scripts/vercel-build.mjs's
// pure plan/orchestration logic (see scripts/vercel-build.test.mjs — no
// real subprocess/DB/deployment involved). No jsdom/React Testing Library
// here — testing Server/Client Components would need a much heavier
// setup (RSC rendering, mocking Prisma, etc.) that isn't worth it for a
// learning-portfolio project of this size; see README for the trade-off.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
  },
});
