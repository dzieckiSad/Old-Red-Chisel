import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectPhoto } from "@/components/project-photo";
import { ProjectVisual } from "@/components/project-visual";
import { CtaBand } from "@/components/sections";
import { type IconName, SketchIcon } from "@/components/sketch/icons";
import { CornerMarks, Frame, PencilNote } from "@/components/sketch/ornaments";
import { Reveal } from "@/components/sketch/reveal";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { getProject, getProjects } from "@/lib/projects";

// Projects can change from the admin panel; saves also refresh pages immediately.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return { title: `${project.title}, ${project.place}`, description: project.summary };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const others = (await getProjects()).filter((p) => p.slug !== project.slug).slice(0, 2);
  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: "pin", label: "Where", value: project.place },
    { icon: "clipboard", label: "Type of job", value: project.type },
    { icon: "chisel", label: "Materials", value: project.materials },
    { icon: "clock", label: "Time taken", value: project.duration },
  ].filter((f): f is { icon: IconName; label: string; value: string } => Boolean(f.value));

  return (
    <>
      <section className="border-b border-line bg-sand/60">
        <Container className="py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-graphite">
            <Link href="/projects" className="hover:text-brand">Projects</Link>
            {" / "}
            <span>{project.title}</span>
          </nav>
          <div className="mt-6 grid items-end gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <Eyebrow>{project.type}</Eyebrow>
              <h1 className="mt-2 font-serif text-4xl font-semibold text-ink sm:text-5xl">{project.title}</h1>
              {project.summary && <p className="mt-4 max-w-2xl text-lg text-graphite">{project.summary}</p>}
            </div>
            {project.place && <PencilNote className="text-3xl md:justify-self-end md:pb-2">{project.place}</PencilNote>}
          </div>
        </Container>
      </section>

      <Container className="grid items-start gap-12 py-12 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <Frame>
            <ProjectVisual project={project} sizes="(min-width: 1024px) 60vw, 100vw" priority />
          </Frame>
          {project.before && project.after && (
            <p className="font-hand mt-3 text-center text-xl text-graphite">drag the handle to compare</p>
          )}
        </Reveal>

        <Reveal delay={120} className="space-y-8">
          {facts.length > 0 && (
            <dl className="relative divide-y divide-line border border-line bg-white">
              {facts.map((f) => (
                <div key={f.label} className="flex items-center gap-4 p-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center border border-line bg-cream">
                    <SketchIcon name={f.icon} size={32} />
                  </span>
                  <span>
                    <dt className="text-sm text-graphite">{f.label}</dt>
                    <dd className="font-semibold text-ink">{f.value}</dd>
                  </span>
                </div>
              ))}
              <CornerMarks />
            </dl>
          )}
          {project.description && (
            <div className="space-y-4 text-lg text-graphite">
              {project.description.split(/\n\s*\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
          <ButtonLink href="/quote" arrow>
            Get a quote for something similar
          </ButtonLink>
        </Reveal>
      </Container>

      {project.photos.length > 0 && (
        <Container className="grid gap-6 pb-14 sm:grid-cols-2 lg:grid-cols-3">
          {project.photos.map((img, i) => (
            <Reveal key={img.url} delay={(i % 3) * 90}>
              <Frame className={i % 2 ? "rotate-1" : "-rotate-1"}>
                <ProjectPhoto image={img} alt={`${project.title}, photo ${i + 1}`} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3]" />
              </Frame>
            </Reveal>
          ))}
        </Container>
      )}

      {others.length > 0 && (
        <section className="border-t border-line bg-white">
          <Container className="py-14">
            <h2 className="font-serif text-3xl font-semibold text-ink">More projects</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {others.map((p) => (
                <Link key={p.slug} href={`/projects/${p.slug}`} className="card group block p-2.5">
                  <div className="overflow-hidden">
                    <ProjectPhoto image={p.after ?? p.before ?? p.photos[0]} alt={p.title} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[16/9] transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                  </div>
                  <div className="px-2 pt-4 pb-2">
                    <p className="text-xs font-semibold tracking-wider text-brand uppercase">{p.type}</p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-ink group-hover:text-brand">{p.title}</h3>
                    {p.place && <p className="font-hand text-xl leading-tight text-graphite">{p.place}</p>}
                  </div>
                  <CornerMarks />
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBand title="Want something like this?" />
    </>
  );
}
