import "server-only";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

// Production: Neon Postgres (DATABASE_URL, added by Vercel's Neon integration).
// Local development without DATABASE_URL: an embedded Postgres (PGlite) stored in .data/.

type Db = Awaited<ReturnType<typeof connect>>;

/**
 * DATABASE_URL, or the same variable under a custom prefix chosen when connecting Neon in
 * Vercel (e.g. ORCstorage_URL or ORCstorage_DATABASE_URL). Direct, unpooled URLs are skipped.
 */
function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const candidates = Object.entries(process.env).filter(
    ([key, value]) => /_URL$/i.test(key) && !/UNPOOLED|NON_POOLING|PRISMA/i.test(key) && /^postgres(ql)?:\/\//.test(value ?? ""),
  );
  const preferred = candidates.find(([key]) => /DATABASE_URL$/i.test(key)) ?? candidates[0];
  return preferred?.[1];
}

async function connect() {
  const url = databaseUrl();
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle({ client: neon(url), schema });
  }
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Connect a Neon database to the Vercel project.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite(process.env.PGLITE_DIR ?? ".data/pglite");
  return drizzle({ client, schema }) as unknown as ReturnType<typeof import("drizzle-orm/neon-http").drizzle<typeof schema>>;
}

const globalForDb = globalThis as unknown as { orcDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  globalForDb.orcDb ??= connect().then(async (db) => {
    for (const statement of schema.schemaSql.split(";").map((s) => s.trim()).filter(Boolean)) {
      await db.execute(sql.raw(statement));
    }
    return db;
  });
  globalForDb.orcDb.catch(() => {
    globalForDb.orcDb = undefined;
  });
  return globalForDb.orcDb;
}

export function isDatabaseConfigured() {
  return Boolean(databaseUrl()) || !process.env.VERCEL;
}

export { schema };
