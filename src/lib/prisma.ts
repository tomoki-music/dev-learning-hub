import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
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
  // Only check *that* the variable is set, never log its value (it may be a
  // Prisma Accelerate connection string with an embedded API key).
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // Pick the connection style from the URL's scheme rather than an
  // environment flag, so this stays correct automatically wherever it runs:
  //
  // - `prisma+postgres://` / `prisma://` (Prisma Accelerate — local dev,
  //   Vercel preview/production): pools connections via Accelerate so a
  //   serverless environment doesn't exhaust the database. Prisma Postgres
  //   doesn't expose a separate "pooled TCP" connection string — only
  //   Accelerate or a direct one — see prisma/seed.ts's comment.
  // - `postgresql://` / `postgres://` (a plain TCP database — e.g. the
  //   GitHub Actions PostgreSQL service container in CI, which has no
  //   Accelerate in front of it): connects directly via @prisma/adapter-pg,
  //   the same way prisma/seed.ts and the Prisma CLI do.
  if (databaseUrl.startsWith("prisma+postgres://") || databaseUrl.startsWith("prisma://")) {
    // WORKAROUND: Prisma 7 has an open, unfixed bug where `$extends`-ing a
    // client with @prisma/extension-accelerate collapses every query
    // result's type to `any` (https://github.com/prisma/prisma/issues/28580).
    // That's a type-checker problem only — `$extends` doesn't remove or
    // change any of the base client's methods at runtime — so we cast back
    // to the plain `PrismaClient` type here to restore type-checking for
    // every caller. Remove this cast once that issue is fixed upstream.
    const client = new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate());
    return client as unknown as PrismaClient;
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
