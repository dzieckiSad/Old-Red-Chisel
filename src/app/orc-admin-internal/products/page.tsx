import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductPhoto } from "@/components/product-photo";
import { SketchIcon } from "@/components/sketch/icons";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { currentPrice, getCategory, isSoldOut, modeLabels, onSale } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getProducts } from "@/lib/products";
import { uploadsAvailable } from "@/lib/uploads";
import { moveProductAction, toggleProductFlag } from "./actions";

export default async function AdminProductsPage({ searchParams }: PageProps<"/orc-admin-internal/products">) {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const { deleted } = await searchParams;
  const products = await getProducts({ includeHidden: true });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold">Products</h1>
        <Link href={`${base}/products/new`} className="btn btn--primary">
          + New product
        </Link>
      </div>
      {deleted && <p role="status" className="mt-4 text-sm font-medium">Product deleted.</p>}
      {!uploadsAvailable() && (
        <p className="mt-4 border-l-4 border-oak bg-white p-3 text-sm">
          This host doesn&apos;t keep uploaded files: set BLOB_READ_WRITE_TOKEN (Vercel Blob) and redeploy.
        </p>
      )}

      <ul className="mt-6 divide-y divide-line border border-line bg-white">
        {products.map((p, i) => (
          <li key={p.id} className={`grid grid-cols-[56px_1fr] gap-4 p-3 sm:grid-cols-[56px_1.6fr_1fr_auto] sm:items-center ${p.hidden ? "bg-sand/40" : ""}`}>
            <ProductPhoto image={p.images?.[0]} alt="" sizes="56px" className={`h-14 w-14 ${p.hidden ? "opacity-50" : ""}`} />
            <Link href={`${base}/products/${p.id}`} className="group">
              <span className="block font-semibold group-hover:text-brand">
                {p.name}
                {p.hidden && <span className="ml-2 bg-ink/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase">Hidden</span>}
                {p.featured && <span className="ml-2 bg-oak/20 px-1.5 py-0.5 text-[11px] font-semibold uppercase">Featured</span>}
                {onSale(p) && <span className="ml-2 bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-white uppercase">Sale</span>}
              </span>
              <span className="text-sm text-graphite">
                {getCategory(p.category)?.name ?? p.category} · {modeLabels[p.mode]}
              </span>
            </Link>
            <span className="col-start-2 text-sm sm:col-start-auto">
              <span className="block font-semibold">
                {p.mode === "quote_only" ? `from ${formatPrice(p.price)}` : formatPrice(currentPrice(p))}
                {onSale(p) && <s className="ml-2 font-normal text-graphite">{formatPrice(p.price)}</s>}
              </span>
              {p.mode === "in_stock" && (
                <span className={isSoldOut(p) ? "font-semibold text-brand" : "text-graphite"}>
                  {isSoldOut(p) ? "Sold out" : `${p.stock} in stock`}
                </span>
              )}
            </span>
            <div className="col-start-2 flex flex-wrap items-center gap-1 sm:col-start-auto">
              <form action={moveProductAction.bind(null, p.id!, "up")}>
                <IconButton label="Move up" disabled={i === 0}>↑</IconButton>
              </form>
              <form action={moveProductAction.bind(null, p.id!, "down")}>
                <IconButton label="Move down" disabled={i === products.length - 1}>↓</IconButton>
              </form>
              <form action={toggleProductFlag.bind(null, p.id!, "featured")}>
                <IconButton label={p.featured ? "Remove from home page" : "Feature on home page"}>{p.featured ? "★" : "☆"}</IconButton>
              </form>
              <form action={toggleProductFlag.bind(null, p.id!, "hidden")}>
                <button type="submit" className="border border-line px-2.5 py-1.5 text-xs font-semibold hover:border-ink/40">
                  {p.hidden ? "Show" : "Hide"}
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {products.length === 0 && (
        <div className="mt-6 flex flex-col items-center border border-line bg-white p-12 text-center">
          <SketchIcon name="plane" size={64} />
          <p className="font-hand mt-3 text-2xl text-graphite">no products yet</p>
        </div>
      )}
    </>
  );
}

function IconButton({ label, disabled, children }: { label: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" aria-label={label} title={label} disabled={disabled} className="grid h-8 w-8 place-items-center border border-line text-sm hover:border-ink/40 disabled:opacity-30">
      {children}
    </button>
  );
}
