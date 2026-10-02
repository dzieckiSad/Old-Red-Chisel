import { ProjectPhoto } from "@/components/project-photo";
import { BeforeAfter } from "@/components/sketch/before-after";
import type { Project } from "@/lib/project-types";

/** Before/after slider when both photos exist, otherwise the one photo there is. */
export function ProjectVisual({ project: p, sizes, priority }: { project: Project; sizes: string; priority?: boolean }) {
  if (p.before && p.after) {
    return (
      <BeforeAfter
        className="aspect-[4/3]"
        label={`${p.title}: before and after`}
        before={<ProjectPhoto image={p.before} alt={`${p.title}, before`} sizes={sizes} priority={priority} className="h-full w-full" />}
        after={<ProjectPhoto image={p.after} alt={`${p.title}, after`} sizes={sizes} priority={priority} className="h-full w-full" />}
      />
    );
  }
  return <ProjectPhoto image={p.after ?? p.before ?? p.photos[0]} alt={p.title} sizes={sizes} priority={priority} className="aspect-[4/3]" />;
}
