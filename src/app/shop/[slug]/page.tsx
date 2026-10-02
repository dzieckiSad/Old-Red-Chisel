import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { ProductCard } from "@/components/sections";
import { Container, PhotoPlaceholder, SectionHeading } from "@/components/ui";
import { getCategory, getProduct, getProducts } from "@/lib/catalog";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const category = getCategory(product.category);
  const related = getProducts({ category: product.category })
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <Container className="py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-graphite">
          <Link href="/shop" className="hover:text-brand">
            Shop
          </Link>
          {category && (
            <>
              {" / "}
              <Link href={`/shop?category=${category.slug}`} className="hover:text-brand">
                {category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-6 grid items-start gap-10 md:grid-cols-2">
          <div className="grid gap-3 md:sticky md:top-32">
            <PhotoPlaceholder label="Product photo" className="aspect-square" />
            <div className="grid grid-cols-3 gap-3">
              <PhotoPlaceholder className="aspect-square" />
              <PhotoPlaceholder className="aspect-square" />
              <PhotoPlaceholder className="aspect-square" />
            </div>
          </div>

          <div>
            <h1 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-lg text-graphite">{product.summary}</p>

            <div className="mt-6">
              <BuyBox product={product} />
            </div>

            <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
              {[
                ["Dimensions", product.dimensions],
                ["Material", product.material],
                ["Lead time", product.leadTime],
                ["Delivery", "Our own van across the Midlands, or free collection in Athlone"],
              ].map(([term, value]) => (
                <div key={term} className="grid grid-cols-3 gap-4 py-3">
                  <dt className="font-medium text-ink">{term}</dt>
                  <dd className="col-span-2 text-graphite">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-graphite">{product.description}</p>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="bg-white">
          <Container className="py-14">
            <SectionHeading title="You might also like" />
            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
