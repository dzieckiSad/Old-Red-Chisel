import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { adminBase, currentAdmin } from "@/lib/admin-auth";

export default async function NewProductPage() {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  return (
    <>
      <Link href={`${base}/products`} className="text-sm font-semibold text-graphite hover:text-ink">← All products</Link>
      <h1 className="mt-3 mb-6 font-serif text-3xl font-semibold">New product</h1>
      <ProductEditor />
    </>
  );
}
