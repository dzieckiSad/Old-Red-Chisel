import type { Metadata } from "next";
import { CtaBand } from "@/components/sections";
import { BeforeAfter } from "@/components/sketch/before-after";
import { Frame } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { Container, PageHeader, PhotoPlaceholder } from "@/components/ui";

export const metadata: Metadata = {
  title: "Our projects",
  description: "Kitchens, fitted wardrobes, renovations and outdoor work completed around Athlone and the Midlands.",
};

// TODO: replace with real projects (before/after photos, location, scope) from the CMS.
const projects = [
  { title: "Shaker kitchen with island", place: "Athlone", type: "Kitchen" },
  { title: "Sloped-ceiling fitted wardrobes", place: "Moate", type: "Wardrobes" },
  { title: "Alcove units and TV wall", place: "Ballinasloe", type: "Built-in" },
  { title: "Composite deck and pergola", place: "Roscommon", type: "Exterior" },
  { title: "Attic conversion", place: "Mullingar", type: "Conversion" },
  { title: "Under-stairs pull-out storage", place: "Longford", type: "Built-in" },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Recent work"
        intro="Every project here was built in our workshop and fitted by our own team. More photos coming soon."
      />
      <Container className="grid gap-x-8 gap-y-12 py-14 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal as="article" key={p.title} delay={(i % 3) * 90}>
            <Frame>
              <BeforeAfter
                className="aspect-[4/3]"
                label={`${p.title}: before and after`}
                before={<div className="plaster-placeholder h-full w-full" />}
                after={<PhotoPlaceholder className="h-full w-full" />}
              />
            </Frame>
            <p className="mt-4 text-xs font-semibold tracking-wider text-brand uppercase">{p.type}</p>
            <h2 className="mt-1 font-semibold text-ink">{p.title}</h2>
            <p className="font-hand text-xl leading-tight text-graphite">{p.place}</p>
          </Reveal>
        ))}
      </Container>
      <CtaBand title="Want something like this?" />
    </>
  );
}
