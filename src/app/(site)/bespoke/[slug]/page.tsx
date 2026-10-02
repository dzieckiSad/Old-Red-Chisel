import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/service-pages";
import { getService, getServices } from "@/lib/services";

export function generateStaticParams() {
  return getServices("bespoke").map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bespoke/[slug]">): Promise<Metadata> {
  const service = getService("bespoke", (await params).slug);
  return service ? { title: service.name, description: service.summary } : {};
}

export default async function BespokeServicePage({ params }: PageProps<"/bespoke/[slug]">) {
  const service = getService("bespoke", (await params).slug);
  if (!service) notFound();
  return <ServiceDetail service={service} />;
}
