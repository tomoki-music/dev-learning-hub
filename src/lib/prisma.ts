import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Next.js's dev server hot-reloads modules on every file save, which would
// otherwise create a new PrismaClient (and a new DB connection) each time.
// Rails avoids this problem entirely because ActiveRecord's connection pool
// is a framework-managed singleton; here we build the same guarantee by
// hand, stashing the client on `globalThis` so it survives module reloads.
// This matters even more on PostgreSQL than it did on SQLite: without it,
// every hot reload (dev) or serverless invocation (production) would open a
// fresh connection instead of reusing one.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Only check *that* the variable is set, never log its value (it's a
  // Prisma Accelerate connection string with an embedded API key).
  const accelerateUrl = process.env.DATABASE_URL;
  if (!accelerateUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // The app's runtime queries go through Prisma Accelerate (DATABASE_URL is
  // a `prisma+postgres://...` Accelerate connection string, not a plain
  // TCP one), which pools connections so a serverless environment like
  // Vercel doesn't exhaust the database. This is a different
  // PrismaClient/connection style than prisma/seed.ts, which talks to the
  // database directly via @prisma/adapter-pg + DIRECT_URL (Prisma Postgres
  // doesn't currently expose a separate "pooled TCP" connection string —
  // only Accelerate or a direct one — see that file's comment).
  //
  // WORKAROUND: Prisma 7 has an open, unfixed bug where `$extends`-ing a
  // client with @prisma/extension-accelerate collapses every query result's
  // type to `any` (https://github.com/prisma/prisma/issues/28580). That's a
  // type-checker problem only — `$extends` doesn't remove or change any of
  // the base client's methods at runtime — so we cast back to the plain
  // `PrismaClient` type here to restore type-checking for every caller.
  // Remove this cast once that issue is fixed upstream.
  const client = new PrismaClient({ accelerateUrl }).$extends(withAccelerate());
  return client as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
