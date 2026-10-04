import "server-only";
import { mkdir } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { dataDir, isServerless } from "@/lib/runtime";
import * as schema from "./schema";

// With DATABASE_URL: any PostgreSQL (Neon is reached over HTTP, anything else over a normal
// connection). Without it: an embedded PostgreSQL (PGlite) in the data directory (DATA_DIR).

type Db = Awaited<ReturnType<typeof connect>>;

/**
 * DATABASE_URL, or the same variable under a custom prefix some hosts add (e.g. ORCstorage_URL or
 * ORCstorage_DATABASE_URL). Direct, unpooled URLs are skipped.
 */
export function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const candidates = Object.entries(process.env).filter(
    ([key, value]) => /_URL$/i.test(key) && !/UNPOOLED|NON_POOLING|PRISMA/i.test(key) && /^postgres(ql)?:\/\//.test(value ?? ""),
  );
  const preferred = candidates.find(([key]) => /DATABASE_URL$/i.test(key)) ?? candidates[0];
  return preferred?.[1];
}

async function connect() {
  const url = databaseUrl();
  if (url && new URL(url).hostname.endsWith(".neon.tech")) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle({ client: neon(url), schema });
  }
  type NeonDb = ReturnType<typeof import("drizzle-orm/neon-http").drizzle<typeof schema>>;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    return drizzle({ client: new Pool({ connectionString: url, max: 5 }), schema }) as unknown as NeonDb;
  }
  if (isServerless()) {
    throw new Error("DATABASE_URL is not set. This host doesn't keep files, so it needs an external PostgreSQL.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const dir = process.env.PGLITE_DIR ?? `${dataDir()}/pglite`;
  await mkdir(dir, { recursive: true });
  const client = new PGlite(dir);
  return drizzle({ client, schema }) as unknown as NeonDb;
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
  return Boolean(databaseUrl()) || !isServerless();
}

export { schema };
