import "server-only";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { type Project, sampleProjects } from "@/lib/project-types";

// Projects live in the database and are edited in the admin panel. Without a database the
// example projects from project-types.ts are shown.

type Row = typeof projects.$inferSelect;

function fromRow(r: Row): Project {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    place: r.place,
    type: r.type,
    summary: r.summary,
    description: r.description,
    materials: r.materials,
    duration: r.duration,
    before: r.before ?? null,
    after: r.after ?? null,
    photos: r.photos,
    featured: r.featured,
    hidden: r.hidden,
    sortOrder: r.sortOrder,
  };
}

const globalForSeed = globalThis as unknown as { orcProjectsSeeded?: Promise<void> };

/** On first use of an empty projects table, load the example projects. */
async function seeded() {
  globalForSeed.orcProjectsSeeded ??= (async () => {
    const db = await getDb();
    const [row] = await db.select({ n: count() }).from(projects);
    if (Number(row?.n ?? 0) > 0) return;
    await db
      .insert(projects)
      .values(sampleProjects.map((p, i) => ({ ...toValues(p), sortOrder: (i + 1) * 10 })))
      .onConflictDoNothing();
  })().catch((err) => {
    globalForSeed.orcProjectsSeeded = undefined;
    throw err;
  });
  return globalForSeed.orcProjectsSeeded;
}

async function db() {
  const d = await getDb();
  await seeded();
  return d;
}

// Same rule as products: local builds prerender from the examples (see src/lib/products.ts).
const dbEnabled = () =>
  isDatabaseConfigured() && !(process.env.NEXT_PHASE === "phase-production-build" && !process.env.DATABASE_URL);

export async function getProjects(opts?: { includeHidden?: boolean }): Promise<Project[]> {
  if (!dbEnabled()) return sampleProjects;
  const d = await db();
  const rows = await d
    .select()
    .from(projects)
    .where(opts?.includeHidden ? undefined : eq(projects.hidden, false))
    .orderBy(asc(projects.sortOrder), asc(projects.createdAt));
  return rows.map(fromRow);
}

/** The project shown in "See the difference" on the home page: the first featured one with both photos. */
export async function getFeaturedProject() {
  const all = (await getProjects()).filter((p) => p.before && p.after);
  return all.find((p) => p.featured) ?? all[0] ?? null;
}

export async function getProject(slug: string) {
  if (!dbEnabled()) return sampleProjects.find((p) => p.slug === slug) ?? null;
  const d = await db();
  const [row] = await d.select().from(projects).where(and(eq(projects.slug, slug), eq(projects.hidden, false)));
  return row ? fromRow(row) : null;
}

export async function getProjectById(id: string) {
  const d = await db();
  const [row] = await d.select().from(projects).where(eq(projects.id, id));
  return row ? fromRow(row) : null;
}

function toValues(p: Project) {
  return {
    slug: p.slug,
    title: p.title,
    place: p.place,
    type: p.type,
    summary: p.summary,
    description: p.description,
    materials: p.materials,
    duration: p.duration,
    before: p.before,
    after: p.after,
    photos: p.photos,
    featured: p.featured ?? false,
    hidden: p.hidden ?? false,
    updatedAt: new Date(),
  };
}

export async function createProject(p: Project) {
  const d = await db();
  const [maxRow] = await d.select({ max: sql<number>`coalesce(max(${projects.sortOrder}), 0)` }).from(projects);
  const [row] = await d
    .insert(projects)
    .values({ ...toValues(p), sortOrder: Number(maxRow?.max ?? 0) + 10 })
    .returning();
  return fromRow(row);
}

export async function updateProject(id: string, p: Project) {
  const d = await db();
  const [row] = await d.update(projects).set(toValues(p)).where(eq(projects.id, id)).returning();
  return row ? fromRow(row) : null;
}

export async function setProjectFlags(id: string, flags: { hidden?: boolean; featured?: boolean }) {
  const d = await db();
  await d.update(projects).set({ ...flags, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function deleteProject(id: string) {
  const d = await db();
  const [row] = await d.delete(projects).where(eq(projects.id, id)).returning();
  return row ? fromRow(row) : null;
}

/** Swaps the project with its neighbour in the list order. */
export async function moveProject(id: string, direction: "up" | "down") {
  const all = await getProjects({ includeHidden: true });
  const i = all.findIndex((p) => p.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= all.length) return;
  const d = await db();
  const ordered = [...all];
  [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  for (const [index, p] of ordered.entries()) {
    if (p.sortOrder !== (index + 1) * 10) {
      await d.update(projects).set({ sortOrder: (index + 1) * 10 }).where(eq(projects.id, p.id!));
    }
  }
}

export async function projectSlugTaken(slug: string, exceptId?: string) {
  const d = await db();
  const [row] = await d.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug));
  return Boolean(row && row.id !== exceptId);
}
