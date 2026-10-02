import "server-only";
import { and, count, desc, eq, gte, isNull, like, lte, notInArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { type OrderStatus, orders, products } from "@/lib/db/schema";
import { isSampleImage } from "@/lib/project-types";
import { getProjects } from "@/lib/projects";

// Figures for the admin dashboard. "Order value" counts every order that isn't awaiting online
// payment or cancelled, by the month it was placed (Irish time).

const notCounted: OrderStatus[] = ["pending_payment", "cancelled"];
const TZ = "Europe/Dublin";

export type MonthTotal = { month: string; label: string; total: number; orders: number };

function monthKey(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).formatToParts(d);
  return `${parts.find((p) => p.type === "year")!.value}-${parts.find((p) => p.type === "month")!.value}`;
}

export async function getDashboard() {
  const db = await getDb();
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // The zone is inlined (not a bound parameter) so SELECT and GROUP BY are the same expression.
  const monthExpr = sql<string>`to_char(${orders.createdAt} at time zone 'Europe/Dublin', 'YYYY-MM')`;
  const [monthRows, stageRows, toCollect, lowStock, recent, projects] = await Promise.all([
    db
      .select({ month: monthExpr, total: sql<number>`coalesce(sum(${orders.total}), 0)`, orders: count() })
      .from(orders)
      .where(and(notInArray(orders.status, notCounted), gte(orders.createdAt, since)))
      .groupBy(monthExpr),
    db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status),
    db
      .select({ n: count(), total: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(and(like(orders.paymentRef, "manual:%"), isNull(orders.paidAt), notInArray(orders.status, ["cancelled"]))),
    db
      .select({ id: products.id, name: products.name, stock: products.stock })
      .from(products)
      .where(and(eq(products.mode, "in_stock"), eq(products.hidden, false), lte(products.stock, 1)))
      .orderBy(products.stock),
    db.select().from(orders).where(notInArray(orders.status, ["pending_payment"])).orderBy(desc(orders.createdAt)).limit(6),
    getProjects({ includeHidden: true }),
  ]);

  // Six months, oldest first, including months with no orders.
  const months: MonthTotal[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const key = monthKey(d);
    const row = monthRows.find((r) => r.month === key);
    months.push({
      month: key,
      label: new Intl.DateTimeFormat("en-IE", { month: "short", timeZone: TZ }).format(d),
      total: Number(row?.total ?? 0),
      orders: Number(row?.orders ?? 0),
    });
  }

  const stage = (statuses: OrderStatus[]) =>
    stageRows.filter((r) => statuses.includes(r.status)).reduce((s, r) => s + Number(r.n), 0);

  return {
    months,
    thisMonth: months[5],
    lastMonth: months[4],
    stages: {
      new: stage(["paid"]),
      workshop: stage(["in_production"]),
      ready: stage(["ready", "out_for_delivery", "ready_for_collection"]),
    },
    toCollect: { orders: Number(toCollect[0]?.n ?? 0), total: Number(toCollect[0]?.total ?? 0) },
    lowStock: lowStock.map((p) => ({ id: p.id, name: p.name, stock: p.stock ?? 0 })),
    recent,
    exampleProjects: projects.filter((p) => [p.before, p.after].some((img) => img && isSampleImage(img.url))).length,
    projects: projects.length,
  };
}
