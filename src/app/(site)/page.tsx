import {
  CtaBand,
  FaqList,
  IconCard,
  ProcessSteps,
  ProductCard,
  TrustBar,
} from "@/components/sections";
import { BeforeAfter } from "@/components/sketch/before-after";
import type { IconName } from "@/components/sketch/icons";
import { Frame, PencilNote, RulerDivider, SketchUnderline } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { ButtonLink, Container, PhotoPlaceholder, SectionHeading } from "@/components/ui";
import { getFeaturedProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

const doors: { href: string; icon: IconName; title: string; text: string; cta: string }[] = [
  {
    href: "/shop",
    icon: "plane",
    title: "Shop handmade pieces",
    text: "Bedside lockers, home bars, sideboards and shelving, ready to go or made to order.",
    cta: "Browse the shop",
  },
  {
    href: "/bespoke",
    icon: "kitchen",
    title: "Bespoke kitchens & wardrobes",
    text: "Kitchens, fitted wardrobes and built-in storage designed and made to fit your room.",
    cta: "Explore bespoke",
  },
  {
    href: "/build-renovate",
    icon: "extension",
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
      <section className="relative overflow-hidden bg-sand/60">
        <Container className="grid items-center gap-12 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
          <Reveal>
            <p className="text-sm font-semibold text-brand">Handmade in Athlone · Serving the Midlands</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold text-ink sm:text-5xl lg:text-6xl">
              Joinery made <SketchUnderline>by hand.</SketchUnderline> Homes improved by the same hands.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-graphite">
              From a single bedside locker to a bespoke kitchen or a full renovation, built in our
              own workshop and fitted by our own team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/quote" arrow>
                Get a free quote
              </ButtonLink>
              <ButtonLink href="/shop" variant="outline">
                Shop handmade pieces
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative">
            <Frame className="rotate-1">
              <PhotoPlaceholder className="aspect-[4/3]" />
            </Frame>
            <PencilNote className="absolute -bottom-9 left-4 -rotate-2">made in our workshop, fitted in your home</PencilNote>
          </Reveal>
        </Container>
      </section>

      <TrustBar />

      <section>
        <Container className="py-16">
          <Reveal>
            <SectionHeading
              eyebrow="What we do"
              title={<>One workshop, <SketchUnderline>three ways</SketchUnderline> to work with us</>}
            />
          </Reveal>
          <div className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-3">
            {doors.map((door, i) => (
              <Reveal key={door.href} delay={i * 100}>
                <IconCard {...door} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <RulerDivider />

      <section className="bg-white">
        <Container className="py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Reveal>
              <SectionHeading eyebrow="From the workshop" title="Popular in the shop" />
            </Reveal>
            <ButtonLink href="/shop" variant="outline" arrow>
              View all products
            </ButtonLink>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-10 py-16 md:grid-cols-[1fr_1.4fr] md:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="Recent work"
              title={<>See the <SketchUnderline>difference</SketchUnderline></>}
              intro="Drag the handle to compare. A selection of kitchens, wardrobes and renovations around the Midlands."
            />
            <div className="mt-8">
              <ButtonLink href="/projects" variant="outline" arrow>
                See all projects
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Frame caption="alcove units, Athlone">
              <BeforeAfter
                className="aspect-[4/3]"
                label="Alcove units: before and after"
                before={<div className="plaster-placeholder h-full w-full" />}
                after={<PhotoPlaceholder className="h-full w-full" />}
              />
            </Frame>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-16">
          <Reveal>
            <SectionHeading
              eyebrow="How we work"
              title="A clear process from first photo to final fitting"
            />
          </Reveal>
          <div className="mt-12">
            <ProcessSteps />
          </div>
        </Container>
      </section>

      <RulerDivider />

      <section>
        <Container className="grid gap-12 py-16 md:grid-cols-2 md:items-center">
          <Reveal>
            <Frame caption="the workshop" className="-rotate-1">
              <PhotoPlaceholder className="aspect-[4/3]" />
            </Frame>
          </Reveal>
          <Reveal delay={120}>
            <SectionHeading
              eyebrow="Made in our workshop"
              title={<>Real timber, real joints, <SketchUnderline>real people</SketchUnderline></>}
              intro="Everything we sell and fit is made by hand in our Athlone workshop, not flat-packed from a warehouse. The people who build your piece are the people who fit it."
            />
            <div className="mt-6">
              <ButtonLink href="/about" variant="outline" arrow>
                About us
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-white">
        <Container className="py-16">
          <Reveal>
            <SectionHeading eyebrow="Questions" title="Frequently asked" />
          </Reveal>
          <div className="mt-8 max-w-3xl">
            <FaqList items={faqs} />
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
