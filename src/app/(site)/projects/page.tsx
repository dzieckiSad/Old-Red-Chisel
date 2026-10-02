import type { Metadata } from "next";
import Link from "next/link";
import { ProjectVisual } from "@/components/project-visual";
import { CtaBand } from "@/components/sections";
import { Frame } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { Container, PageHeader } from "@/components/ui";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Our projects",
  description: "Kitchens, fitted wardrobes, renovations and outdoor work completed around Athlone and the Midlands.",
};

// Projects can change from the admin panel; saves also refresh pages immediately.
export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Recent work"
        intro="Every project here was built in our workshop and fitted by our own team. Drag the handle to compare before and after."
      />
      <Container className="grid gap-x-8 gap-y-14 py-14 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal as="article" key={p.slug} delay={(i % 2) * 100}>
            <Frame>
              <ProjectVisual project={p} sizes="(min-width: 768px) 50vw, 100vw" />
            </Frame>
            <p className="mt-5 text-xs font-semibold tracking-wider text-brand uppercase">{p.type}</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
              <Link href={`/projects/${p.slug}`} className="hover:text-brand">{p.title}</Link>
            </h2>
            {p.place && <p className="font-hand text-2xl leading-tight text-graphite">{p.place}</p>}
            {p.summary && <p className="mt-2 text-graphite">{p.summary}</p>}
            <Link href={`/projects/${p.slug}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand">
              Read about this project <span aria-hidden>→</span>
            </Link>
          </Reveal>
        ))}
      </Container>
      <CtaBand title="Want something like this?" />
    </>
  );
}
