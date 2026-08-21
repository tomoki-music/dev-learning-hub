// Prisma CLI config (used by `prisma migrate`, `prisma db seed`, etc.).
// This is CLI-only tooling config — it is NOT read by the Next.js app at
// runtime, so `DATABASE_URL` still needs to be available to Next.js itself
// via `.env` (which Next.js loads automatically).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 no longer auto-runs seeds after `migrate dev` / `migrate reset`,
    // so `npx prisma db seed` (or `npm run db:seed`) must be run explicitly.
    seed: "tsx prisma/seed.ts",
  },
  // CLI/migration commands use the *direct* (non-pooled) connection so a
  // migration's session isn't interrupted by the connection pooler — see
  // README's PostgreSQL section. The app itself connects via DATABASE_URL
  // (pooled) through the driver adapter in src/lib/prisma.ts.
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
