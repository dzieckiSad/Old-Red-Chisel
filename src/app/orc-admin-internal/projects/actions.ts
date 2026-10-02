"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminBase, requireAdmin } from "@/lib/admin-auth";
import { type Project, type ProjectImage, isSampleImage, projectTypes } from "@/lib/project-types";
import {
  createProject,
  deleteProject,
  getProjectById,
  moveProject,
  projectSlugTaken,
  setProjectFlags,
  updateProject,
} from "@/lib/projects";
import { slugify } from "@/lib/slug";
import { UploadError, deleteImage, saveImage } from "@/lib/uploads";

export type ProjectFormState = { error?: string; fieldErrors?: Record<string, string>; saved?: boolean };

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);

const allowedUrl = (url: unknown): url is string =>
  typeof url === "string" &&
  (url.startsWith("/api/uploads/") || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url) || isSampleImage(url));

function image(value: unknown): ProjectImage | null {
  const i = value as ProjectImage | null;
  if (!i || !allowedUrl(i.url)) return null;
  return { url: i.url, alt: typeof i.alt === "string" ? i.alt.slice(0, 200) : undefined };
}

function parse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function refreshSite() {
  revalidatePath("/", "layout");
}

const imagesOf = (p: Project) => [p.before, p.after, ...p.photos].filter((i): i is ProjectImage => Boolean(i));

export async function uploadProjectImage(f: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No photo received." };
  try {
    return { url: await saveImage(file, slugify(str(f, "name", 60)) || "project", "projects") };
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message };
    console.error("Upload failed", err);
    return { error: "Upload failed. Try again." };
  }
}

export async function saveProject(_prev: ProjectFormState, f: FormData): Promise<ProjectFormState> {
  await requireAdmin();
  const base = await adminBase();
  const id = str(f, "id");
  const title = str(f, "title", 200);
  const slug = slugify(str(f, "slug", 100) || title);
  const type = str(f, "type", 50);

  const input: Project = {
    slug,
    title,
    place: str(f, "place", 100),
    type,
    summary: str(f, "summary", 300),
    description: str(f, "description"),
    materials: str(f, "materials", 200),
    duration: str(f, "duration", 200),
    before: image(parse(str(f, "before", 2000), null)),
    after: image(parse(str(f, "after", 2000), null)),
    photos: parse<unknown[]>(str(f, "photos", 20000), [])
      .map(image)
      .filter((i): i is ProjectImage => Boolean(i))
      .slice(0, 12),
    featured: f.get("featured") === "on",
    hidden: f.get("hidden") === "on",
  };

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Give the project a title.";
  if (!slug) fieldErrors.slug = "Needs letters or numbers.";
  else if (await projectSlugTaken(slug, id || undefined)) fieldErrors.slug = "Another project already uses this web address.";
  if (!projectTypes.includes(type as (typeof projectTypes)[number])) fieldErrors.type = "Choose a type.";
  if (Object.keys(fieldErrors).length) return { error: "Please check the highlighted fields.", fieldErrors };

  if (id) {
    const before = await getProjectById(id);
    if (!before) return { error: "This project no longer exists." };
    await updateProject(id, input);
    // Photos removed in the editor are deleted from storage once the change is saved.
    const kept = imagesOf(input).map((i) => i.url);
    for (const img of imagesOf(before)) if (!kept.includes(img.url)) await deleteImage(img.url);
    refreshSite();
    return { saved: true };
  }

  const created = await createProject(input);
  refreshSite();
  redirect(`${base}/projects/${created.id}?created=1`);
}

export async function toggleProjectFlag(id: string, flag: "hidden" | "featured") {
  await requireAdmin();
  const project = await getProjectById(id);
  if (!project) return;
  await setProjectFlags(id, { [flag]: !project[flag] });
  refreshSite();
}

export async function moveProjectAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  await moveProject(id, direction);
  refreshSite();
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  const base = await adminBase();
  const removed = await deleteProject(id);
  for (const img of removed ? imagesOf(removed) : []) await deleteImage(img.url);
  refreshSite();
  redirect(`${base}/projects?deleted=1`);
}
