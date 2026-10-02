import Link from "next/link";
import {
  CtaBand,
  FaqList,
  ProcessSteps,
  ProductCard,
  TrustBar,
} from "@/components/sections";
import { ButtonLink, Container, PhotoPlaceholder, SectionHeading } from "@/components/ui";
import { getFeaturedProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

const doors = [
  {
    href: "/shop",
    title: "Shop handmade pieces",
    text: "Bedside lockers, home bars, sideboards and shelving, ready to go or made to order.",
    cta: "Browse the shop",
  },
  {
    href: "/bespoke",
    title: "Bespoke kitchens & wardrobes",
    text: "Kitchens, fitted wardrobes and built-in storage designed and made to fit your room.",
    cta: "Explore bespoke",
  },
  {
    href: "/build-renovate",
    title: "Build & renovate",
    text: "Interiors, decking, extensions and small jobs, from one room to the whole house.",
    cta: "See building work",
  },
];

const faqs = [
  {
    q: "Which areas do you cover?",
    a: `We're based in ${site.address.locality} and work across ${site.serviceArea.join(", ")}. For bigger projects further away, just ask.`,
  },
  {
    q: "How much does a fitted wardrobe or kitchen cost?",
    a: "Fitted wardrobes start from around €1,800 and bespoke kitchens from around €8,500. Send us a photo and rough sizes for a price range within 48 hours.",
  },
  {
    q: "Do you charge for a survey?",
    a: `A home survey costs €${site.surveyFee}, and we take it off your order if you go ahead.`,
  },
  {
    q: "Can I order a shop piece in a different size?",
    a: "Yes. Every piece is made in our own workshop, so we can change sizes, timber and finish. Use “Need a different size?” on any product page.",
  },
  {
    q: "Do you deliver and assemble?",
    a: "We deliver with our own van. Assembly and fitting can be added at checkout, or you can collect from the workshop for free.",
  },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <section className="bg-sand/60">
        <Container className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-semibold text-brand">Handmade in Athlone · Serving the Midlands</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold text-ink sm:text-5xl">
              Joinery made by hand. Homes improved by the same hands.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-graphite">
              From a single bedside locker to a bespoke kitchen or a full renovation, built in our
              own workshop and fitted by our own team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/quote">Get a free quote</ButtonLink>
              <ButtonLink href="/shop" variant="secondary">
                Shop handmade pieces
              </ButtonLink>
            </div>
          </div>
          <PhotoPlaceholder label="Hero photo: workshop or finished kitchen" className="aspect-[4/3]" />
        </Container>
      </section>

      <TrustBar />

      <section>
        <Container className="py-16">
          <SectionHeading
            eyebrow="What we do"
            title="One workshop, three ways to work with us"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {doors.map((door) => (
              <Link
                key={door.href}
                href={door.href}
                className="group overflow-hidden rounded-lg border border-line bg-white"
              >
                <PhotoPlaceholder className="aspect-[3/2] rounded-none" />
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-ink">{door.title}</h3>
                  <p className="mt-2 text-graphite">{door.text}</p>
                  <p className="mt-4 text-sm font-semibold text-brand group-hover:underline">
                    {door.cta} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="From the workshop" title="Popular in the shop" />
            <Link href="/shop" className="text-sm font-semibold text-brand hover:underline">
              View all products →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <SectionHeading
            eyebrow="Recent work"
            title="Before and after"
            intro="A selection of kitchens, wardrobes and renovations around the Midlands."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {["Kitchen, Athlone", "Fitted wardrobes, Moate", "Decking, Roscommon"].map((label) => (
              <PhotoPlaceholder key={label} label={label} className="aspect-[4/3]" />
            ))}
          </div>
          <div className="mt-8">
            <ButtonLink href="/projects" variant="secondary">
              See all projects
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-16">
          <SectionHeading
            eyebrow="How we work"
            title="A clear process from first photo to final fitting"
          />
          <div className="mt-10">
            <ProcessSteps />
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <PhotoPlaceholder label="Workshop photo or short video" className="aspect-[4/3]" />
          <div>
            <SectionHeading
              eyebrow="Made in our workshop"
              title="Real timber, real joints, real people"
              intro="Everything we sell and fit is made by hand in our Athlone workshop, not flat-packed from a warehouse. The people who build your piece are the people who fit it."
            />
            <div className="mt-6">
              <ButtonLink href="/about" variant="secondary">
                About us
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-16">
          <SectionHeading eyebrow="Questions" title="Frequently asked" />
          <div className="mt-8 max-w-3xl">
            <FaqList items={faqs} />
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
