import { redirect } from "next/navigation";
import { ContentEditor } from "@/components/admin/content-editor";
import { adminBase, currentAdmin } from "@/lib/admin-auth";
import { getContent, getServicesWithPrices } from "@/lib/content";

export default async function AdminContentPage() {
  const base = await adminBase();
  if (!(await currentAdmin())) redirect(base);
  const [content, services] = await Promise.all([getContent(), getServicesWithPrices()]);
  return (
    <>
      <h1 className="font-serif text-3xl font-semibold">Site content</h1>
      <p className="mt-1 mb-6 text-sm text-graphite">Contact details, prices and the home page headline. Changes show on the site as soon as you save.</p>
      <ContentEditor
        content={content}
        services={services.map((s) => ({ slug: s.slug, name: s.name, fromPrice: s.fromPrice ?? "" }))}
      />
    </>
  );
}
