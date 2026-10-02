import { readLocalImage } from "@/lib/uploads";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

// Local development only: serves photos uploaded in the admin panel from .data/uploads.
export async function GET(_request: Request, { params }: RouteContext<"/api/uploads/[name]">) {
  const file = await readLocalImage((await params).name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { "Content-Type": MIME[file.ext], "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
