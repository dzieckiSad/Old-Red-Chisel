import Link from "next/link";
import { redirect } from "next/navigation";
import { ManualOrderForm } from "@/components/admin/manual-order-form";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { currentPrice } from "@/lib/catalog";
import { getProducts } from "@/lib/products";

export default async function NewOrderPage() {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const products = (await getProducts({ includeHidden: true }))
    .filter((p) => p.mode !== "quote_only")
    .map((p) => ({ slug: p.slug, name: p.name, price: currentPrice(p) }));

  return (
    <>
      <Link href={`${base}/orders`} className="text-sm font-semibold text-graphite hover:text-ink">← All orders</Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold">New order</h1>
      <p className="mt-1 mb-6 text-sm text-graphite">
        For customers who order by phone or in person and pay in cash, by transfer or later. They get an order number and
        password to follow the order on the website, just like online orders.
      </p>
      <ManualOrderForm products={products} base={base} />
    </>
  );
}
