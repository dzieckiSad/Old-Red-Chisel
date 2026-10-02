import Link from "next/link";
import { CtaBand, ProcessSteps } from "@/components/sections";
import { ButtonLink, CheckList, Container, PageHeader, PhotoPlaceholder, SectionHeading } from "@/components/ui";
import { type Service, getServices } from "@/lib/services";

const groupPaths: Record<Service["group"], string> = {
  bespoke: "/bespoke",
  build: "/build-renovate",
};

export function ServiceIndex({
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
      <Container className="grid gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
        {getServices(group).map((s) => (
          <Link
            key={s.slug}
            href={`${groupPaths[group]}/${s.slug}`}
            className="group overflow-hidden rounded-lg border border-line bg-white"
          >
            <PhotoPlaceholder className="aspect-[3/2] rounded-none" />
            <div className="p-6">
              <h2 className="font-serif text-xl font-semibold text-ink group-hover:text-brand">{s.name}</h2>
              <p className="mt-2 text-graphite">{s.summary}</p>
              {s.fromPrice && <p className="mt-3 text-sm font-semibold text-ink">{s.fromPrice}</p>}
            </div>
          </Link>
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

export function ServiceDetail({ service }: { service: Service }) {
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
            <h1 className="font-serif text-4xl font-semibold text-ink sm:text-5xl">{service.name}</h1>
            <p className="mt-4 text-lg text-graphite">{service.summary}</p>
            {service.fromPrice && (
              <p className="mt-4 inline-block rounded-md bg-sand px-3 py-1.5 font-semibold text-ink">
                {service.fromPrice}
              </p>
            )}
            <div className="mt-8">
              <h2 className="font-semibold text-ink">What we do</h2>
              <div className="mt-3">
                <CheckList items={service.includes} />
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/quote?type=${service.group}&service=${service.slug}`}>Get a free quote</ButtonLink>
              <ButtonLink href="/projects" variant="secondary">
                See our work
              </ButtonLink>
            </div>
          </div>
          <div className="grid gap-3">
            <PhotoPlaceholder label={`${service.name}: project photo`} className="aspect-[4/3]" />
            <div className="grid grid-cols-2 gap-3">
              <PhotoPlaceholder label="Before" className="aspect-square" />
              <PhotoPlaceholder label="After" className="aspect-square" />
            </div>
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
