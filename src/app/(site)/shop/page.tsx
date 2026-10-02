import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/sections";
import { Container, PageHeader } from "@/components/ui";
import { categories, getCategory } from "@/lib/catalog";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop handmade furniture & joinery",
  description:
    "Handmade bedside lockers, home bars, sideboards, TV units and shelving from our Athlone workshop. In stock or made to order.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const { category } = await searchParams;
  const active = typeof category === "string" ? getCategory(category) : undefined;
  const products = await getProducts({ category: active?.slug });

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title={active ? active.name : "Handmade pieces"}
        intro="Ready to go or made to order in our Athlone workshop. Need a different size? We can make any piece to your measurements."
      />
      <Container className="py-12">
        <nav aria-label="Categories" className="flex flex-wrap gap-2">
          <CategoryLink href="/shop" active={!active}>
            All
          </CategoryLink>
          {categories.map((c) => (
            <CategoryLink key={c.slug} href={`/shop?category=${c.slug}`} active={active?.slug === c.slug}>
              {c.name}
            </CategoryLink>
          ))}
        </nav>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-graphite">
            Nothing in this category yet.{" "}
            <Link href="/quote" className="font-semibold text-brand hover:underline">
              Ask us to make one for you →
            </Link>
          </p>
        )}
      </Container>
    </>
  );
}

function CategoryLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-medium ${
        active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-ink/40"
      }`}
    >
      {children}
    </Link>
  );
}
