"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminBase, requireAdmin } from "@/lib/admin-auth";
import { type ProductImage, type ProductMode, categories } from "@/lib/catalog";
import {
  type ProductInput,
  createProduct,
  deleteProduct,
  getProductById,
  moveProduct,
  setProductFlags,
  slugTaken,
  updateProduct,
} from "@/lib/products";
import { slugify } from "@/lib/slug";
import { UploadError, deleteImage, saveImage } from "@/lib/uploads";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string>; saved?: boolean };

const modes: ProductMode[] = ["in_stock", "made_to_order", "quote_only"];
const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);

function money(value: string) {
  if (!value) return null;
  const n = Number(value.replace(",", ".").replace(/[€\s]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

function refreshSite() {
  revalidatePath("/", "layout");
}

export async function uploadProductImage(f: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = f.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No photo received." };
  try {
    return { url: await saveImage(file, slugify(str(f, "name", 60)) || "product") };
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message };
    console.error("Upload failed", err);
    return { error: "Upload failed. Try again." };
  }
}

export async function saveProduct(_prev: ProductFormState, f: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const base = await adminBase();
  const id = str(f, "id");

  const name = str(f, "name", 200);
  const slug = slugify(str(f, "slug", 100) || name);
  const category = str(f, "category");
  const mode = str(f, "mode") as ProductMode;
  const price = money(str(f, "price"));
  const salePrice = money(str(f, "salePrice"));
  const saleEndsAt = str(f, "saleEndsAt");
  const stockRaw = str(f, "stock");
  const stock = stockRaw === "" ? null : Number(stockRaw);

  let images: ProductImage[] = [];
  try {
    const parsed = JSON.parse(str(f, "images", 20000) || "[]") as ProductImage[];
    images = parsed
      .filter((i) => typeof i?.url === "string" && (i.url.startsWith("/api/uploads/") || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(i.url)))
      .slice(0, 12)
      .map((i) => ({ url: i.url, alt: typeof i.alt === "string" ? i.alt.slice(0, 200) : undefined }));
  } catch {
    images = [];
  }

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Give the product a name.";
  if (!slug) fieldErrors.slug = "Needs letters or numbers.";
  else if (await slugTaken(slug, id || undefined)) fieldErrors.slug = "Another product already uses this web address.";
  if (!categories.some((c) => c.slug === category)) fieldErrors.category = "Choose a category.";
  if (!modes.includes(mode)) fieldErrors.mode = "Choose how it's sold.";
  if (price === null || Number.isNaN(price) || price <= 0) fieldErrors.price = "Enter a price in euro, e.g. 245 or 245.50.";
  if (salePrice !== null && (Number.isNaN(salePrice) || salePrice <= 0 || (price !== null && salePrice >= price))) {
    fieldErrors.salePrice = "The offer price must be lower than the normal price.";
  }
  if (saleEndsAt && !/^\d{4}-\d{2}-\d{2}$/.test(saleEndsAt)) fieldErrors.saleEndsAt = "Choose a valid date.";
  if (mode === "in_stock" && (stock === null || !Number.isInteger(stock) || stock < 0)) fieldErrors.stock = "Enter how many are in stock (0 or more).";
  if (Object.keys(fieldErrors).length) return { error: "Please check the highlighted fields.", fieldErrors };

  const input: ProductInput = {
    slug,
    name,
    category: category as ProductInput["category"],
    mode,
    price: price!,
    salePrice: salePrice ?? null,
    saleEndsAt: salePrice ? saleEndsAt || null : null,
    summary: str(f, "summary", 300),
    description: str(f, "description"),
    dimensions: str(f, "dimensions", 200),
    material: str(f, "material", 200),
    leadTime: str(f, "leadTime", 200),
    stock: mode === "in_stock" ? stock : null,
    images,
    featured: f.get("featured") === "on",
    hidden: f.get("hidden") === "on",
  };

  if (id) {
    const before = await getProductById(id);
    if (!before) return { error: "This product no longer exists." };
    await updateProduct(id, input);
    // Photos removed in the editor are deleted from storage once the change is saved.
    for (const img of before.images ?? []) {
      if (!images.some((i) => i.url === img.url)) await deleteImage(img.url);
    }
    refreshSite();
    return { saved: true };
  }

  const created = await createProduct(input);
  refreshSite();
  redirect(`${base}/products/${created.id}?created=1`);
}

export async function toggleProductFlag(id: string, flag: "hidden" | "featured") {
  await requireAdmin();
  const product = await getProductById(id);
  if (!product) return;
  await setProductFlags(id, { [flag]: !product[flag] });
  refreshSite();
}

export async function moveProductAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  await moveProduct(id, direction);
  refreshSite();
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const base = await adminBase();
  const removed = await deleteProduct(id);
  for (const img of removed?.images ?? []) await deleteImage(img.url);
  refreshSite();
  redirect(`${base}/products?deleted=1`);
}
