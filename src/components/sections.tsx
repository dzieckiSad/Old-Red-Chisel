import Link from "next/link";
import { ButtonLink, Container, PhotoPlaceholder } from "@/components/ui";
import { type Product, modeLabels } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <PhotoPlaceholder className="aspect-[4/5] transition-opacity group-hover:opacity-90" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-ink group-hover:text-brand">{product.name}</h3>
          <p className="mt-0.5 text-xs text-graphite">{modeLabels[product.mode]}</p>
        </div>
        <p className="shrink-0 font-semibold text-ink">
          {product.mode === "quote_only" ? `from ${formatPrice(product.price)}` : formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

// TODO: replace with real figures once the Google Business Profile is live.
const trustItems = [
  { value: "Handmade", label: "in our Athlone workshop" },
  { value: "One team", label: "from survey to fitting" },
  { value: `${site.quoteResponseHours}h`, label: "quote response time" },
  { value: "Fully insured", label: "public liability cover" },
];

export function TrustBar() {
  return (
    <div className="border-y border-line bg-white">
      <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item.value}>
            <p className="font-serif text-2xl font-semibold text-ink">{item.value}</p>
            <p className="text-sm text-graphite">{item.label}</p>
          </div>
        ))}
      </Container>
    </div>
  );
}

export const processSteps = [
  {
    title: "Tell us what you need",
    text: "Send a few photos and rough sizes through our quote form or WhatsApp.",
  },
  {
    title: "Estimate in 48 hours",
    text: "We come back with a price range so you know where you stand before anyone visits.",
  },
  {
    title: "Survey & design",
    text: `We measure on site and draw up the design. The €${site.surveyFee} survey fee comes off your order.`,
  },
  {
    title: "Built in our workshop",
    text: "Your joinery is made by hand in Athlone. We keep you updated at each stage.",
  },
  {
    title: "Fitted by the same team",
    text: "The people who built it fit it, tidy up, and make sure you're happy before we leave.",
  },
];

export function ProcessSteps() {
  return (
    <ol className="grid gap-6 md:grid-cols-5">
      {processSteps.map((step, i) => (
        <li key={step.title} className="rounded-lg border border-line bg-white p-5">
          <span className="font-serif text-3xl font-semibold text-brand">{i + 1}</span>
          <h3 className="mt-2 font-semibold text-ink">{step.title}</h3>
          <p className="mt-2 text-sm text-graphite">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function CtaBand({
  title = "Have a project in mind?",
  text = "Send us a photo and a few measurements. You'll get a price range within 48 hours, with no obligation.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="bg-brand text-white">
      <Container className="flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-serif text-3xl font-semibold">{title}</h2>
          <p className="mt-3 text-white/85">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/quote" variant="light">
            Get a free quote
          </ButtonLink>
          <a
            href={site.whatsappHref}
            className="inline-flex items-center rounded-md border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10"
          >
            WhatsApp a photo
          </a>
        </div>
      </Container>
    </section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
            {item.q}
            <span aria-hidden className="text-brand transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-graphite">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
