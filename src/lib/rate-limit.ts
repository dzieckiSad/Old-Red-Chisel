import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/lib/db";

/** Counts an attempt for `key`; returns false once `max` attempts were made inside the window. */
export async function allowAttempt(key: string, max: number, windowSeconds: number) {
  const db = await getDb();
  const result = await db.execute(sql`
    insert into login_attempts (key, count, window_start) values (${key}, 1, now())
    on conflict (key) do update set
      count = case when login_attempts.window_start < now() - make_interval(secs => ${windowSeconds}) then 1 else login_attempts.count + 1 end,
      window_start = case when login_attempts.window_start < now() - make_interval(secs => ${windowSeconds}) then now() else login_attempts.window_start end
    returning count
  `);
  const rows = (result as unknown as { rows?: { count: number }[] }).rows ?? (result as unknown as { count: number }[]);
  return Number(rows[0]?.count ?? 0) <= max;
}

export async function clearAttempts(key: string) {
  const db = await getDb();
  await db.execute(sql`delete from login_attempts where key = ${key}`);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
