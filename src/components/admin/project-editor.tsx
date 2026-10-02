"use client";

import { type ReactNode, startTransition, useActionState, useState } from "react";
import { type ProjectFormState, saveProject, uploadProjectImage } from "@/app/orc-admin-internal/projects/actions";
import { adminInput } from "@/components/admin/forms";
import { ProjectPhoto } from "@/components/project-photo";
import { SketchIcon } from "@/components/sketch/icons";
import { type Project, type ProjectImage, projectTypes } from "@/lib/project-types";
import { shrinkImage } from "@/lib/shrink-image";
import { slugify } from "@/lib/slug";

export function ProjectEditor({ project }: { project?: Project }) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProject, {});
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(project));
  const [before, setBefore] = useState<ProjectImage | null>(project?.before ?? null);
  const [after, setAfter] = useState<ProjectImage | null>(project?.after ?? null);
  const [photos, setPhotos] = useState<ProjectImage[]>(project?.photos ?? []);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const errors = state.fieldErrors ?? {};

  async function upload(original: File) {
    setUploadError("");
    setUploading((n) => n + 1);
    try {
      const file = await shrinkImage(original, 2000, 0.85);
      const data = new FormData();
      data.set("file", file);
      data.set("name", title);
      const result = await uploadProjectImage(data);
      if (!result.url) setUploadError(result.error ?? "Upload failed.");
      return result.url ? { url: result.url } : null;
    } catch {
      setUploadError("Upload failed. The photo may be too large.");
      return null;
    } finally {
      setUploading((n) => n - 1);
    }
  }

  async function addPhotos(files: FileList | null) {
    for (const f of Array.from(files ?? []).slice(0, 12 - photos.length)) {
      const img = await upload(f);
      if (img) setPhotos((list) => [...list, img]);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        // Submit by hand so the fields keep what was typed (a form action would reset them).
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]"
    >
      <input type="hidden" name="id" value={project?.id ?? ""} />
      <input type="hidden" name="before" value={JSON.stringify(before)} />
      <input type="hidden" name="after" value={JSON.stringify(after)} />
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />

      <div className="space-y-6">
        {state.error && <p role="alert" className="border-l-4 border-brand bg-brand/5 p-3 text-sm text-brand-dark">{state.error}</p>}

        <Box title="Before & after">
          <p className="text-xs text-graphite">
            Take both photos from the same spot, so the slider on the site lines up. Example images are marked “Example image” on the site until you replace them.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <PhotoSlot label="Before" image={before} title={title} onChange={setBefore} upload={upload} />
            <PhotoSlot label="After" image={after} title={title} onChange={setAfter} upload={upload} />
          </div>
          {uploadError && <p className="text-sm font-medium text-brand">{uploadError}</p>}
        </Box>

        <Box title="Project">
          <Field label="Title" error={errors.title}>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              className={adminInput}
            />
          </Field>
          <Field label="Web address" error={errors.slug} hint={`oldredchisel.ie/projects/${slug || "…"}`}>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugEdited(true);
              }}
              className={`${adminInput} font-mono text-sm`}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Town" hint="Where the job was, e.g. Athlone.">
              <input name="place" defaultValue={project?.place} maxLength={100} className={adminInput} />
            </Field>
            <Field label="Type" error={errors.type}>
              <select name="type" defaultValue={project?.type || projectTypes[0]} className={adminInput}>
                {projectTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Short summary" hint="One or two lines, shown on the projects page.">
            <input name="summary" defaultValue={project?.summary} maxLength={300} className={adminInput} />
          </Field>
          <Field label="The story" hint="What the customer needed and what we built. An empty line starts a new paragraph.">
            <textarea name="description" rows={7} defaultValue={project?.description} className={adminInput} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Materials">
              <input name="materials" defaultValue={project?.materials} placeholder="Painted shaker doors, solid oak tops" className={adminInput} />
            </Field>
            <Field label="Time taken">
              <input name="duration" defaultValue={project?.duration} placeholder="Made in 2 weeks, fitted in 2 days" className={adminInput} />
            </Field>
          </div>
        </Box>

        <Box title="More photos">
          <p className="text-xs text-graphite">Details, other angles, work in progress. Shown under the story.</p>
          {photos.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((img, i) => (
                <li key={img.url} className="border border-line bg-cream p-1.5">
                  <ProjectPhoto image={img} alt="" sizes="160px" className="aspect-square" />
                  <button type="button" onClick={() => setPhotos((l) => l.filter((_, k) => k !== i))} className="mt-1.5 block w-full text-center text-xs font-semibold text-brand">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="flex cursor-pointer items-center gap-4 border-2 border-dashed border-line bg-cream/50 p-4 text-sm hover:border-brand">
            <SketchIcon name="camera" size={40} />
            <span>
              <span className="block font-semibold">{uploading ? `Uploading ${uploading}…` : "Add photos"}</span>
              <span className="text-graphite">JPG, PNG or WebP, up to 12 photos</span>
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
          </label>
        </Box>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6">
        <Box title="Visibility">
          <Check name="featured" defaultChecked={project?.featured} label="Show on the home page" hint="In “See the difference”. Needs both photos." />
          <Check name="hidden" defaultChecked={project?.hidden} label="Hide from the site" hint="Keeps the project but takes it off the site." />
        </Box>
        {state.saved && !pending && (
          <p role="status" className="flex items-center gap-2 text-sm font-medium"><SketchIcon name="tick" size={20} /> Saved. The site is updated.</p>
        )}
        <button type="submit" disabled={pending || uploading > 0} className="btn btn--primary w-full disabled:opacity-60">
          {pending ? "Saving…" : uploading > 0 ? "Waiting for photos…" : project ? "Save changes" : "Create project"}
        </button>
      </div>
    </form>
  );
}

function PhotoSlot({
  label,
  image,
  title,
  onChange,
  upload,
}: {
  label: string;
  image: ProjectImage | null;
  title: string;
  onChange: (img: ProjectImage | null) => void;
  upload: (file: File) => Promise<ProjectImage | null>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="border border-line bg-cream p-2">
      <p className="font-hand mb-1 text-xl leading-none">{label.toLowerCase()}</p>
      <ProjectPhoto image={image} alt={`${title} ${label.toLowerCase()}`} sizes="320px" className="aspect-[4/3]" />
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <label className="cursor-pointer font-semibold text-ink hover:text-brand">
          {busy ? "Uploading…" : image ? "Replace photo" : "Add photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              const img = await upload(file);
              setBusy(false);
              if (img) onChange(img);
            }}
          />
        </label>
        {image && (
          <button type="button" onClick={() => onChange(null)} className="font-semibold text-brand">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border border-line bg-white p-5">
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-graphite">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-brand">{error}</span>}
    </label>
  );
}

function Check({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex gap-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4 accent-brand" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-graphite">{hint}</span>}
      </span>
    </label>
  );
}
