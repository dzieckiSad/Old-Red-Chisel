import "server-only";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { type Product, sampleProducts, withExampleImage } from "@/lib/catalog";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { products } from "@/lib/db/schema";

// Products live in the database and are edited in the admin panel. Without a database (e.g. a
// Vercel deployment before Neon is connected) the sample products from catalog.ts are shown.

type Row = typeof products.$inferSelect;

const toEuro = (c: number | null) => (c == null ? null : c / 100);
const toCents = (e: number | null | undefined) => (e == null ? null : Math.round(e * 100));

function fromRow(r: Row): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category as Product["category"],
    mode: r.mode,
    price: r.price / 100,
    salePrice: toEuro(r.salePrice),
    saleEndsAt: r.saleEndsAt,
    summary: r.summary,
    description: r.description,
    dimensions: r.dimensions,
    material: r.material,
    leadTime: r.leadTime,
    stock: r.stock,
    options: r.options,
    images: r.images,
    featured: r.featured,
    isNew: r.isNew,
    hidden: r.hidden,
    sortOrder: r.sortOrder,
  };
}

const globalForSeed = globalThis as unknown as { orcSeeded?: Promise<void> };

/** On first use of an empty products table, load the sample products (visible). */
async function seeded() {
  globalForSeed.orcSeeded ??= (async () => {
    const db = await getDb();
    const [row] = await db.select({ n: count() }).from(products);
    if (Number(row?.n ?? 0) > 0) return;
    await db
      .insert(products)
      .values(
        sampleProducts.map((p, i) => ({
          slug: p.slug,
          name: p.name,
          category: p.category,
          mode: p.mode,
          price: toCents(p.price)!,
          summary: p.summary,
          description: p.description,
          dimensions: p.dimensions,
          material: p.material,
          leadTime: p.leadTime,
          stock: p.stock ?? null,
          options: p.options ?? [],
          featured: p.featured ?? false,
          isNew: p.isNew ?? false,
          sortOrder: (i + 1) * 10,
        })),
      )
      .onConflictDoNothing();
  })().catch((err) => {
    globalForSeed.orcSeeded = undefined;
    throw err;
  });
  return globalForSeed.orcSeeded;
}

async function db() {
  const d = await getDb();
  await seeded();
  return d;
}

// The embedded local database can't be shared by parallel build workers, so local builds
// prerender from the samples; pages refresh from the database once running (revalidate).
const dbEnabled = () =>
  isDatabaseConfigured() && !(process.env.NEXT_PHASE === "phase-production-build" && !process.env.DATABASE_URL);

export async function getProducts(filter?: { category?: string; includeHidden?: boolean }): Promise<Product[]> {
  if (!dbEnabled()) {
    return sampleProducts.filter((p) => !filter?.category || p.category === filter.category).map(withExampleImage);
  }
  const d = await db();
  const conditions = [];
  if (!filter?.includeHidden) conditions.push(eq(products.hidden, false));
  if (filter?.category) conditions.push(eq(products.category, filter.category));
  const rows = await d
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(products.sortOrder), asc(products.createdAt));
  return rows.map(fromRow).map(withExampleImage);
}

export async function getFeaturedProducts() {
  return (await getProducts()).filter((p) => p.featured).slice(0, 8);
}

/** A visible product by slug (hidden products 404 on the site). */
export async function getProduct(slug: string, opts?: { includeHidden?: boolean }) {
  if (!dbEnabled()) {
    const p = sampleProducts.find((s) => s.slug === slug);
    return p ? withExampleImage(p) : null;
  }
  const d = await db();
  const [row] = await d.select().from(products).where(eq(products.slug, slug));
  if (!row || (row.hidden && !opts?.includeHidden)) return null;
  return withExampleImage(fromRow(row));
}

export async function getProductById(id: string) {
  const d = await db();
  const [row] = await d.select().from(products).where(eq(products.id, id));
  return row ? fromRow(row) : null;
}

export type ProductInput = Omit<Product, "id" | "options" | "images"> & { images: Product["images"] };

function toValues(p: ProductInput) {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    mode: p.mode,
    price: toCents(p.price)!,
    salePrice: toCents(p.salePrice),
    saleEndsAt: p.saleEndsAt || null,
    summary: p.summary,
    description: p.description,
    dimensions: p.dimensions,
    material: p.material,
    leadTime: p.leadTime,
    stock: p.stock ?? null,
    images: p.images ?? [],
    featured: p.featured ?? false,
    isNew: p.isNew ?? false,
    hidden: p.hidden ?? false,
    sortOrder: p.sortOrder ?? 0,
    updatedAt: new Date(),
  };
}

export async function createProduct(p: ProductInput) {
  const d = await db();
  const [maxRow] = await d.select({ max: sql<number>`coalesce(max(${products.sortOrder}), 0)` }).from(products);
  const [row] = await d
    .insert(products)
    .values({ ...toValues(p), sortOrder: Number(maxRow?.max ?? 0) + 10 })
    .returning();
  return fromRow(row);
}

export async function updateProduct(id: string, p: ProductInput) {
  const d = await db();
  const { sortOrder: _keep, ...values } = toValues(p);
  void _keep;
  const [row] = await d.update(products).set(values).where(eq(products.id, id)).returning();
  return row ? fromRow(row) : null;
}

export async function setProductFlags(id: string, flags: { hidden?: boolean; featured?: boolean }) {
  const d = await db();
  await d.update(products).set({ ...flags, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function deleteProduct(id: string) {
  const d = await db();
  const [row] = await d.delete(products).where(eq(products.id, id)).returning();
  return row ? fromRow(row) : null;
}

/** Swaps the product with its neighbour in the shop order. */
export async function moveProduct(id: string, direction: "up" | "down") {
  const all = await getProducts({ includeHidden: true });
  const i = all.findIndex((p) => p.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= all.length) return;
  const d = await db();
  // Renumber everything so equal sort orders can't get stuck.
  const ordered = [...all];
  [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  for (const [index, p] of ordered.entries()) {
    if (p.sortOrder !== (index + 1) * 10) {
      await d.update(products).set({ sortOrder: (index + 1) * 10 }).where(eq(products.id, p.id!));
    }
  }
}

export async function slugTaken(slug: string, exceptId?: string) {
  const d = await db();
  const [row] = await d.select({ id: products.id }).from(products).where(eq(products.slug, slug));
  return Boolean(row && row.id !== exceptId);
}

/** Takes paid quantities off in-stock products. Never goes below zero. */
export async function takeFromStock(lines: { slug: string; quantity: number }[]) {
  if (!dbEnabled()) return;
  const d = await db();
  for (const line of lines) {
    await d
      .update(products)
      .set({ stock: sql`greatest(coalesce(${products.stock}, 0) - ${line.quantity}, 0)`, updatedAt: new Date() })
      .where(and(eq(products.slug, line.slug), eq(products.mode, "in_stock")));
  }
}
