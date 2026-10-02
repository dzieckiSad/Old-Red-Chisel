import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectEditor } from "@/components/admin/project-editor";
import { adminBase, currentAdmin } from "@/lib/admin-auth";

export default async function NewProjectPage() {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  return (
    <>
      <Link href={`${base}/projects`} className="text-sm font-semibold text-graphite hover:text-ink">← All projects</Link>
      <h1 className="mt-3 mb-6 font-serif text-3xl font-semibold">New project</h1>
      <ProjectEditor />
    </>
  );
}
