import Link from "next/link";
import { type IconName, SketchIcon } from "@/components/sketch/icons";
import { CornerMarks, PencilNote } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { ButtonLink, Container, PhotoPlaceholder } from "@/components/ui";
import { ProductPhoto } from "@/components/product-photo";
import { type Product, currentPrice, isSoldOut, modeLabels, onSale } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  const sale = onSale(product);
  const soldOut = isSoldOut(product);
  const badge = soldOut ? "Sold out" : sale ? "Sale" : product.mode === "in_stock" ? "In stock" : null;
  return (
    <Link href={`/shop/${product.slug}`} className="card group block p-2.5">
      <div className="relative overflow-hidden">
        <ProductPhoto
          image={product.images?.[0]}
          alt={product.name}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={`aspect-[4/5] transition-transform duration-700 ease-out group-hover:scale-[1.03] ${soldOut ? "opacity-60" : ""}`}
        />
        {badge && (
          <span
            className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
              sale && !soldOut ? "bg-brand text-white" : "bg-white text-ink"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 px-1.5 pt-3 pb-1.5">
        <div>
          <h3 className="font-medium text-ink group-hover:text-brand">{product.name}</h3>
          <p className="mt-0.5 text-xs text-graphite">{modeLabels[product.mode]}</p>
        </div>
        <p className="shrink-0 text-right font-semibold text-ink">
          {product.mode === "quote_only" ? (
            `from ${formatPrice(product.price)}`
          ) : sale ? (
            <>
              <span className="text-brand">{formatPrice(currentPrice(product))}</span>
              <s className="block text-xs font-normal text-graphite">{formatPrice(product.price)}</s>
            </>
          ) : (
            formatPrice(product.price)
          )}
        </p>
      </div>
      <CornerMarks />
    </Link>
  );
}

// TODO: replace with real figures once the Google Business Profile is live.
const trustItems: { icon: IconName; value: string; label: string }[] = [
  { icon: "plane", value: "Handmade", label: "in our Athlone workshop" },
  { icon: "team", value: "One team", label: "from survey to fitting" },
  { icon: "clock", value: `${site.quoteResponseHours}h`, label: "quote response time" },
  { icon: "shield", value: "Fully insured", label: "public liability cover" },
];

export function TrustBar() {
  return (
    <div className="border-y border-line bg-white">
      <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
        {trustItems.map((item, i) => (
          <Reveal key={item.value} delay={i * 80} className="flex items-center gap-3">
            <SketchIcon name={item.icon} size={44} />
            <div>
              <p className="font-serif text-xl font-semibold text-ink">{item.value}</p>
              <p className="text-sm text-graphite">{item.label}</p>
            </div>
          </Reveal>
        ))}
      </Container>
    </div>
  );
}

export const processSteps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "camera",
    title: "Tell us what you need",
    text: "Send a few photos and rough sizes through our quote form or WhatsApp.",
  },
  {
    icon: "clipboard",
    title: "Estimate in 48 hours",
    text: "We come back with a price range so you know where you stand before anyone visits.",
  },
  {
    icon: "tape",
    title: "Survey & design",
    text: `We measure on site and draw up the design. The €${site.surveyFee} survey fee comes off your order.`,
  },
  {
    icon: "chisel",
    title: "Built in our workshop",
    text: "Your joinery is made by hand in Athlone. We keep you updated at each stage.",
  },
  {
    icon: "houseCheck",
    title: "Fitted by the same team",
    text: "The people who built it fit it, tidy up, and make sure you're happy before we leave.",
  },
];

export function ProcessSteps() {
  return (
    <ol className="relative grid gap-8 md:grid-cols-5 md:gap-5">
      {/* pencil guide line joining the steps */}
      <svg aria-hidden className="absolute top-7 left-[10%] hidden h-3 w-[80%] md:block" viewBox="0 0 800 12" preserveAspectRatio="none">
        <path d="M0 6C120 3 260 9 400 6s280-3 400 0" fill="none" stroke="var(--color-line)" strokeWidth="2" strokeDasharray="6 8" filter="url(#sketch-line)" />
      </svg>
      {processSteps.map((step, i) => (
        <Reveal as="li" key={step.title} delay={i * 90} className="relative flex gap-4 md:block">
          <div className="relative z-10 grid h-16 w-16 shrink-0 place-items-center border border-line bg-cream">
            <SketchIcon name={step.icon} size={40} />
            <span className="font-hand absolute -top-3 -right-3 grid h-7 w-7 place-items-center bg-brand text-lg leading-none text-white">
              {i + 1}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-ink md:mt-4">{step.title}</h3>
            <p className="mt-1.5 text-sm text-graphite">{step.text}</p>
          </div>
        </Reveal>
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
    <section className="relative overflow-hidden bg-brand text-white">
      <SketchIcon
        name="chisel"
        size={260}
        className="pointer-events-none absolute -right-10 -bottom-16 opacity-15 [--sketch-accent:white] [--sketch-ink:white]"
      />
      <Container className="relative flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
        <Reveal className="max-w-xl">
          <PencilNote className="text-white/80">no obligation, just a price</PencilNote>
          <h2 className="mt-1 font-serif text-3xl font-semibold">{title}</h2>
          <p className="mt-3 text-white/85">{text}</p>
        </Reveal>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/quote" variant="light" arrow>
            Get a free quote
          </ButtonLink>
          <a href={site.whatsappHref} className="btn btn--dark">
            <SketchIcon name="chat" size={22} className="[--sketch-accent:white] [--sketch-ink:white]" />
            WhatsApp a photo
          </a>
        </div>
      </Container>
    </section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
            {item.q}
            <svg aria-hidden viewBox="0 0 20 20" width="18" height="18" className="shrink-0 text-brand transition-transform duration-300 group-open:rotate-45">
              <path d="M10 2v16 M2 10h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" filter="url(#sketch-line)" />
            </svg>
          </summary>
          <p className="mt-3 text-graphite">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Card linking to a service or section: photo, sketched icon badge, text. */
export function IconCard({
  href,
  icon,
  title,
  text,
  meta,
  cta,
  headingLevel: Heading = "h3",
}: {
  href: string;
  icon: IconName;
  title: string;
  text: string;
  meta?: string;
  cta?: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Link href={href} className="card group flex flex-col">
      <div className="overflow-hidden">
        <PhotoPlaceholder className="aspect-[3/2] transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      </div>
      <div className="relative flex flex-1 flex-col p-6 pt-10">
        <span className="absolute -top-8 left-6 grid h-16 w-16 place-items-center border border-line bg-cream transition-transform duration-500 group-hover:-rotate-3">
          <SketchIcon name={icon} size={42} />
        </span>
        <Heading className="font-serif text-xl font-semibold text-ink group-hover:text-brand">{title}</Heading>
        <p className="mt-2 text-graphite">{text}</p>
        {meta && <p className="mt-3 text-sm font-semibold text-ink">{meta}</p>}
        {cta && (
          <p className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-brand">
            {cta}
            <SketchIcon name="arrow" size={22} className="transition-transform duration-300 group-hover:translate-x-1" />
          </p>
        )}
      </div>
      <CornerMarks />
    </Link>
  );
}
