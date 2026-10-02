import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";
import { CheckList, Container, PageHeader } from "@/components/ui";
import { getProduct } from "@/lib/products";
import { initialProjectType } from "@/lib/quote";
import { getContact, getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Get a free quote",
  description: "Send us a few details and photos and we'll come back with a price range within 48 hours.",
};

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const product = await getProduct(first(params.product) ?? "");
  const initialType = product ? "custom-product" : initialProjectType({ type: first(params.type), service: first(params.service) });

  const [content, contact] = await Promise.all([getContent(), getContact()]);
  const site = { ...contact, quoteResponseHours: content.quoteResponseHours, surveyFee: content.surveyFee };
  return (
    <>
      <PageHeader
        eyebrow="Free quote"
        title="Tell us about your project"
        intro={`It takes about two minutes. We'll reply within ${site.quoteResponseHours} hours with a price range and next steps.`}
      />
      <Container className="grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
        <QuoteForm initialType={initialType} product={product ? { slug: product.slug, name: product.name } : undefined} site={site} />
        <aside className="space-y-6">
          <div className="border border-line bg-white p-6">
            <h2 className="font-semibold text-ink">What happens next</h2>
            <div className="mt-4">
              <CheckList
                items={[
                  `A price range within ${site.quoteResponseHours} hours`,
                  `A home survey if you'd like one (€${site.surveyFee}, deducted from your order)`,
                  "A detailed design and fixed quote",
                  "No obligation at any stage",
                ]}
              />
            </div>
          </div>
          <div className="border border-line bg-white p-6">
            <h2 className="font-semibold text-ink">Prefer to talk?</h2>
            <p className="mt-2 text-sm text-graphite">Call us or send a photo on WhatsApp.</p>
            <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
              <a href={site.phoneHref} className="text-brand hover:underline">{site.phone}</a>
              <a href={site.whatsappHref} className="text-brand hover:underline">WhatsApp us →</a>
            </div>
          </div>
        </aside>
      </Container>
    </>
  );
}
