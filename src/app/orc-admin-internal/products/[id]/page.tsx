import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { getProductById } from "@/lib/products";
import { deleteProductAction } from "../actions";

export default async function EditProductPage({ params, searchParams }: PageProps<"/orc-admin-internal/products/[id]">) {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const { id } = await params;
  const product = /^[0-9a-f-]{36}$/i.test(id) ? await getProductById(id) : null;
  if (!product) notFound();
  const { created } = await searchParams;

  return (
    <>
      <Link href={`${base}/products`} className="text-sm font-semibold text-graphite hover:text-ink">← All products</Link>
      <div className="mt-3 mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">{product.name}</h1>
        {!product.hidden && (
          <a href={`/shop/${product.slug}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand underline">
            View in shop ↗
          </a>
        )}
      </div>
      {created && <p role="status" className="mb-4 text-sm font-medium">Product created.</p>}
      <ProductEditor product={product} />
      <form action={deleteProductAction.bind(null, product.id!)} className="mt-10 border-t border-line pt-6">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-brand">Delete this product…</summary>
          <p className="mt-3 text-sm text-graphite">This removes the product and its photos for good. Past orders keep their details. To take it off the shop for a while, use “Hide from the shop” instead.</p>
          <button type="submit" className="btn btn--dark mt-3">Delete permanently</button>
        </details>
      </form>
    </>
  );
}
