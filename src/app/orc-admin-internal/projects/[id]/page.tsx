import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProjectEditor } from "@/components/admin/project-editor";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { getProjectById } from "@/lib/projects";
import { deleteProjectAction } from "../actions";

export default async function EditProjectPage({ params, searchParams }: PageProps<"/orc-admin-internal/projects/[id]">) {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const { id } = await params;
  const project = /^[0-9a-f-]{36}$/i.test(id) ? await getProjectById(id) : null;
  if (!project) notFound();
  const { created } = await searchParams;

  return (
    <>
      <Link href={`${base}/projects`} className="text-sm font-semibold text-graphite hover:text-ink">← All projects</Link>
      <div className="mt-3 mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold">{project.title}</h1>
        {!project.hidden && (
          <a href={`/projects/${project.slug}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand underline">
            View on the site ↗
          </a>
        )}
      </div>
      {created && <p role="status" className="mb-4 text-sm font-medium">Project created.</p>}
      <ProjectEditor key={project.id} project={project} />
      <form action={deleteProjectAction.bind(null, project.id!)} className="mt-10 border-t border-line pt-6">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-brand">Delete this project…</summary>
          <p className="mt-3 text-sm text-graphite">This removes the project and its uploaded photos for good. To take it off the site for a while, use “Hide from the site” instead.</p>
          <button type="submit" className="btn btn--dark mt-3">Delete permanently</button>
        </details>
      </form>
    </>
  );
}
