import Link from "next/link";
import { CtaBand, IconCard, ProcessSteps } from "@/components/sections";
import { BeforeAfter } from "@/components/sketch/before-after";
import { SketchIcon } from "@/components/sketch/icons";
import { Frame, SketchCircle } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { ButtonLink, CheckList, Container, PageHeader, PhotoPlaceholder, SectionHeading } from "@/components/ui";
import { getServicesWithPrices } from "@/lib/content";
import type { Service } from "@/lib/services";

const groupPaths: Record<Service["group"], string> = {
  bespoke: "/bespoke",
  build: "/build-renovate",
};

export async function ServiceIndex({
  group,
  eyebrow,
  title,
  intro,
}: {
  group: Service["group"];
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />
      <Container className="grid gap-x-6 gap-y-10 py-14 md:grid-cols-2 lg:grid-cols-3">
        {(await getServicesWithPrices()).filter((s) => s.group === group).map((s, i) => (
          <Reveal key={s.slug} delay={(i % 3) * 90}>
            <IconCard
              href={`${groupPaths[group]}/${s.slug}`}
              icon={s.icon}
              title={s.name}
              text={s.summary}
              meta={s.fromPrice}
              cta="Find out more"
              headingLevel="h2"
            />
          </Reveal>
        ))}
      </Container>
      <section className="bg-white">
        <Container className="py-14">
          <SectionHeading eyebrow="How we work" title="From first photo to final fitting" />
          <div className="mt-8">
            <ProcessSteps />
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}

export async function ServiceDetail({ service: base }: { service: Service }) {
  // "from" price as set in the admin panel (Content).
  const service = (await getServicesWithPrices()).find((s) => s.slug === base.slug) ?? base;
  const parentPath = groupPaths[service.group];
  return (
    <>
      <Container className="py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-graphite">
          <Link href={parentPath} className="hover:text-brand">
            {service.group === "bespoke" ? "Bespoke" : "Build & Renovate"}
          </Link>
        </nav>
        <div className="mt-6 grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <SketchIcon name={service.icon} size={64} />
            <h1 className="mt-3 font-serif text-4xl font-semibold text-ink sm:text-5xl">{service.name}</h1>
            <p className="mt-4 text-lg text-graphite">{service.summary}</p>
            {service.fromPrice && (
              <p className="mt-5 text-xl font-semibold text-ink">
                <SketchCircle>{service.fromPrice}</SketchCircle>
              </p>
            )}
            <div className="mt-8">
              <h2 className="font-semibold text-ink">What we do</h2>
              <div className="mt-3">
                <CheckList items={service.includes} />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/quote?type=${service.group}&service=${service.slug}`} arrow>Get a free quote</ButtonLink>
              <ButtonLink href="/projects" variant="outline">
                See our work
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-4">
            <Frame caption={`${service.name.toLowerCase()}, Athlone`}>
              <PhotoPlaceholder className="aspect-[4/3]" />
            </Frame>
            <Frame>
              <BeforeAfter
                className="aspect-[16/9]"
                before={<div className="plaster-placeholder h-full w-full" />}
                after={<PhotoPlaceholder className="h-full w-full" />}
              />
            </Frame>
          </div>
        </div>
      </Container>
      <section className="bg-white">
        <Container className="py-14">
          <SectionHeading eyebrow="How we work" title="A clear process, start to finish" />
          <div className="mt-8">
            <ProcessSteps />
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
