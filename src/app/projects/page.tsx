import type { Metadata } from "next";
import { CtaBand } from "@/components/sections";
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
      <Container className="grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <article key={p.title}>
            <div className="grid grid-cols-2 gap-2">
              <PhotoPlaceholder label="Before" className="aspect-square" />
              <PhotoPlaceholder label="After" className="aspect-square" />
            </div>
            <p className="mt-3 text-xs font-semibold tracking-wider text-brand uppercase">{p.type}</p>
            <h2 className="mt-1 font-semibold text-ink">{p.title}</h2>
            <p className="text-sm text-graphite">{p.place}</p>
          </article>
        ))}
      </Container>
      <CtaBand title="Want something like this?" />
    </>
  );
}
