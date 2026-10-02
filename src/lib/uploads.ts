import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Product and project photos go to Vercel Blob when it's connected (BLOB_READ_WRITE_TOKEN). In local
// development they're kept in .data/uploads and served by /api/uploads/[name].

const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function uploadsAvailable() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || !process.env.VERCEL;
}

export class UploadError extends Error {}

export async function saveImage(file: File, prefix: string, folder: "products" | "projects" = "products") {
  const ext = TYPES[file.type];
  if (!ext) throw new UploadError("Use JPG, PNG, WebP or AVIF photos.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Each photo must be under 8 MB.");
  const name = `${prefix}-${randomBytes(6).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${name}`, file, { access: "public", contentType: file.type, addRandomSuffix: true });
    return blob.url;
  }
  if (process.env.VERCEL) throw new UploadError("Photo storage isn't connected yet (Vercel → Storage → Blob).");
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}

export async function deleteImage(url: string) {
  try {
    if (url.startsWith("/api/uploads/")) {
      await unlink(path.join(LOCAL_DIR, path.basename(url)));
    } else if (process.env.BLOB_READ_WRITE_TOKEN && url.includes(".blob.vercel-storage.com/")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch (err) {
    console.warn("Could not delete image", url, err);
  }
}

export async function readLocalImage(name: string) {
  if (process.env.VERCEL || !/^[a-z0-9-]+\.(jpg|png|webp|avif)$/.test(name)) return null;
  try {
    return { data: await readFile(path.join(LOCAL_DIR, name)), ext: name.split(".").pop()! };
  } catch {
    return null;
  }
}
