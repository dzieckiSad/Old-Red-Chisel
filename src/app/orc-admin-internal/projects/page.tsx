import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectPhoto } from "@/components/project-photo";
import { SketchIcon } from "@/components/sketch/icons";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { isSampleImage } from "@/lib/project-types";
import { getProjects } from "@/lib/projects";
import { uploadsAvailable } from "@/lib/uploads";
import { moveProjectAction, toggleProjectFlag } from "./actions";

export default async function AdminProjectsPage({ searchParams }: PageProps<"/orc-admin-internal/projects">) {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const { deleted } = await searchParams;
  const projects = await getProjects({ includeHidden: true });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold">Projects</h1>
        <Link href={`${base}/projects/new`} className="btn btn--primary">
          + New project
        </Link>
      </div>
      <p className="mt-2 text-sm text-graphite">Before-and-after work shown on the Projects page. ★ puts one on the home page.</p>
      {deleted && <p role="status" className="mt-4 text-sm font-medium">Project deleted.</p>}
      {!uploadsAvailable() && (
        <p className="mt-4 border-l-4 border-oak bg-white p-3 text-sm">
          This host doesn&apos;t keep uploaded files: set BLOB_READ_WRITE_TOKEN (Vercel Blob) and redeploy.
        </p>
      )}

      <ul className="mt-6 divide-y divide-line border border-line bg-white">
        {projects.map((p, i) => {
          const example = [p.before, p.after].some((img) => img && isSampleImage(img.url));
          return (
            <li key={p.id} className={`grid grid-cols-[80px_1fr] gap-4 p-3 sm:grid-cols-[80px_1.6fr_auto] sm:items-center ${p.hidden ? "bg-sand/40" : ""}`}>
              <ProjectPhoto image={p.after ?? p.before ?? p.photos[0]} alt="" sizes="80px" className={`aspect-[4/3] w-20 ${p.hidden ? "opacity-50" : ""}`} />
              <Link href={`${base}/projects/${p.id}`} className="group">
                <span className="block font-semibold group-hover:text-brand">
                  {p.title}
                  {p.hidden && <span className="ml-2 bg-ink/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase">Hidden</span>}
                  {p.featured && <span className="ml-2 bg-oak/20 px-1.5 py-0.5 text-[11px] font-semibold uppercase">Home page</span>}
                  {example && <span className="ml-2 bg-brand px-1.5 py-0.5 text-[11px] font-semibold text-white uppercase">Example</span>}
                </span>
                <span className="text-sm text-graphite">
                  {[p.type, p.place].filter(Boolean).join(" · ")}
                </span>
              </Link>
              <div className="col-start-2 flex flex-wrap items-center gap-1 sm:col-start-auto">
                <form action={moveProjectAction.bind(null, p.id!, "up")}>
                  <IconButton label="Move up" disabled={i === 0}>↑</IconButton>
                </form>
                <form action={moveProjectAction.bind(null, p.id!, "down")}>
                  <IconButton label="Move down" disabled={i === projects.length - 1}>↓</IconButton>
                </form>
                <form action={toggleProjectFlag.bind(null, p.id!, "featured")}>
                  <IconButton label={p.featured ? "Remove from home page" : "Show on home page"}>{p.featured ? "★" : "☆"}</IconButton>
                </form>
                <form action={toggleProjectFlag.bind(null, p.id!, "hidden")}>
                  <button type="submit" className="border border-line px-2.5 py-1.5 text-xs font-semibold hover:border-ink/40">
                    {p.hidden ? "Show" : "Hide"}
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
      {projects.length === 0 && (
        <div className="mt-6 flex flex-col items-center border border-line bg-white p-12 text-center">
          <SketchIcon name="camera" size={64} />
          <p className="font-hand mt-3 text-2xl text-graphite">no projects yet</p>
        </div>
      )}
    </>
  );
}

function IconButton({ label, disabled, children }: { label: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" aria-label={label} title={label} disabled={disabled} className="grid h-8 w-8 place-items-center border border-line text-sm hover:border-ink/40 disabled:opacity-30">
      {children}
    </button>
  );
}
