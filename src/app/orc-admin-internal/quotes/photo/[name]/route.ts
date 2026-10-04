import { currentAdmin } from "@/lib/admin-auth";
import { readLocalImage } from "@/lib/uploads";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

// Customers' quote photos kept on the server's disk: only for a signed-in admin.
export async function GET(_request: Request, { params }: RouteContext<"/orc-admin-internal/quotes/photo/[name]">) {
  if (!(await currentAdmin())) return new Response("Not found", { status: 404 });
  const file = await readLocalImage((await params).name, { allowPrivate: true });
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { "Content-Type": MIME[file.ext], "Cache-Control": "private, no-store" },
  });
}
