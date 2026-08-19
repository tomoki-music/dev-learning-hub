import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Next.js's dev server hot-reloads modules on every file save, which would
// otherwise create a new PrismaClient (and a new DB connection) each time.
// Rails avoids this problem entirely because ActiveRecord's connection pool
// is a framework-managed singleton; here we build the same guarantee by
// hand, stashing the client on `globalThis` so it survives module reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
